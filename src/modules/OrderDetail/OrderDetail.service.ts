import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { FilterQuery, Model } from 'mongoose'

import {
  OrderDetailDocument,
  OrderDetailEntity,
} from './schemas/OrderDetail.schema'

@Injectable()
export class OrderDetailService {
  constructor(
    @InjectModel(OrderDetailEntity.name)
    private orderDetailModel: Model<OrderDetailDocument>,
  ) {}

  async findOrderDetailByFilter(
    filter: FilterQuery<OrderDetailDocument>,
    projection: any = {},
  ) {
    return this.orderDetailModel.find(filter).select(projection).lean().exec()
  }
}
