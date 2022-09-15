import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { ApolloError } from 'apollo-server-express'
import * as moment from 'moment'
import { FilterQuery, LeanDocument, Model } from 'mongoose'
import { CODE_NUMBER_LENGTH } from 'src/constant'
import { IDFactory, pad, StringFactory } from 'src/helper'
import {
  EnumOrderStatus,
  EnumPaymentMethod,
  GridOption,
  InputOptionsQueryOrder,
  InputOrder,
  IOrder,
  Order,
  OrderDetail,
  OrdersWithPaginate,
  QuantityOrderForType,
} from 'src/schema'

import { IContext } from '../base-modules/graphql/gql.type'
import { MyContext } from '../base-modules/my-context/my-context'
import { ServiceManager } from '../base-modules/service-manager/service-manager'
import { CustomerService } from '../Customer/Customer.service'
import {
  CustomerDocument,
  CustomerEntity,
} from '../Customer/schemas/Customer.schema'
import { DeliveryAddressService } from '../DeliveryAddress/DeliveryAddress.service'
import {
  DeliveryAddressDocument,
  DeliveryAddressEntity,
} from '../DeliveryAddress/schemas/DeliveryAddress.schema'
import {
  EnumDiscountType,
  OrderDetailDocument,
  OrderDetailEntity,
} from '../OrderDetail/schemas/OrderDetail.schema'
import { StockService } from '../Stock/Stock.service'
import {
  StockModelDocument,
  StockModelEntity,
} from '../StockModel/schemas/StockModel.schema'
import { SettingService } from './../Setting/Setting.service'
import {
  OrderDetailOfOderNotFoundError,
  OrderNotFoundError,
  WareHouseNotFoundError,
} from './order.error'
import { OrderDocument, OrderEntity } from './schemas/order.schema'

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(OrderEntity.name)
    public orderModel: Model<OrderDocument>,
    @InjectModel(StockModelEntity.name)
    private stockModelMoldel: Model<StockModelDocument>,
    @InjectModel(OrderDetailEntity.name)
    private orderDetailMoldel: Model<OrderDetailDocument>,
    @InjectModel(DeliveryAddressEntity.name)
    private deliveryAddressMoldel: Model<DeliveryAddressDocument>,
    @InjectModel(CustomerEntity.name)
    private customerMoldel: Model<CustomerDocument>,
    private readonly serviceManager: ServiceManager,
    private settingService: SettingService,
    private stockService: StockService,
  ) {}

  async ordersWithPaginate(args: {
    filterOptions: InputOptionsQueryOrder
    gridOptions: GridOption
  }) {
    // ~~~~~~~~~~~~~~~~~ extract args
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    const { filterOptions = {}, gridOptions = {} } = args
    const {
      startRow: gridStartRow,
      endRow: gridEndRow,
      // 2 fields below used on grid with group
      // rowGroupCols: gridRowGroupCols = [],
      // groupKeys: gridGroupKeys = [],
      sortModel: gridSortInput = [],
    } = gridOptions
    const gridFilterInput: Partial<
      Record<string, Record<string, any> & { filter: any }>
    > = gridOptions.filterModel || {}

    // ~~~~~~~~~~~~~~~~ create FilterQuery for main table - Order in this case
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // separate fields used for foreign key
    // const { idStockModel } = filterOptions
    // delete filterOptions.idStockModel
    // create FilterQuery Order
    const filterOrder: FilterQuery<OrderDocument>['$and'] = [
      { isDeleted: { $ne: true } },
    ]
    // apply tự động vào filter
    // chỉ áp dụng các field khớp tên giữa graphql và db, nếu ko khớp tên cần tự xử lý riêng
    Object.entries(filterOptions).forEach(([filterKey, filterValue]) => {
      switch (typeof filterValue) {
        case 'boolean':
        case 'string':
        case 'number':
          filterOrder.push({ [filterKey]: filterValue })
          break
        // case array
        case 'object':
          if (filterValue?.length)
            filterOrder.push({ [filterKey]: { $in: filterValue } })
          break

        default:
          break
      }
    })

    // dựa vào các field dành cho khóa ngoại để update filterUser
    // this query not used query on foreign key yet

    // ~~~ validate filter - sort input of grid (only allow filter or sort on below fields)
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // TODO còn cách nào làm hard code bên dưới phụ thuộc vào class gốc ko
    const fieldsFilterOnOrder = {
      code: 'code',
      orderedAt: 'orderedAt',
    }
    const fieldsFilterOnCustomer = {
      'customer.phoneNumber': 'phoneNumber',
      'customer.fullName': 'unsignedFullName',
    }
    const fieldsFilterOnDeliveryAddress = {
      'deliveryAddress.phoneNumber': 'phoneNumber',
      'deliveryAddress.fullName': 'unsignedFullName',
    }
    const fieldsSortOnOrder = {
      _id: '_id',
      orderedAt: 'orderedAt',
      code: 'code',
      status: 'status',
    }
    const fieldsSortOnCustomer = {
      'customer.phoneNumber': 'phoneNumber',
      'customer.fullName': 'fullName',
    }
    const fieldsSortOnDeliveryAddress = {
      'deliveryAddress.phoneNumber': 'phoneNumber',
      'deliveryAddress.fullName': 'fullName',
    }
    Object.keys(gridFilterInput).forEach((eachFieldKey) => {
      if (
        !fieldsFilterOnOrder[eachFieldKey] &&
        !fieldsFilterOnCustomer[eachFieldKey] &&
        !fieldsFilterOnDeliveryAddress[eachFieldKey]
      )
        // TODO use custom err with code
        throw new ApolloError(
          `filter ${eachFieldKey} không có trong ds hỗ trợ. ${Object.keys(
            fieldsFilterOnOrder,
          )} ${Object.keys(fieldsFilterOnCustomer)} ${Object.keys(
            fieldsFilterOnDeliveryAddress,
          )}`,
        )
    })
    gridSortInput.forEach((eachSort) => {
      if (
        !fieldsSortOnOrder[eachSort.colId] &&
        !fieldsSortOnCustomer[eachSort.colId] &&
        !fieldsSortOnDeliveryAddress[eachSort.colId]
      )
        throw new ApolloError(
          `sort ${eachSort.colId} không có trong ds hỗ trợ. ${Object.keys(
            fieldsSortOnOrder,
          )} ${Object.keys(fieldsSortOnCustomer)} ${Object.keys(
            fieldsSortOnDeliveryAddress,
          )}`,
        )
      if (eachSort.sort !== 'asc' && eachSort.sort !== 'desc')
        throw new ApolloError(`sort ${eachSort.sort} không hợp lệ, asc or desc`)
    })

    // ~~~~~~~~~~~~~~~~~ resolve filter of grid
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // phân hoạch filter trên các bảng tương ứng
    // TODO bring type to somewhere
    const filtersOnOrder: Record<
      string,
      Record<string, any> & { filter: any }
    > = {}
    const filtersOnCustomer: Record<
      string,
      Record<string, any> & { filter: any }
    > = {}
    const filtersOnDeliveryAddress: Record<
      string,
      Record<string, any> & { filter: any }
    > = {}
    Object.entries(gridFilterInput).forEach(([filterKey, filterValue]) => {
      if (fieldsFilterOnOrder[filterKey])
        filtersOnOrder[filterKey] = filterValue
      if (fieldsFilterOnCustomer[filterKey])
        filtersOnCustomer[filterKey] = filterValue
      if (fieldsFilterOnDeliveryAddress[filterKey])
        filtersOnDeliveryAddress[filterKey] = filterValue
    })

    //
    // cập nhật filter cho Order
    Object.entries(gridFilterInput).forEach((eachFilter) => {
      const [filterKey, filterValue] = eachFilter
      if (!(filterValue?.filter || filterValue?.dateFrom)) return
      switch (filterKey) {
        case fieldsFilterOnOrder.code:
          filterOrder.push({
            [filterKey]: {
              $regex: new RegExp(
                `${StringFactory.formatToUnsigned(filterValue.filter).replace(
                  /[.*+?^${}()|[\]\\]/g,
                  '\\$&',
                )}`,
              ),
            },
          })
          break
        case fieldsFilterOnOrder.orderedAt:
          const date = moment(filterValue.dateFrom)
          if (!isNaN(date?.valueOf())) {
            filterOrder.push({
              [filterKey]: {
                $gte: date.startOf('day').valueOf(),
                $lte: date.endOf('day').valueOf(),
              },
            })
          }
          break
        default:
          break
      }
    })

    // cập nhật FilterQuery search cho Customer
    if (Object.entries(filtersOnCustomer).length) {
      const filterSearchCustomer: FilterQuery<CustomerDocument> = {}
      Object.entries(filtersOnCustomer).forEach((eachFilter) => {
        const [filterKey, filterValue] = eachFilter
        switch (filterKey) {
          case 'customer.phoneNumber':
          case 'customer.fullName':
            filterSearchCustomer[fieldsFilterOnCustomer[filterKey]] = {
              $regex: new RegExp(
                `${StringFactory.formatToUnsigned(filterValue.filter).replace(
                  /[.*+?^${}()|[\]\\]/g,
                  '\\$&',
                )}`,
                'i',
              ),
            }
            break

          default:
            break
        }
      })

      const customerAllowedIds: string[] = (
        await this.serviceManager
          .get(CustomerService)
          .customerModel.find(filterSearchCustomer)
          .select({ _id: 1 })
          .lean()
      ).map((customer) => customer._id)

      filterOrder.push({ idCustomer: { $in: customerAllowedIds } })
    }

    // cập nhật FilterQuery search cho DeliveryAddress
    if (Object.entries(filtersOnDeliveryAddress).length) {
      const filterSearchDeliveryAddress: FilterQuery<DeliveryAddressDocument> =
        {}
      Object.entries(filtersOnDeliveryAddress).forEach((eachFilter) => {
        const [filterKey, filterValue] = eachFilter
        switch (filterKey) {
          case 'deliveryAddress.phoneNumber':
          case 'deliveryAddress.fullName':
            filterSearchDeliveryAddress[
              fieldsFilterOnDeliveryAddress[filterKey]
            ] = {
              $regex: new RegExp(
                `${StringFactory.formatToUnsigned(filterValue.filter).replace(
                  /[.*+?^${}()|[\]\\]/g,
                  '\\$&',
                )}`,
                'i',
              ),
            }
            break

          default:
            break
        }
      })
      const deliveryAllowedIds: string[] = (
        await this.serviceManager
          .get(DeliveryAddressService)
          .deliveryAddressModel.find(filterSearchDeliveryAddress)
          .select({ _id: 1 })
          .lean()
      ).map((customer) => customer._id)
      filterOrder.push({ idDeliveryAddress: { $in: deliveryAllowedIds } })
    }

    // ~~~~~~~~~~~~~~~~~ compute sort obj on foreign key of grid
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    // case sort on table customer
    const sortForeignObj: Partial<Record<'addFields' | 'sort', any>> = {}
    if (fieldsSortOnCustomer[gridSortInput[0]?.colId]) {
      const colSortOn = gridSortInput[0]
      const customerSorted = await this.serviceManager
        .get(CustomerService)
        .customerModel.find({})
        .sort({
          [fieldsSortOnCustomer[colSortOn.colId]]: colSortOn.sort,
        })
        .select({ _id: true })
        .lean()

      if (customerSorted.length) {
        const customerSortedIds = customerSorted.map((customer) => customer._id)
        sortForeignObj.addFields = {
          __order: { $indexOfArray: [customerSortedIds, '$idCustomer'] },
        }
        sortForeignObj.sort = {
          __order: 1,
          _id: 1,
        }
      }
    }

    // case sort on table deliveryAddress
    if (fieldsSortOnDeliveryAddress[gridSortInput[0]?.colId]) {
      const colSortOn = gridSortInput[0]
      const deliveryAddressSorted = await this.serviceManager
        .get(DeliveryAddressService)
        .deliveryAddressModel.find({})
        .sort({
          [fieldsSortOnDeliveryAddress[colSortOn.colId]]: colSortOn.sort,
        })
        .select({ _id: true })
        .lean()

      if (deliveryAddressSorted.length) {
        const deliveryAddressSortedIds = deliveryAddressSorted.map(
          (deliveryAddress) => deliveryAddress._id,
        )
        sortForeignObj.addFields = {
          __order: {
            $indexOfArray: [deliveryAddressSortedIds, '$idDeliveryAddress'],
          },
        }
        sortForeignObj.sort = {
          __order: 1,
          _id: 1,
        }
      }
    }

    // ~~~~~~ add filter from groupKeys
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // gridGroupKeys.forEach((groupValue, index) => {
    //   const colGroup = gridRowGroupCols[index]
    //   if (!colGroup)
    //     throw new ApolloError(`Không tìm thấy group cho '${groupValue}'`)
    //   filterUser.push({ [colGroup.id]: groupValue })
    // })

    // ~~~~~~~~~~~~~~~~~ apply get data
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    let aggregateObj = this.orderModel.aggregate().match({ $and: filterOrder })
    // ~~~~~~~~~~~~~~~~~~ apply groupBy
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // const colNeedGroupBy = gridRowGroupCols[gridGroupKeys.length]
    // if (colNeedGroupBy) {
    //   aggregateObj = aggregateObj.group({
    //     _id: `$${colNeedGroupBy.id}`,
    //     [colNeedGroupBy.id]: { $first: `$${colNeedGroupBy.id}` },
    //     childCount: { $sum: 1 },
    //   })
    // }

    // ~~~~~~~~~~~~~~~ resolve pageInfo
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // TODO move to resolve field
    const totalDocument = await this.orderModel
      .countDocuments({ $and: filterOrder })
      .lean()

    // ~~~~~~~~~~~~~~~~~~~~~ apply sort of grid
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    if (sortForeignObj.sort) {
      aggregateObj = aggregateObj
        .addFields(sortForeignObj.addFields)
        .sort(sortForeignObj.sort)
    } else {
      const sortObj: Partial<
        Record<keyof typeof fieldsSortOnOrder, 'asc' | 'desc'>
      > = {}
      gridSortInput.forEach((eachSortField) => {
        const { colId, sort } = eachSortField
        sortObj[colId] = sort
      })
      // trong trường hợp có các dòng không phân biệt dc thứ tự thì có thể dựa thêm vào _id
      if (!sortObj.orderedAt) sortObj.orderedAt = 'desc'
      // apply sort
      aggregateObj = aggregateObj.sort(sortObj)
    }

    // ~~~~~~~~~~~~~~~ apply pagination of grid
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // validate and apply pagination info
    if (typeof gridStartRow === 'number') {
      if (gridStartRow < 0)
        throw new ApolloError(`startRow = ${gridStartRow} không hợp lệ`)
      aggregateObj = aggregateObj.skip(gridStartRow)
    }

    if (typeof gridEndRow === 'number') {
      if (gridEndRow < gridStartRow)
        throw new ApolloError(`endRow = ${gridEndRow} không hợp lệ`)
      aggregateObj = aggregateObj.limit(gridEndRow - gridStartRow)
    }

    // ~~~~~~~~~~~~~~~~~ compute result
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    const output: OrdersWithPaginate = {
      totalRows: totalDocument,
      // TODO not rememner why not resolve pageInfo
      // pageInfo: {
      //   currentPage,
      //   sizePage,
      //   totalRows: totalDocument,
      //   totalPages: totalPage,
      // },
    }

    const orders = await aggregateObj.exec()
    output.orders = orders

    return output
  }

  public async createOrder(
    args: { input: IOrder },
    ctx: IContext,
  ): Promise<any> {
    try {
      const currentUserSlim = await ctx?.authManager.getCurrentUserSlim()
      const currentCodeNumberOrder = await this.findMaxCodeNumber()

      const prefixCode = 'SO'
      const currentYear = moment().format('YY')

      const code = `${prefixCode}-${currentYear}-${pad(
        currentCodeNumberOrder + 1,
        CODE_NUMBER_LENGTH,
      )}`
      const newOrder = {
        _id: IDFactory.generateID(),
        code,
        codeNumber: currentCodeNumberOrder + 1,
        idCustomer: args.input.idCustomer,
        idDeliveryAddress: args.input.idDeliveryAddress,
        status: EnumOrderStatus.AWAIT_CONFIRMATION,
        paymentMethod: EnumPaymentMethod.COD,
        orderedAt: moment().valueOf(),
        createdAt: moment().valueOf(),
        createdBy: currentUserSlim,
      }
      const dataStockModels = await this.stockModelMoldel
        .find({
          _id: { $in: args.input.arrProduct?.map((i) => i.idStockModel) },
        })
        .lean()

      const dataHashStockModel: {
        [key: string]: LeanDocument<StockModelDocument>
      } = {}
      dataStockModels.forEach((i) => {
        dataHashStockModel[i._id] = i
      })

      const arrNewOrderDetail = args.input.arrProduct.map((p) => {
        const stockModelFinded = dataHashStockModel[p.idStockModel]
        const priceDefault =
          stockModelFinded?.prices?.find(
            (item) => item.idPriceType === 'default',
          )?.price?.[0] || 0
        const newOrderDetail = {
          _id: IDFactory.generateID(),
          idOrder: newOrder._id,
          idStockModel: stockModelFinded?._id,
          count: p.count,
          quantity: [p.count],
          quantityString: p.count,
          isFree: false,
          salePrice: [priceDefault],
          discountType: EnumDiscountType.PRICE,
          discountValue: 0,
          total: priceDefault * (p.count || 0),
          createdAt: moment().valueOf(),
          createdBy: currentUserSlim,
        }
        return newOrderDetail
      })
      await Promise.all([
        this.orderModel.create(newOrder),
        this.orderDetailMoldel.insertMany(arrNewOrderDetail),
      ])
      return true
    } catch (error) {
      throw new ApolloError(error)
    }
  }

  // order for admin
  public async createOrder2(input: InputOrder): Promise<any> {
    try {
      const { idCustomer, products, infoDelivery } = input
      const parseInfoDelivery = JSON.parse(infoDelivery)
      let newDelivery: any = {}

      const currentUserSlim = await this.serviceManager
        .get(MyContext)
        .get()
        .authManager.getCurrentUserSlim()

      const currentCodeNumberOrder = await this.findMaxCodeNumber()

      const prefixCode = 'SO'
      const currentYear = moment().format('YY')

      const code = `${prefixCode}-${currentYear}-${pad(
        currentCodeNumberOrder + 1,
        CODE_NUMBER_LENGTH,
      )}`

      const infoDelivery_Old = parseInfoDelivery?.deliveryOld || ''
      const infoDelivery_New = JSON.stringify({
        fullName: parseInfoDelivery?.fullName || '',
        phoneNumber: parseInfoDelivery?.phoneNumber || '',
        detailAddress: parseInfoDelivery?.detailAddress || '',
      })

      if (infoDelivery_Old !== infoDelivery_New) {
        const parseInfoDelivery_New = JSON.parse(infoDelivery_New)
        newDelivery = new DeliveryAddressEntity({
          _id: IDFactory.generateID(),
          idCustomer,
          ...parseInfoDelivery_New,
          createdBy: currentUserSlim,
        })
      }

      const deliveryAddress = await this.deliveryAddressMoldel
        .findOne({
          idCustomer,
          isDefault: true,
        })
        .lean()

      const newOrder: Partial<OrderEntity> = {
        _id: IDFactory.generateID(),
        idCustomer,
        idDeliveryAddress: newDelivery?._id || deliveryAddress?._id || '',
        code,
        codeNumber: currentCodeNumberOrder + 1,
        status: EnumOrderStatus.AWAIT_CONFIRMATION,
        paymentMethod: EnumPaymentMethod.COD,
        orderedAt: moment().valueOf(),
        estimatedDeliveryAt: undefined,
        deliveryAt: undefined,
        note: parseInfoDelivery?.note || '',
        createdAt: moment().valueOf(),
        createdBy: currentUserSlim,
      }

      const stockModels = await this.stockModelMoldel
        .find({ _id: { $in: products?.map((i) => i.idStockModel) } })
        .lean()

      const hashStockModels: {
        [key: string]: LeanDocument<StockModelDocument>
      } = {}

      stockModels.forEach((stockModel) => {
        hashStockModels[stockModel._id] = stockModel
      })

      const newOrderDetail = products.map((product) => {
        const foundStockModel = hashStockModels[product.idStockModel]

        const priceDefault =
          foundStockModel?.prices?.find(
            (item) => item.idPriceType === 'default',
          )?.price?.[0] || 0

        const newOrderDetail: Partial<OrderDetail> = {
          _id: IDFactory.generateID(),
          idOrder: newOrder._id,
          idStockModel: foundStockModel?._id,
          count: product.count,
          quantity: [product.count],
          quantityString: product.count.toString(),
          isFree: false,
          salePrice: [priceDefault],
          discountType: EnumDiscountType.PRICE,
          discountValue: 0,
          total: priceDefault * (product.count || 0),
          note: product.note,
          createdAt: moment().valueOf(),
          createdBy: currentUserSlim,
        }
        return newOrderDetail
      })

      const [createdOrder] = await Promise.all([
        this.orderModel.create(newOrder),
        this.orderDetailMoldel.insertMany(newOrderDetail),
        newDelivery?._id
          ? this.deliveryAddressMoldel.create(newDelivery)
          : null,
      ])

      return createdOrder
    } catch (error) {
      throw new ApolloError(error)
    }
  }

  public async updateOrder2(
    _id: string,
    input: InputOrder,
  ): Promise<OrderDocument> {
    try {
      const { idCustomer, products } = input

      const currentUserSlim = await this.serviceManager
        .get(MyContext)
        .get()
        .authManager.getCurrentUserSlim()

      const inputOrder: Partial<Order> = {
        idCustomer,
        updatedAt: moment().valueOf(),
        updatedBy: currentUserSlim,
      }

      const stockModels = await this.stockModelMoldel
        .find({ _id: { $in: products?.map((i) => i.idStockModel) } })
        .lean()

      const hashStockModels: {
        [key: string]: LeanDocument<StockModelDocument>
      } = {}

      stockModels.forEach((stockModel) => {
        hashStockModels[stockModel._id] = stockModel
      })

      const newOrderDetail = products?.map((product) => {
        const foundStockModel = hashStockModels[product.idStockModel]

        const priceDefault =
          foundStockModel?.prices?.find(
            (item) => item.idPriceType === 'default',
          )?.price?.[0] || 0

        const newOrderDetail: Partial<OrderDetail> = {
          _id: IDFactory.generateID(),
          idOrder: _id,
          idStockModel: foundStockModel?._id,
          count: product.count,
          quantity: [product.count],
          quantityString: product.count.toString(),
          isFree: false,
          salePrice: [priceDefault],
          discountType: EnumDiscountType.PRICE,
          discountValue: 0,
          total: priceDefault * (product.count || 0),
          note: product.note,
          createdAt: moment().valueOf(),
          createdBy: currentUserSlim,
        }
        return newOrderDetail
      })

      /** delete all order detail by order */
      await this.orderDetailMoldel.find({ idOrder: _id }).remove().exec()

      const [updatedOrder] = await Promise.all([
        this.orderModel.findOneAndUpdate(
          { _id },
          { $set: { ...inputOrder } },
          { new: true },
        ),
        this.orderDetailMoldel.insertMany(newOrderDetail),
      ])

      return updatedOrder
    } catch (error) {
      throw new ApolloError(error)
    }
  }

  public async updateOrderStatus(
    _ids: string[],
    status: EnumOrderStatus,
    // updateQuery?: UpdateQuery<OrderDocument>,
  ): Promise<boolean> {
    const currentUserSlim = await this.serviceManager
      .get(MyContext)
      .get()
      .authManager.getCurrentUserSlim()

    const updatedDeliveryAt =
      status === EnumOrderStatus.SUCCESS
        ? { deliveryAt: moment().valueOf() }
        : {}

    const result = await this.orderModel.updateMany(
      { _id: { $in: _ids } },
      {
        $set: {
          status,
          updatedAt: moment().valueOf(),
          updatedBy: currentUserSlim,
          ...updatedDeliveryAt,
        },
      },
      { new: true },
    )

    const orderLength = result.n || 0
    const orderUpdatedLength = result.nModified || 0

    return orderLength > 0 && orderUpdatedLength > 0
  }

  public async cancelOrder2(
    _id: string,
    reasonCancel: string = '',
    context: any,
  ): Promise<boolean> {
    const currentUserSlim = await this.serviceManager
      .get(MyContext)
      .get()
      .authManager.getCurrentUserSlim()
    const currentStaff = await context?.authManager.getCurrentStaff()

    const updatedBy = {
      ...currentUserSlim,
      fullName: currentStaff?.TenNhanVien || null,
    }

    const result = await this.orderModel.updateMany(
      { _id },
      {
        $set: {
          reasonCancel,
          status: EnumOrderStatus.CANCELED,
          updatedAt: moment().valueOf(),
          updatedBy,
        },
      },
      { new: true },
    )

    const orderLength = result.n || 0
    const orderUpdatedLength = result.nModified || 0

    return orderLength > 0 && orderUpdatedLength > 0
  }

  public async findMaxCodeNumber(): Promise<number> {
    const order = await this.orderModel
      .findOne()
      .sort({ codeNumber: -1 })
      .limit(1)

    return order?.codeNumber || 0
  }

  public async findOrderMatchAny(
    matchConditions: Partial<OrderEntity>[],
  ): Promise<OrderDocument> {
    const order = await this.orderModel.findOne({
      $and: [{ $or: matchConditions }],
    })
    return order
  }

  public async getOrderInfo(args: any): Promise<any> {
    const { idCustomer, status } = args
    const condition: any = {
      idCustomer,
    }
    if (status) {
      condition['$and'] = [
        {
          status,
        },
      ]
    }
    const orders = await this.orderModel
      .find(condition)
      .sort({ createdAt: -1 })
      .lean()

    const [orderDetails, deliveryAddress]: [any, any] = await Promise.all([
      this.orderDetailMoldel
        .find({
          idOrder: { $in: orders?.map((e) => e._id) },
        })
        .lean(),
      this.deliveryAddressMoldel
        .find({
          _id: { $in: orders?.map((e) => e.idDeliveryAddress) },
        })
        .lean(),
    ])

    const stockModels = await this.stockModelMoldel
      .find({
        _id: { $in: orderDetails?.map((e) => e.idStockModel) },
      })
      .lean()

    const dataHasStockModel = new Map(
      stockModels.map((stockModel) => [stockModel._id, stockModel]),
    )

    const dataHasDeliveryAddress = new Map(
      deliveryAddress.map((add) => [add._id, add]),
    )

    orderDetails?.forEach((e) => {
      e['stockModel'] = dataHasStockModel.get(e.idStockModel)
    })

    orders?.forEach((e) => {
      const details = orderDetails?.filter((el) => el?.idOrder === e?._id)
      e['orderDetail'] = details?.length ? details : []
      e['deliveryAddress'] = dataHasDeliveryAddress.get(e.idDeliveryAddress)
    })

    return orders
  }

  public async cancelOrder(args: any, context: any): Promise<any> {
    try {
      const { id, input } = args
      const currentUserSlim = await context?.authManager.getCurrentUserSlim()
      const order = await this.orderModel
        .findOne({
          _id: id,
        })
        .lean()

      if (!order?._id || order.status !== EnumOrderStatus.AWAIT_CONFIRMATION)
        throw new OrderNotFoundError()

      await this.orderModel.updateOne(
        {
          _id: order._id,
        },
        {
          $set: {
            status: EnumOrderStatus.CANCELED,
            customerReasonCancel: input,
            customerCancelAt: moment().valueOf(),
            customerCancelBy: currentUserSlim,
          },
        },
      )
      return true
    } catch (error) {
      throw new ApolloError(error)
    }
  }

  public async getOrderById(args: any): Promise<any> {
    const { _id } = args
    const order = await this.orderModel
      .findOne({
        _id,
      })
      .lean()

    if (!order?._id) {
      throw new ApolloError('order not found!')
    }

    const [orderDetails, deliveryAddress, customer]: [any, any, any] =
      await Promise.all([
        this.orderDetailMoldel
          .find({
            idOrder: order._id,
          })
          .lean(),
        this.deliveryAddressMoldel
          .findOne({
            _id: order?.idDeliveryAddress,
          })
          .lean(),
        this.customerMoldel
          .findOne({
            _id: order?.idCustomer,
          })
          .lean(),
      ])

    const stockModels = await this.stockModelMoldel
      .find({
        _id: { $in: orderDetails?.map((e) => e.idStockModel) },
      })
      .lean()

    const dataHasStockModel = new Map(
      stockModels.map((stockModel) => [stockModel._id, stockModel]),
    )

    orderDetails?.forEach((e) => {
      e['stockModel'] = dataHasStockModel.get(e.idStockModel)
    })

    order['orderDetail'] = orderDetails?.length ? orderDetails : []
    order['deliveryAddress'] = deliveryAddress
    order['customer'] = customer

    return order
  }

  public async getQuantityOderForType(): Promise<QuantityOrderForType[]> {
    try {
      const data: any[] = await this.orderModel.aggregate([
        { $group: { _id: '$status', quantity: { $sum: 1 } } },
        { $project: { quantity: 1, type: '$_id' } },
      ])
      return data
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('error', error)
      throw new ApolloError(error)
    }
  }

  public async confirmOrder(args: any, context: any): Promise<any> {
    try {
      const { id } = args
      const currentUserSlim = await context?.authManager.getCurrentUserSlim()
      const order = await this.orderModel
        .findOne({
          _id: id,
        })
        .lean()

      if (!order?._id || order.status !== EnumOrderStatus.AWAIT_CONFIRMATION)
        throw new OrderNotFoundError()

      await this.orderModel.updateOne(
        {
          _id: order._id,
        },
        {
          $set: {
            status: EnumOrderStatus.IN_PROGRESS,
            updatedAt: moment().valueOf(),
            updatedBy: currentUserSlim,
          },
        },
      )
      return order
    } catch (error) {
      throw new ApolloError(error)
    }
  }

  async shipOrder(args: any, context: any): Promise<boolean> {
    const { _id, input } = args
    const currentUserSlim = await context?.authManager.getCurrentUserSlim()
    const currentOder = await this.orderModel.findOne({
      _id,
      status: EnumOrderStatus.IN_PROGRESS,
    })
    if (!currentOder) throw new OrderNotFoundError()
    // check warehouse
    const setting = await this.settingService.getSetting()
    if (!setting?.ecommerce?.idWarehouse) {
      throw new WareHouseNotFoundError()
    }
    const listOderDetail = await this.orderDetailMoldel.find({
      idOrder: _id,
    })
    if (listOderDetail.length < 1) throw new OrderDetailOfOderNotFoundError()

    // check and subtract inventory
    const checkInventory = await this.stockService.checkInventory(
      setting?.ecommerce?.idWarehouse,
      _id,
    )
    if (checkInventory) {
      for (const orderDetail of listOderDetail) {
        await this.stockService.getStockRetail(
          setting?.ecommerce?.idWarehouse,
          orderDetail?._id,
          orderDetail?.idStockModel,
        )
      }
      const dataUpdate = JSON.parse(input)
      const updateOrderStatus = await this.orderModel.updateOne(
        {
          _id,
        },
        {
          $set: {
            ...dataUpdate,
            status: EnumOrderStatus.SHIPPING,
            updatedAt: moment().valueOf(),
            updatedBy: currentUserSlim,
          },
        },
      )
      return !!updateOrderStatus
    }
    return false
  }

  public async confirmFailedOrder(args: any, context: any): Promise<any> {
    try {
      const { id, reasonFailed } = args
      const currentUserSlim = await context?.authManager.getCurrentUserSlim()
      const order = await this.orderModel
        .findOne({
          _id: id,
        })
        .lean()

      if (!order?._id || order.status !== EnumOrderStatus.SHIPPING)
        throw new OrderNotFoundError()

      await this.orderModel.updateOne(
        {
          _id: order._id,
        },
        {
          $set: {
            status: EnumOrderStatus.FAILED,
            reasonFailed,
            failedAt: moment().valueOf(),
            failedBy: currentUserSlim,
          },
        },
      )
      return order
    } catch (error) {
      throw new ApolloError(error)
    }
  }

  public async confirmSuccessOrder(args: any, context: any): Promise<any> {
    try {
      const { id } = args
      const currentUserSlim = await context?.authManager.getCurrentUserSlim()
      const order = await this.orderModel
        .findOne({
          _id: id,
        })
        .lean()

      if (!order?._id || order.status !== EnumOrderStatus.SHIPPING)
        throw new OrderNotFoundError()

      await this.orderModel.updateOne(
        {
          _id: order._id,
        },
        {
          $set: {
            deliveryAt: moment().valueOf(),
            status: EnumOrderStatus.SUCCESS,
            updatedAt: moment().valueOf(),
            updatedBy: currentUserSlim,
          },
        },
      )
      return order
    } catch (error) {
      throw new ApolloError(error)
    }
  }
}
