import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { DATABASE_COLLECTION_NAME } from 'src/constant'
import { IDFactory } from 'src/helper'
import { UserSlimSchema } from 'src/modules/user/schemas/UserSlim.schema'
import { UserSlim } from 'src/schema'

export type StockDocument = StockEntity & Document

@Schema({
  collection: DATABASE_COLLECTION_NAME.STOCKS,
  toJSON: { virtuals: true, getters: true }, // enable virtuals
  toObject: { virtuals: true, getters: true }, // enable virtuals
})
export class StockEntity {
  @Prop({
    default: IDFactory.getUUIDGenerator(),
    required: true,
  })
  _id: string

  @Prop()
  idStockModel: string

  @Prop()
  idStore: string

  @Prop()
  idSourceImport: string

  @Prop()
  idBiddingContract: string

  @Prop()
  code: string

  @Prop()
  partNumber: string

  @Prop()
  count: number

  @Prop()
  quantity: number[]

  @Prop()
  availableCount: number

  @Prop()
  availableQuantity: number[]

  @Prop()
  price: number[]

  @Prop()
  expiration: number

  @Prop()
  quantityString: string

  @Prop()
  isInvoice: boolean

  @Prop()
  isNoStock: boolean

  @Prop()
  isActive: boolean

  @Prop({ required: true, default: Date.now })
  createdAt: number

  @Prop({ required: true, type: UserSlimSchema })
  createdBy: UserSlim
  @Prop()
  updatedAt: number

  @Prop({ type: UserSlimSchema })
  updatedBy: UserSlim

  constructor(props: Partial<StockEntity>) {
    Object.assign(this, props)
  }
}

export const StockSchema = SchemaFactory.createForClass(StockEntity)
