import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { DATABASE_COLLECTION_NAME } from 'src/constant'
import { IDFactory } from 'src/helper'
import {
  ContentMyAccount,
  ContentUsefulLink,
  EnumLanguage,
  LinkImage,
} from 'src/schema'

export type ContentFooterDocument = ContentFooterEntity & Document

@Schema({
  collection: DATABASE_COLLECTION_NAME.CONTENT_FOOTER,
  toJSON: { virtuals: true, getters: true }, // enable virtuals
  toObject: { virtuals: true, getters: true }, // enable virtuals
})
export class ContentFooterEntity {
  @Prop({
    default: IDFactory.getUUIDGenerator(),
    required: true,
  })
  _id: string

  @Prop()
  language: EnumLanguage

  @Prop()
  logo: string

  @Prop()
  linkLogo: LinkImage

  @Prop()
  description: string

  @Prop()
  copyRight: string

  @Prop()
  usefulLink: ContentUsefulLink[]

  @Prop()
  myAccount: ContentMyAccount[]

  @Prop()
  introduceImages: LinkImage[]

  @Prop()
  subscribeTitle: string

  @Prop()
  subscribeDescription: string

  constructor(props: Partial<ContentFooterEntity>) {
    Object.assign(this, props)
  }
}

export const ContentFooterSchema =
  SchemaFactory.createForClass(ContentFooterEntity)
