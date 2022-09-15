import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { DATABASE_COLLECTION_NAME } from 'src/constant'
import { IDFactory } from 'src/helper'
import { EnumLanguage, OurAddress, SocialItem } from 'src/schema'

export type ContentContactDocument = ContentContactEntity & Document

@Schema({
  collection: DATABASE_COLLECTION_NAME.CONTENT_CONTACT,
  toJSON: { virtuals: true, getters: true }, // enable virtuals
  toObject: { virtuals: true, getters: true }, // enable virtuals
})
export class ContentContactEntity {
  @Prop({
    default: IDFactory.getUUIDGenerator(),
    required: true,
  })
  _id: string

  @Prop()
  language: EnumLanguage

  @Prop()
  detailAddress: string[]

  @Prop()
  ourPhone: string

  @Prop()
  ourAddress: OurAddress[]

  @Prop()
  ourMailBox: string

  @Prop()
  googleAddress: string

  @Prop()
  googleFrame: string

  @Prop()
  phoneNumber: string

  @Prop()
  hotline: string

  @Prop()
  email: string

  @Prop()
  introduce: string

  @Prop()
  SEOTitle: string
  @Prop()
  SEODescription: string
  @Prop()
  SEOKeywords: string

  @Prop()
  SEO_OGTitle: string
  @Prop()
  SEO_OGDescription: string
  @Prop()
  SEO_OGImage: string

  @Prop()
  socials: SocialItem[]

  constructor(props: Partial<ContentContactEntity>) {
    Object.assign(this, props)
  }
}

export const ContentContactSchema =
  SchemaFactory.createForClass(ContentContactEntity)
