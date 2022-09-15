import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { DATABASE_COLLECTION_NAME } from 'src/constant'
import { IDFactory } from 'src/helper'
import { UserSlimEntity } from 'src/modules/user/schemas/UserSlim.schema'
import { EnumOrderStatus, EnumPaymentMethod } from 'src/schema'

export type OrderDocument = OrderEntity & Document

@Schema({
  collection: DATABASE_COLLECTION_NAME.ORDERS,
  toJSON: { virtuals: true, getters: true }, // enable virtuals
  toObject: { virtuals: true, getters: true }, // enable virtuals
})
export class OrderEntity {
  @Prop({
    default: IDFactory.getUUIDGenerator(),
    required: true,
  })
  _id: string

  @Prop()
  code: string

  @Prop()
  codeNumber: number

  @Prop({ required: true })
  idCustomer: string

  @Prop()
  idStaff: string

  // @Prop({ required: true })
  @Prop()
  idDeliveryAddress: string

  @Prop()
  status: EnumOrderStatus

  @Prop()
  paymentMethod: EnumPaymentMethod

  @Prop()
  reasonCancel: string

  @Prop({ required: true, default: Date.now })
  orderedAt: number

  @Prop()
  deliveryAt: number

  @Prop()
  estimatedDeliveryAt: number

  @Prop({ required: true, default: Date.now })
  createdAt: number

  @Prop()
  createdBy: UserSlimEntity

  @Prop()
  updatedAt: number

  @Prop()
  updatedBy: UserSlimEntity

  @Prop()
  customerCancelAt: number

  @Prop()
  customerCancelBy: UserSlimEntity

  @Prop()
  customerReasonCancel: string

  @Prop()
  note: string

  @Prop()
  shippingUnit: string

  @Prop()
  transportFee: number

  @Prop()
  failedAt: number

  @Prop()
  failedBy: UserSlimEntity

  @Prop()
  reasonFailed: string

  @Prop()
  deletedAt: number

  @Prop()
  deletedBy: UserSlimEntity

  constructor(props: Partial<OrderEntity>) {
    Object.assign(this, props)
  }
}

export const OrderSchema = SchemaFactory.createForClass(OrderEntity)
