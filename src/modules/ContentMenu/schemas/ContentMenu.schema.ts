import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { DATABASE_COLLECTION_NAME } from 'src/constant'
import { IDFactory } from 'src/helper'
import { EnumLanguage, LinkImage, MenuItem } from 'src/schema'

import { MenuItemSchema } from './MenuItem.schema'

export type ContentMenuDocument = ContentMenuEntity & Document

@Schema({
  collection: DATABASE_COLLECTION_NAME.CONTENT_MENU,
  toJSON: { virtuals: true, getters: true }, // enable virtuals
  toObject: { virtuals: true, getters: true }, // enable virtuals
})
export class ContentMenuEntity {
  @Prop({
    default: IDFactory.getUUIDGenerator(),
    required: true,
  })
  _id: string

  @Prop()
  language: EnumLanguage

  @Prop()
  linkLogo: LinkImage

  @Prop()
  linkFavicon: LinkImage

  @Prop()
  description: string

  @Prop({ type: [MenuItemSchema] })
  listMenu: MenuItem[]

  constructor(props: Partial<ContentMenuEntity>) {
    Object.assign(this, props)
  }
}

export const ContentMenuSchema = SchemaFactory.createForClass(ContentMenuEntity)
