import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { LeanDocument } from 'mongoose'
import { hasOwnProperty } from 'src/helper'

import { IContext } from '../base-modules/graphql/gql.type'
import { OrderDetailService } from './OrderDetail.service'
import { OrderDetailDocument } from './schemas/OrderDetail.schema'

@Resolver('OrderDetail')
export class OrderDetailResolver {
  constructor(private deliveryOrderDetailService: OrderDetailService) {}

  @ResolveField('stockModel')
  async fieldStockModel(
    @Parent()
    orderDetail: LeanDocument<OrderDetailDocument>,
    @Context() context: IContext,
  ) {
    if (hasOwnProperty(orderDetail, 'stockModel'))
      return orderDetail['stockModel']

    const result = await context.loaderManager
      .getLoader('StockModelLoader')
      .load(orderDetail.idStockModel)

    return result
  }
}
