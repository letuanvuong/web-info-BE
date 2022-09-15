import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { DATABASE_COLLECTION_NAME } from 'src/constant'
import { IDFactory } from 'src/helper'
import { UserSlimSchema } from 'src/modules/user/schemas/UserSlim.schema'
import {
  Blog,
  EnumContentHistoryType,
  Page,
  Service,
  UserSlim,
} from 'src/schema'

export type HistoryVersionDocument = HistoryVersionEntity & Document

@Schema({
  collection: DATABASE_COLLECTION_NAME.CONTENT_HISTORY,
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true },
})
export class HistoryVersionEntity {
  @Prop({
    default: IDFactory.getUUIDGenerator(),
    required: true,
  })
  _id: string

  @Prop({ required: true })
  version: number

  @Prop()
  type: EnumContentHistoryType

  @Prop({ default: false })
  isDeleted: boolean

  @Prop({ default: null })
  name: string

  @Prop()
  idPage: string

  @Prop()
  dataPage: Page

  @Prop()
  idService: string

  @Prop()
  dataService: Service

  @Prop()
  idBlog: string

  @Prop()
  dataBlog: Blog

  @Prop({ required: true, default: Date.now })
  createdAt: number

  @Prop({ type: UserSlimSchema })
  createdBy: UserSlim

  @Prop()
  updatedAt: number

  @Prop({ type: UserSlimSchema })
  updatedBy: UserSlim

  @Prop()
  deleteAt: number

  @Prop({ type: UserSlimSchema })
  deleteBy: UserSlim

  constructor(props: Partial<HistoryVersionEntity>) {
    Object.assign(this, props)
  }
}

export const HistoryVersionSchema =
  SchemaFactory.createForClass(HistoryVersionEntity)
