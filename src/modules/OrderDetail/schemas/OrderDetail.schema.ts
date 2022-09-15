import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { DATABASE_COLLECTION_NAME } from 'src/constant'
import { IDFactory } from 'src/helper'
import { UserSlimEntity } from 'src/modules/user/schemas/UserSlim.schema'

export type OrderDetailDocument = OrderDetailEntity & Document

export enum EnumDiscountType {
  PERCENT = 'PERCENT',
  PRICE = 'PRICE',
}

@Schema({
  collection: DATABASE_COLLECTION_NAME.ORDERDETAILS,
  toJSON: { virtuals: true, getters: true }, // enable virtuals
  toObject: { virtuals: true, getters: true }, // enable virtuals
})
export class OrderDetailEntity {
  @Prop({
    default: IDFactory.getUUIDGenerator(),
    required: true,
  })
  _id: string

  @Prop({ required: true })
  idOrder: string

  @Prop({ required: true })
  idStockModel: string

  @Prop({ required: true })
  count: number

  @Prop()
  note: string

  @Prop({ required: true })
  quantity: number[]

  @Prop()
  quantityString: number

  @Prop({ default: false })
  isFree: boolean

  @Prop()
  salePrice: number[]

  @Prop({ type: EnumDiscountType })
  discountType: EnumDiscountType

  @Prop()
  discountValue: number

  @Prop()
  total: number

  @Prop({ required: true, default: Date.now })
  createdAt: number

  @Prop()
  createdBy: UserSlimEntity

  @Prop()
  updatedAt: number

  @Prop()
  updatedBy: UserSlimEntity

  @Prop()
  deletedAt: number

  @Prop()
  deletedBy: UserSlimEntity

  constructor(props: Partial<OrderDetailEntity>) {
    Object.assign(this, props)
  }
}

export const OrderDetailSchema = SchemaFactory.createForClass(OrderDetailEntity)
