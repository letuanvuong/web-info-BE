import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { DATABASE_COLLECTION_NAME } from 'src/constant'
import {
  EnumOrderStatus,
  FilterReportInput,
  ReportRevenueResponse,
  ReportTotalOrderResponse,
} from 'src/schema'

import { ServiceManager } from '../base-modules/service-manager/service-manager'
import { OrderDocument, OrderEntity } from '../Order/schemas/order.schema'
import {
  OrderDetailDocument,
  OrderDetailEntity,
} from '../OrderDetail/schemas/OrderDetail.schema'

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(OrderEntity.name)
    public orderModel: Model<OrderDocument>,
    @InjectModel(OrderDetailEntity.name)
    public orderDetailModel: Model<OrderDetailDocument>,
    private readonly serviceManager: ServiceManager,
  ) {}

  async reportTotalOrder(
    filter: FilterReportInput,
  ): Promise<ReportTotalOrderResponse> {
    const { createdAtFrom, createdAtTo } = filter
    const data: any[] = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: createdAtFrom,
            $lte: createdAtTo,
          },
        },
      },
      { $group: { _id: '$status', quantity: { $sum: 1 } } },
      { $project: { quantity: 1, type: '$_id' } },
    ])
    let totalQuantity = 0
    for (const order of data) {
      if (
        [
          EnumOrderStatus.AWAIT_CONFIRMATION,
          EnumOrderStatus.IN_PROGRESS,
          EnumOrderStatus.SHIPPING,
          EnumOrderStatus.SUCCESS,
        ].includes(order.type)
      ) {
        totalQuantity += order.quantity
      }
    }
    return {
      totalQuantity,
      totalOrderForType: data,
    }
  }

  async reportRevenue(
    filter: FilterReportInput,
  ): Promise<ReportRevenueResponse> {
    const { createdAtFrom, createdAtTo } = filter
    const data = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: createdAtFrom,
            $lte: createdAtTo,
          },
          status: EnumOrderStatus.SUCCESS,
        },
      },
      {
        $lookup: {
          from: DATABASE_COLLECTION_NAME.ORDERDETAILS,
          localField: '_id',
          foreignField: 'idOrder',
          as: 'orderDetail',
        },
      },
      {
        $project: {
          total: { $sum: '$orderDetail.total' },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
        },
      },
    ])
    return {
      totalRevenue: data?.[0]?.totalRevenue || 0,
    }
  }
}
