import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { DATABASE_COLLECTION_NAME } from 'src/constant'
import { IDFactory } from 'src/helper'
import { UserSlimSchema } from 'src/modules/user/schemas/UserSlim.schema'
import { EnumPageStatus, UserSlim } from 'src/schema'

export type PageDocument = PageEntity & Document

@Schema({
  collection: DATABASE_COLLECTION_NAME.PAGE,
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true },
})
export class PageEntity {
  @Prop({
    default: IDFactory.getUUIDGenerator(),
    required: true,
  })
  _id: string

  @Prop()
  title: string

  @Prop()
  slug: string

  @Prop()
  content: string

  @Prop()
  description: string

  @Prop()
  keywords: string

  @Prop()
  isAddToMainMenu: boolean

  @Prop()
  isAddToFooterMenu: boolean

  @Prop()
  status: EnumPageStatus

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

  constructor(props: Partial<PageEntity>) {
    Object.assign(this, props)
  }
}

export const PageSchema = SchemaFactory.createForClass(PageEntity)
