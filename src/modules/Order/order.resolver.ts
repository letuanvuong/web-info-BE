import {
  Args,
  Context,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql'
import { LeanDocument } from 'mongoose'
import { hasOwnProperty } from 'src/helper'
import {
  EnumOrderStatus,
  GridOption,
  InputOptionsQueryOrder,
  InputOrder,
} from 'src/schema'

import { UnauthenticatedError } from '../auth/auth.error'
import { IContext } from '../base-modules/graphql/gql.type'
import { ServiceManager } from '../base-modules/service-manager/service-manager'
import { OrderNotFoundError } from './order.error'
import { OrderService } from './order.service'
import { OrderDocument } from './schemas/order.schema'
@Resolver('Order')
export class OrderResolver {
  constructor(
    private orderService: OrderService,
    private readonly serviceManager: ServiceManager,
  ) {}

  @Query()
  async ordersWithPaginate(
    @Context() context: IContext,
    @Args('filterOptions') filterOptions: InputOptionsQueryOrder = {},
    @Args('gridOptions') gridOptions?: GridOption,
  ) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return this.orderService.ordersWithPaginate({
      filterOptions,
      gridOptions,
    })
  }

  @Query()
  async getOrderInfo(@Args() args, @Context() context: IContext) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    const getOrderInfo = await this.orderService.getOrderInfo(args)
    return getOrderInfo
  }

  @Query()
  async getOrderById(@Args('id') id: any, @Context() context: IContext) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    const order = await this.orderService.getOrderById({
      _id: id,
    })
    return order
  }

  @Query()
  async getQuantityOderForType(@Context() context: IContext) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return await this.orderService.getQuantityOderForType()
  }

  @Mutation()
  async createOrder(@Args() args, @Context() context): Promise<boolean> {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return this.orderService.createOrder(args, context)
  }

  @Mutation()
  async createOrder2(@Args('input') input: InputOrder, @Context() context) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return this.orderService.createOrder2(input)
  }

  @Mutation()
  async updateOrder2(
    @Args('_id') _id: string,
    @Args('input') input: InputOrder,
    @Context() context: IContext,
  ) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    const foundOrder = await this.orderService.findOrderMatchAny([{ _id }])
    if (!foundOrder) throw new OrderNotFoundError()

    return this.orderService.updateOrder2(_id, input)
  }

  @Mutation()
  async updateOrderStatus(
    @Args('_ids') _ids: string[],
    @Args('oldStatus') oldStatus: EnumOrderStatus,
    @Args('newStatus') newStatus: EnumOrderStatus,
    @Context() context: IContext,
  ) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    /** TODO: check rules update status - refactor code */
    if (
      oldStatus === EnumOrderStatus.SUCCESS &&
      newStatus === EnumOrderStatus.SUCCESS
    ) {
      throw new OrderNotFoundError('Đơn hàng đã giao')
    }

    if (
      oldStatus === EnumOrderStatus.FAILED &&
      newStatus === EnumOrderStatus.FAILED
    ) {
      throw new OrderNotFoundError('Đơn hàng đã huỷ')
    }

    return this.orderService.updateOrderStatus(_ids, newStatus)
  }

  @Mutation()
  async cancelOrder(@Args() args: any, @Context() context) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return await this.orderService.cancelOrder(args, context)
  }

  @Mutation()
  async cancelOrder2(
    @Args('_id') _id: string,
    @Args('reasonCancel') reasonCancel: string,
    @Context() context: IContext,
  ) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return this.orderService.cancelOrder2(_id, reasonCancel, context)
  }

  @Mutation()
  async confirmOrder(@Args() args: any, @Context() context: IContext) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return this.orderService.confirmOrder(args, context)
  }

  @Mutation()
  async confirmFailedOrder(@Args() args: any, @Context() context: IContext) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return this.orderService.confirmFailedOrder(args, context)
  }

  @Mutation()
  async confirmSuccessOrder(@Args() args: any, @Context() context: IContext) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return this.orderService.confirmSuccessOrder(args, context)
  }

  @Mutation()
  async shipOrder(@Args() args: any, @Context() context: IContext) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return await this.orderService.shipOrder(args, context)
  }

  @ResolveField('customer')
  async fieldCustomer(
    @Parent()
    order: LeanDocument<OrderDocument>,
    @Context() context: IContext,
  ) {
    if (hasOwnProperty(order, 'customer')) return order['customer']

    const result = await context.loaderManager
      .getLoader('CustomerByIdLoader')
      .load(order.idCustomer)

    return result
  }

  @ResolveField('staff')
  async fieldStaff(
    @Parent()
    order: LeanDocument<OrderDocument>,
    @Context() context: IContext,
  ) {
    if (hasOwnProperty(order, 'staff')) return order['staff']

    const result = await context.loaderManager
      .getLoader('StaffByIdLoader')
      .load(order.idStaff)

    return result
  }

  @ResolveField('orderDetail')
  async fieldOrderDetail(
    @Parent()
    order: LeanDocument<OrderDocument>,
    @Context() context: IContext,
  ) {
    if (hasOwnProperty(order, 'orderDetail')) return order['orderDetail']

    const result = await context.loaderManager
      .getLoader('OrderDetailLoader')
      .load(order._id)

    return result
  }

  @ResolveField('deliveryAddress')
  async fieldDeliveryAddress(
    @Parent()
    order: LeanDocument<OrderDocument>,
    @Context() context: IContext,
  ) {
    if (hasOwnProperty(order, 'deliveryAddress'))
      return order['deliveryAddress']

    const result = await context.loaderManager
      .getLoader('DeliveryAddressByIdLoader')
      .load(order.idDeliveryAddress)

    return result
  }
}
