import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { DATABASE_COLLECTION_NAME } from 'src/constant'
import { IDFactory } from 'src/helper'
import { UserSlimSchema } from 'src/modules/user/schemas/UserSlim.schema'
import {
  EnumEcomStockModelTag,
  EnumStockModelStatus,
  StockModelImage,
  StockModelPrice,
  StockModelUnit,
  UserSlim,
} from 'src/schema'

export type StockModelDocument = StockModelEntity & Document

@Schema({
  collection: DATABASE_COLLECTION_NAME.STOCK_MODELS,
  toJSON: { virtuals: true, getters: true }, // enable virtuals
  toObject: { virtuals: true, getters: true }, // enable virtuals
})
export class StockModelEntity {
  @Prop({
    default: IDFactory.getUUIDGenerator(),
    required: true,
  })
  _id: string

  @Prop()
  code: string

  @Prop()
  name: string

  @Prop()
  prices: StockModelPrice[]

  @Prop()
  unit: StockModelUnit

  @Prop()
  unsignName: string

  //  E-Commerce

  // webinfo alway show
  @Prop({ default: true })
  isEcommerce: boolean

  // webinfo alway show
  @Prop({ default: true })
  allowGuest: boolean

  @Prop()
  idEcomCategory: string

  @Prop()
  ecomStatus: EnumStockModelStatus

  @Prop()
  ecomImages: StockModelImage[]

  @Prop()
  ecomSlug: string

  @Prop()
  ecomDescription: string

  @Prop()
  ecomShortDescription: string

  @Prop()
  ecomPublicAt: number

  @Prop()
  ecomTags: EnumEcomStockModelTag[]

  // webinfo

  @Prop()
  upc: string

  @Prop()
  sku: string

  @Prop({ default: true })
  isActive: boolean

  @Prop({ required: true, default: Date.now })
  createdAt: number

  @Prop({ required: true, type: UserSlimSchema })
  createdBy: UserSlim
  @Prop()
  updatedAt: number

  @Prop({ type: UserSlimSchema })
  updatedBy: UserSlim

  constructor(props: Partial<StockModelEntity>) {
    Object.assign(this, props)
  }
}

export const StockModelSchema = SchemaFactory.createForClass(StockModelEntity)
