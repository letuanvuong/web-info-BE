import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { ApolloError } from 'apollo-server-express'
import * as moment from 'moment'
import { FilterQuery, Model } from 'mongoose'
import {
  BEST_RELATED_PRODUCTS_LIMIT,
  BEST_SELLING_PRODUCTS_LIMIT,
  DATABASE_COLLECTION_NAME,
} from 'src/constant'
import { StringFactory } from 'src/helper'
import { generateSlug } from 'src/helper'
import { MapStockModelRelatedService } from 'src/modules/MapStockModelRelated/MapStockModelRelated.service'
import {
  EnumCategoriesStatus,
  EnumEcomStockModelTag,
  EnumStockModelStatus,
  FilterStockModelInput,
  InputOptionsQueryStockModel,
  SearchStockModelInput,
  SortStockModelInput,
  StockModelInput,
  StockModelPagination,
  StockModelPaginationTotal,
} from 'src/schema'

import { MyContext } from '../base-modules/my-context/my-context'
import { ServiceManager } from '../base-modules/service-manager/service-manager'
import { EcomCategoriesNotFoundError } from '../EcomCategories/EcomCategories.error'
import {
  EcomCategoriesDocument,
  EcomCategoriesEntity,
} from '../EcomCategories/schemas/EcomCategories.schema'
import { MapServiceProductService } from '../MapServiceProduct/MapServiceProduct.service'
import {
  OrderDetailDocument,
  OrderDetailEntity,
} from '../OrderDetail/schemas/OrderDetail.schema'
import { ThuTuSinhMaService } from '../ThuTuSinhMa/ThuTuSinhMa.service'
import {
  StockModelDocument,
  StockModelEntity,
} from './schemas/StockModel.schema'
import {
  StockModelByEcomSlugExistedError,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  StockModelCodeExistedError,
  StockModelNameExistedError,
} from './StockModel.error'
@Injectable()
export class StockModelService {
  constructor(
    @InjectModel(StockModelEntity.name)
    private stockModel: Model<StockModelDocument>,
    @InjectModel(EcomCategoriesEntity.name)
    private readonly ecomCategories: Model<EcomCategoriesDocument>,
    @InjectModel(OrderDetailEntity.name)
    private readonly orderDetailModal: Model<OrderDetailDocument>,
    private readonly serviceManager: ServiceManager,
    private readonly mapStockModelRelatedService: MapStockModelRelatedService,
    private readonly mapServiceProductService: MapServiceProductService,
    private readonly thuTuSinhMaService: ThuTuSinhMaService,
  ) {}

  async getStockModelById(_id: string): Promise<StockModelDocument> {
    return await this.stockModel.findOne({ _id }).lean()
  }

  async stockModels(filterOptions: InputOptionsQueryStockModel) {
    const filterStockModel: FilterQuery<StockModelDocument>['$and'] = [
      { _id: { $ne: null } },
    ]
    // apply tự động vào filter
    // chỉ áp dụng các field khớp tên giữa graphql và db, nếu ko khớp tên cần tự xử lý riêng
    Object.entries(filterOptions).forEach(([filterKey, filterValue]) => {
      switch (typeof filterValue) {
        case 'boolean':
        case 'string':
        case 'number':
          filterStockModel.push({ [filterKey]: filterValue })
          break
        // case array
        case 'object':
          if (filterValue?.length)
            filterStockModel.push({ [filterKey]: { $in: filterValue } })
          break

        default:
          break
      }
    })

    const result = await this.stockModel.find({ $and: filterStockModel }).lean()
    return result
  }

  async getStockModels(): Promise<StockModelDocument[]> {
    const currentUser = await this.serviceManager
      .get(MyContext)
      .get()
      .authManager.getCurrentUser()
    const allowGuestCondition = !currentUser ? { allowGuest: true } : {}
    const result = await this.stockModel
      .find({
        isEcommerce: true,
        ecomStatus: EnumStockModelStatus.Public,
        ...allowGuestCondition,
      })
      .sort({ ecomPublicAt: -1 })
      .exec()

    return result
  }

  async getRandomStockModels(
    limit: number = BEST_SELLING_PRODUCTS_LIMIT,
  ): Promise<StockModelDocument[]> {
    let result = []
    const currentUser = await this.serviceManager
      .get(MyContext)
      .get()
      .authManager.getCurrentUser()
    const allowGuestCondition = !currentUser ? { allowGuest: true } : {}
    const stockModelBestSelling: any = await this.stockModel
      .find({
        isEcommerce: true,
        ecomStatus: EnumStockModelStatus.Public,
        ...allowGuestCondition,
      })
      .lean()

    const orderDetails = await this.orderDetailModal
      .find({
        idStockModel: {
          $in: stockModelBestSelling?.map((e) => e._id),
        },
      })
      .lean()
    stockModelBestSelling?.forEach((e) => {
      const getOrderDetails = orderDetails?.filter(
        (detail) => detail?.idStockModel === e?._id,
      )
      e['totalOrderDetail'] = getOrderDetails.reduce(
        (t, a) => (t += Number(a.count) || 0),
        0,
      )
    })

    const sortDataStockModel = stockModelBestSelling?.sort(
      (a, b) => b.totalOrderDetail - a.totalOrderDetail,
    )
    result = sortDataStockModel
    if (result.length < limit) {
      const stockModels = await this.stockModel
        .find({
          isEcommerce: true,
          ecomStatus: EnumStockModelStatus.Public,
          _id: {
            $nin: result?.map((e) => e._id),
          },
          ...allowGuestCondition,
        })
        .limit(limit - result.length)
        .lean()
      result = result.concat(stockModels)
    }

    return result.flat(1)
  }

  async getStockModelBySlugProduct(
    ecomSlug: string,
  ): Promise<StockModelDocument> {
    const currentUser = await this.serviceManager
      .get(MyContext)
      .get()
      .authManager.getCurrentUser()
    const allowGuestCondition = !currentUser ? { allowGuest: true } : {}
    const result = await this.stockModel
      .findOne({
        ecomSlug,
        isEcommerce: true,
        ecomStatus: EnumStockModelStatus.Public,
        ...allowGuestCondition,
      })
      .sort({ ecomPublicAt: -1 })
      .exec()

    return result
  }

  async getRelatedProducts(
    ecomSlug: string,
    productSlug: string,
  ): Promise<StockModelDocument[]> {
    /** 1: get ecom category of slug */
    const ecomCategory = await this.ecomCategories.findOne({
      Slug: ecomSlug,
      Status: EnumCategoriesStatus.PUBLIC,
    })

    if (!ecomCategory) throw new EcomCategoriesNotFoundError()

    /** 2: get stock models of ecom category */
    const currentUser = await this.serviceManager
      .get(MyContext)
      .get()
      .authManager.getCurrentUser()
    const allowGuestCondition = !currentUser ? { allowGuest: true } : {}
    const currentStockModels = await this.stockModel
      .find({
        ecomSlug: { $ne: productSlug },
        idEcomCategory: ecomCategory._id,
        isEcommerce: true,
        ecomStatus: EnumStockModelStatus.Public,
        ...allowGuestCondition,
      })
      .limit(BEST_RELATED_PRODUCTS_LIMIT)
      .sort({ ecomPublicAt: -1 })
      .exec()

    let parentCategory = []

    /** 3: check stock model length */
    if (currentStockModels?.length < BEST_RELATED_PRODUCTS_LIMIT) {
      /** 3.1: get stock models of other ecom category of parent */
      parentCategory = await this.ecomCategories
        .aggregate([
          { $match: { Status: EnumCategoriesStatus.PUBLIC } },
          {
            $lookup: {
              from: DATABASE_COLLECTION_NAME.ECOMCATEGORIES,
              localField: 'CategoryParent_Id',
              foreignField: '_id',
              as: 'parentCategory',
            },
          },
          { $unwind: '$parentCategory' },
          {
            $match: {
              _id: { $ne: ecomCategory._id },
              'parentCategory._id': ecomCategory?.CategoryParent_Id,
            },
          },
          {
            $lookup: {
              from: DATABASE_COLLECTION_NAME.STOCK_MODELS,
              localField: '_id',
              foreignField: 'idEcomCategory',
              pipeline: [
                {
                  $match: {
                    isEcommerce: true,
                    ecomStatus: EnumStockModelStatus.Public,
                    ...allowGuestCondition,
                  },
                },
              ],
              as: 'otherStockModels',
            },
          },
        ])
        .limit(BEST_RELATED_PRODUCTS_LIMIT - currentStockModels?.length)
        .exec()
    }

    const otherStockModels = parentCategory?.[0]?.otherStockModels || []

    const result = [...currentStockModels, ...otherStockModels]

    return result
  }

  async getStockModelBySlugEcomCategoryPagination(
    page: number,
    limit: number,
    search: [SearchStockModelInput],
    filter: [FilterStockModelInput],
    sort: [SortStockModelInput],
  ): Promise<StockModelPagination> {
    return new Promise(async (rel, rej) => {
      try {
        const query: any = await this.renderQueryPaginationBySlugEcomCategory(
          filter,
          search,
        )
        if (!page || page < 1) page = 1
        if (!limit) limit = 10
        const sortData = {}
        sort?.map((e) => {
          sortData[e?.fieldSort] = e?.sort
        })

        const data: any[] = await this.stockModel.aggregate([
          {
            $match: query,
          },
          {
            $lookup: {
              from: DATABASE_COLLECTION_NAME.ECOMCATEGORIES,
              localField: 'idEcomCategory',
              foreignField: '_id',
              as: 'ecomCategory',
            },
          },
          { $addFields: { pricesCopy: '$prices' } },
          { $unwind: '$ecomCategory' },
          { $unwind: '$pricesCopy' },
          { $match: { 'pricesCopy.idPriceType': 'default' } },
          {
            $project: {
              _id: 1,
              code: 1,
              name: 1,
              prices: 1,
              ecomSlug: 1,
              ecomImages: 1,
              ecomPublicAt: 1,
              ecomCategory: 1,
              ecomShortDescription: 1,
              unitPrice: { $first: '$pricesCopy.price' },
            },
          },
          { $sort: sort ? sortData : { ecomPublicAt: -1 } },
          {
            $skip: (page - 1) * limit,
          },
          {
            $limit: limit,
          },
        ])

        rel({
          currentPage: page,
          data,
        })
      } catch (error) {
        rej(error)
      }
    })
  }

  async getStockModelBySlugEcomCategoryPaginationTotal(
    page: number,
    limit: number,
    search: [SearchStockModelInput],
    filter: [FilterStockModelInput],
  ): Promise<StockModelPaginationTotal> {
    return new Promise(async (rel, rej) => {
      try {
        const query: any = await this.renderQueryPaginationBySlugEcomCategory(
          filter,
          search,
        )
        const total = await this.stockModel.find(query).countDocuments()
        rel({
          totalRows: total,
          totalPages: Math.ceil(total / limit),
          currentPage:
            page > Math.ceil(total / limit) ? Math.ceil(total / limit) : page,
        })
      } catch (error) {
        rej(error)
      }
    })
  }

  async renderQueryPaginationBySlugEcomCategory(
    filter: [FilterStockModelInput],
    search: [SearchStockModelInput],
  ) {
    const skip = false
    const fieldsSearch = ['unsignName']
    const fieldsForeignSearch = []

    // filter
    const filterObject = {}
    if (filter) {
      for (const e of filter) {
        filterObject[e?.fieldFilter] = { $in: e?.values }
        if (e.fieldFilter === 'categorySlug') {
          const idsCategories = []
          const category = await this.ecomCategories.findOne({
            Slug: { $in: e?.values },
            Status: EnumCategoriesStatus.PUBLIC,
          })
          // if (!category) throw new EcomCategoriesNotFoundError()
          if (category) {
            idsCategories.push(category?._id)
            if (!category?.CategoryParent_Id) {
              const categoryChilds = await this.ecomCategories.find({
                CategoryParent_Id: category?._id,
                Status: EnumCategoriesStatus.PUBLIC,
              })
              const ids = categoryChilds?.map((i) => i._id)
              idsCategories.push(...ids)
            }
          }
          filterObject['idEcomCategory'] = {
            $in: idsCategories,
          }
          delete filterObject['categorySlug']
        }
      }
    }
    // search
    const searchForeignKey = {}
    const foreignKey = {}
    const foreignKeyOr = []
    let or =
      !search || search.length < 1
        ? [{}]
        : search
            .filter((s) => {
              return (
                s.fieldSearch &&
                fieldsSearch.includes(s.fieldSearch) &&
                s.textSearch
              )
            }) // lọc các field
            .map((s) => {
              if (!s?.fieldSearch || !s?.textSearch) return null
              if (s?.fieldSearch === 'unsignName') {
                s.textSearch = StringFactory.formatToUnsigned(s.textSearch)
              }

              // đưa các khóa ngoại vào object searchForeignKey
              if (fieldsForeignSearch.includes(s?.fieldSearch)) {
                searchForeignKey[s?.fieldSearch] = s.textSearch
                return null
              }

              // more...

              return {
                [s?.fieldSearch]: {
                  $regex: new RegExp(
                    `${s?.textSearch?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                    'siu',
                  ),
                },
              }
            })
            .filter((s) => s)
            ?.flat()
    if (or.length < 1) or = [{}]

    // duyệt các khóa ngoại searchForeignKey, search lấy ids và gán câu query cho từng khóa ngoại vào ForeignKey
    for await (const fieldKey of Object.keys(searchForeignKey)) {
      // const ids = []
      switch (fieldKey) {
        // more...
        default:
          break
      }
    }
    const currentUser = await this.serviceManager
      .get(MyContext)
      .get()
      .authManager.getCurrentUser()
    const allowGuestCondition = !currentUser ? { allowGuest: true } : {}
    return skip
      ? { _id: { $in: [] } }
      : Object.assign(
          {},
          {
            isEcommerce: true,
            ...allowGuestCondition,
            ecomStatus: EnumStockModelStatus.Public,
            $and: or,
            ...foreignKey,
          },
          foreignKeyOr.length > 0 ? { $or: [...foreignKeyOr] } : {},
          filterObject,
        )
  }

  // TODO: refactor - viết hàm dùng chung @params [oldEcomTags] [newEcomTags]
  async createLatestProductById(
    idStockModel: string,
  ): Promise<StockModelDocument> {
    const currentUserSlim = await this.serviceManager
      .get(MyContext)
      .get()
      .authManager.getCurrentUserSlim()

    const result = await this.stockModel.findOneAndUpdate(
      { _id: idStockModel },
      {
        $set: {
          updatedAt: Date.now(),
          updatedBy: currentUserSlim,
        },
        $push: { ecomTags: EnumEcomStockModelTag.New },
      },
      { new: true },
    )
    return result
  }

  async deleteLatestProductById(
    idStockModel: string,
  ): Promise<StockModelDocument> {
    const currentUserSlim = await this.serviceManager
      .get(MyContext)
      .get()
      .authManager.getCurrentUserSlim()

    const result = await this.stockModel.findOneAndUpdate(
      { _id: idStockModel },
      {
        $set: {
          updatedAt: Date.now(),
          updatedBy: currentUserSlim,
        },
        $pull: { ecomTags: EnumEcomStockModelTag.New },
      },
      { new: true },
    )
    return result
  }

  async findStockModelMatchAny(
    matchConditions: Partial<StockModelEntity>[],
  ): Promise<StockModelDocument> {
    const result = await this.stockModel.findOne({
      $and: [{ $or: matchConditions }],
    })
    return result
  }

  async findStockModelByFilter(
    filter: FilterQuery<StockModelDocument>,
    projection: any = {},
  ) {
    return this.stockModel.find(filter).select(projection).lean().exec()
  }

  renderQueryPagination(
    filter: [FilterStockModelInput],
    search: [SearchStockModelInput],
  ) {
    const skip = false

    // filter
    const filterObject = {}
    if (filter) {
      for (const e of filter) {
        filterObject[e?.fieldFilter] = { $in: e?.values }
      }
    }

    // search
    let searchArr =
      !search || search.length < 1
        ? [{}]
        : search
            .filter((s) => s.fieldSearch && s.textSearch)
            .map((s) => {
              if (!s?.fieldSearch || !s?.textSearch) {
                return null
              }

              if (['createdAt']?.includes(s?.fieldSearch)) {
                const date = moment(s.textSearch)
                if (isNaN(date?.valueOf())) return null
                return {
                  [s?.fieldSearch]: {
                    $gte: date.startOf('day').valueOf(),
                    $lte: date.endOf('day').valueOf(),
                  },
                }
              }

              return {
                [s?.fieldSearch]: {
                  $regex: new RegExp(
                    `${s?.textSearch?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                    'siu',
                  ),
                },
              }
            })
            .filter((s) => s)
            ?.flat()

    if (searchArr.length < 1) {
      searchArr = [{}]
    }

    return skip
      ? { _id: { $in: [] } }
      : Object.assign(
          {},
          {
            $and: searchArr,
          },
          filterObject,
          {
            isEcommerce: true,
            allowGuest: true,
            isActive: true,
          },
        )
  }

  async getStockModelPagination(
    page: number,
    limit: number,
    search: [SearchStockModelInput],
    filter: [FilterStockModelInput],
    sort: [SortStockModelInput],
    idsDefault: string[],
  ): Promise<StockModelPagination> {
    return new Promise(async (rel, rej) => {
      try {
        const query: any = await this.renderQueryPagination(filter, search)
        if (!page || page < 1) page = 1

        const sortData = {}

        sort?.map((e) => {
          sortData[e?.fieldSort] = e?.sort
        })

        let data: any[]

        if (limit) {
          data = await this.stockModel.aggregate([
            {
              $match: query,
            },
            { $sort: sort ? sortData : { ecomPublicAt: -1 } },
            {
              $skip: (page - 1) * limit,
            },
            {
              $limit: limit,
            },
          ])
        } else {
          data = await this.stockModel.find(query)
        }

        // search hold product active
        if (idsDefault?.length) {
          const dataDefaults: any = await this.stockModel
            .find({
              _id: { $in: idsDefault },
              isActive: true,
            })
            .lean()
          if (dataDefaults?.length) {
            dataDefaults.forEach((item) => {
              const indexOfArray = data.findIndex(
                (stockModel) => stockModel._id === item._id,
              )
              if (indexOfArray !== -1) {
                data.splice(indexOfArray, 1)
              }
              data.unshift(item)
            })
          }
        }
        rel({
          currentPage: page,
          data,
        })
      } catch (error) {
        rej(error)
      }
    })
  }

  async getStockModelPaginationTotal(
    page: number,
    limit: number,
    search: [SearchStockModelInput],
    filter: [FilterStockModelInput],
  ): Promise<StockModelPaginationTotal> {
    return new Promise(async (rel, rej) => {
      try {
        const query: any = await this.renderQueryPagination(filter, search)
        const total = await this.stockModel.find(query).countDocuments()
        rel({
          totalRows: total,
          totalPages: Math.ceil(total / limit),
          currentPage:
            page > Math.ceil(total / limit) ? Math.ceil(total / limit) : page,
        })
      } catch (error) {
        rej(error)
      }
    })
  }

  async createStockModel(
    input: Partial<StockModelEntity>,
    idsStockModelRelated?: string[],
  ): Promise<StockModelDocument> {
    const stockModelNameExisted = await this.stockModel.findOne({
      name: input.name,
      isActive: true,
    })

    if (stockModelNameExisted) {
      throw new StockModelNameExistedError()
    }

    // const stockModelCodeExisted = await this.stockModel.findOne({
    //   code: input.code,
    //   isActive: true,
    // })

    // if (stockModelCodeExisted) {
    //   throw new StockModelCodeExistedError()
    // }

    let slug = input.ecomSlug

    if (!slug) {
      slug = generateSlug(input.name)
    }
    const stockModelByEcomSlug = await this.stockModel.findOne({
      ecomSlug: slug,
      isActive: true,
    })

    if (stockModelByEcomSlug) {
      throw new StockModelByEcomSlugExistedError()
    }

    const newStockModel = new StockModelEntity(input)
    const currentUserSlim = await this.serviceManager
      .get(MyContext)
      .get()
      .authManager.getCurrentUserSlim()

    const rawResult = await this.stockModel.create({
      code: await this.thuTuSinhMaService.generateCodeByYear(
        StockModelEntity.name,
        'PROD',
        '-',
        moment().format('YY'),
        '',
        6,
      ),
      isActive: true,
      createdBy: currentUserSlim,
      isEcommerce: true, // Temporary
      allowGuest: true, // Temporary
      ecomStatus: input?.ecomStatus || EnumStockModelStatus.NotPublic,
      ecomSlug: slug,
      ...newStockModel,
    })

    if (idsStockModelRelated?.length >= 0 && rawResult?._id) {
      await this.mapStockModelRelatedService.createMapStockModelRelated(
        rawResult._id,
        idsStockModelRelated,
      )
    }

    return rawResult
  }

  async updateStockModel(
    _id: string,
    updateInput: StockModelInput,
    idsStockModelRelated?: string[],
  ): Promise<StockModelDocument> {
    const currentUserSlim = await this.serviceManager
      .get(MyContext)
      .get()
      .authManager.getCurrentUserSlim()

    const stockModelNameExisted = await this.stockModel.findOne({
      name: updateInput.name,
      isActive: true,
      _id: { $ne: _id },
    })

    if (stockModelNameExisted) {
      throw new StockModelNameExistedError()
    }

    // const stockModelCodeExisted = await this.stockModel.findOne({
    //   code: updateInput.code,
    //   isActive: true,
    //   _id: { $ne: _id },
    // })

    // if (stockModelCodeExisted) {
    //   throw new StockModelCodeExistedError()
    // }
    const updatedStockModel = await this.stockModel.findOneAndUpdate(
      { _id },
      {
        $set: {
          ...updateInput,
          updatedBy: currentUserSlim,
          updatedAt: Date.now(),
        },
      },
      { new: true },
    )

    if (idsStockModelRelated?.length >= 0 && _id) {
      await this.mapStockModelRelatedService.createMapStockModelRelated(
        _id,
        idsStockModelRelated,
      )
    }

    return updatedStockModel
  }

  async deleteStockModel(_id: string): Promise<StockModelDocument> {
    const currentUserSlim = await this.serviceManager
      .get(MyContext)
      .get()
      .authManager.getCurrentUserSlim()

    const updatedStockModel = await this.stockModel.findOneAndUpdate(
      { _id },
      {
        $set: {
          ecomStatus: EnumStockModelStatus.NotPublic,
          isActive: false,
          deletedBy: currentUserSlim,
          deletedAt: Date.now(),
        },
      },
      { new: true },
    )

    // remove linked product related
    await this.mapStockModelRelatedService.removeLinkedStockModelRelated(_id)
    // remove linked product relate of service
    await this.mapServiceProductService.removeLinkedStockModelOfServiceRelated(
      _id,
    )

    return updatedStockModel
  }

  async importFileStockModel(input: StockModelInput[]): Promise<boolean> {
    try {
      const currentUserSlim = await this.serviceManager
        .get(MyContext)
        .get()
        .authManager.getCurrentUserSlim()
      const err = []
      const result = []
      for (const sm of input) {
        // if (!sm.code) {
        //   throw new ApolloError(`Requires product code`, '400')
        // }
        if (!sm?.name) throw new ApolloError(`Requires product name`, '400')
        if (!sm?.unit?.name || !sm?.unit?.factor) {
          throw new ApolloError(
            `Requires product ${sm.name} must have specifications packing`,
            '400',
          )
        }
      }
      // báo trùng
      const stockModelExisted = await this.stockModel.find({
        name: { $in: input.map((sm) => sm.name) },
        isActive: true,
      })

      for (const sm of stockModelExisted) {
        err.push(sm.name)
      }
      if (err.length >= 1) {
        throw new StockModelNameExistedError(
          `Product name ${err.join(', ')} has existed`,
        )
      }

      // create new stockModel
      for (const sm of input) {
        const newStockModel = new StockModelEntity(sm)

        const createdStockModel = await this.stockModel.create({
          code: await this.thuTuSinhMaService.generateCodeByYear(
            StockModelEntity.name,
            'PROD',
            '-',
            moment().format('YY'),
            '',
            6,
          ),
          isActive: true,
          createdBy: currentUserSlim,
          isEcommerce: true, // Temporary
          allowGuest: true, // Temporary
          ecomStatus: sm?.ecomStatus || EnumStockModelStatus.NotPublic,
          ecomSlug: generateSlug(sm.name),
          ...newStockModel,
        })

        result.push(!!createdStockModel)
      }
      return result.every((item) => item)
    } catch (error) {
      throw new ApolloError(error)
    }
  }
}
