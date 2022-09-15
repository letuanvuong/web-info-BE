import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { DATABASE_COLLECTION_NAME } from 'src/constant'
import { IDFactory } from 'src/helper'
import { ServiceEntity } from 'src/modules/Service/schemas/Service.schema'
import { StockModelEntity } from 'src/modules/StockModel/schemas/StockModel.schema'
import { UserSlimSchema } from 'src/modules/user/schemas/UserSlim.schema'
import { UserSlim } from 'src/schema'

export type MapServiceProductDocument = MapServiceProductEntity & Document

@Schema({
  collection: DATABASE_COLLECTION_NAME.MAP_SERVICE_PRODUCT,
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true },
})
export class MapServiceProductEntity {
  @Prop({
    default: IDFactory.getUUIDGenerator(),
    required: true,
  })
  _id: string

  @Prop()
  idService: string

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

  constructor(props: Partial<MapServiceProductEntity>) {
    Object.assign(this, props)
  }
}

export const MapServiceProductSchema = SchemaFactory.createForClass(
  MapServiceProductEntity,
)

MapServiceProductSchema.virtual('service', {
  ref: ServiceEntity.name,
  localField: 'idService',
  foreignField: '_id',
  justOne: true,
})

MapServiceProductSchema.virtual('stockModel', {
  ref: StockModelEntity.name,
  localField: 'idStockModel',
  foreignField: '_id',
  justOne: true,
})
