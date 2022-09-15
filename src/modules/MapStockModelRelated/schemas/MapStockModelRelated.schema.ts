import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { DATABASE_COLLECTION_NAME } from 'src/constant'
import { IDFactory } from 'src/helper'
import { StockModelEntity } from 'src/modules/StockModel/schemas/StockModel.schema'
import { UserSlimSchema } from 'src/modules/user/schemas/UserSlim.schema'
import { UserSlim } from 'src/schema'

export type MapStockModelRelatedDocument = MapStockModelRelatedEntity & Document

@Schema({
  collection: DATABASE_COLLECTION_NAME.MAP_STOCK_MODEL_RELATED,
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true },
})
export class MapStockModelRelatedEntity {
  @Prop({
    default: IDFactory.getUUIDGenerator(),
    required: true,
  })
  _id: string

  @Prop()
  idStockModelRelated: string

  @Prop()
  idStockModel: string

  @Prop({ required: true, default: Date.now })
  createdAt: number

  @Prop({ required: true, type: UserSlimSchema })
  createdBy: UserSlim

  @Prop()
  updatedAt: number

  @Prop({ type: UserSlimSchema })
  updatedBy: UserSlim

  @Prop()
  deletedAt: number

  @Prop({ type: UserSlimSchema })
  deletedBy: UserSlim

  constructor(props: Partial<MapStockModelRelatedEntity>) {
    Object.assign(this, props)
  }
}

export const MapStockModelRelatedSchema = SchemaFactory.createForClass(
  MapStockModelRelatedEntity,
)

MapStockModelRelatedSchema.virtual('stockModelRelated', {
  ref: StockModelEntity.name,
  localField: 'idStockModelRelated',
  foreignField: '_id',
  justOne: true,
})

MapStockModelRelatedSchema.virtual('stockModel', {
  ref: StockModelEntity.name,
  localField: 'idStockModel',
  foreignField: '_id',
  justOne: true,
})
