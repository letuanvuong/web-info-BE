import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { DATABASE_COLLECTION_NAME } from 'src/constant'
import { IDFactory } from 'src/helper'
import { UserSlimSchema } from 'src/modules/user/schemas/UserSlim.schema'
import { LinkImage, UserSlim } from 'src/schema'

export type ServiceDocument = ServiceEntity & Document

@Schema({
  collection: DATABASE_COLLECTION_NAME.SERVICE,
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true },
})
export class ServiceEntity {
  @Prop({
    default: IDFactory.getUUIDGenerator(),
    required: true,
  })
  _id: string

  @Prop()
  title: string

  @Prop()
  slug: string

  @Prop({ type: LinkImage })
  mainPhoto: LinkImage

  @Prop()
  sortDescription: string

  @Prop()
  desciption: string

  @Prop()
  keywords: string

  @Prop()
  isDeleted: boolean

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

  constructor(props: Partial<ServiceEntity>) {
    Object.assign(this, props)
  }
}

export const ServiceSchema = SchemaFactory.createForClass(ServiceEntity)
