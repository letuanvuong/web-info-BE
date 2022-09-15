import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { DATABASE_COLLECTION_NAME } from 'src/constant'
import { IDFactory } from 'src/helper'
import { UserSlimSchema } from 'src/modules/user/schemas/UserSlim.schema'
import {
  ContentBanner,
  ContentBestSellingProduct,
  ContentBlogNew,
  ContentEstimonial,
  ContentLatestProduct,
  ContentOurClient,
  ContentOurPartners,
  ContentService,
  ContentSlider,
  ContentWebIntrodution,
  UserSlim,
} from 'src/schema'

export type ContentHomePageDocument = ContentHomePageEntity & Document

@Schema({
  collection: DATABASE_COLLECTION_NAME.CONTENT_HOME_PAGE,
  toJSON: { virtuals: true, getters: true }, // enable virtuals
  toObject: { virtuals: true, getters: true }, // enable virtuals
})
export class ContentHomePageEntity {
  @Prop({
    default: IDFactory.getUUIDGenerator(),
    required: true,
  })
  _id: string

  @Prop()
  language: string

  @Prop()
  sectionSlider: ContentSlider
  @Prop()
  sectionLatestProduct: ContentLatestProduct
  @Prop()
  sectionBanner: ContentBanner
  @Prop()
  sectionBestSellingProduct: ContentBestSellingProduct

  @Prop()
  sectionOurPartners: ContentOurPartners

  @Prop()
  sectionWebIntrodution: ContentWebIntrodution

  @Prop()
  sectionEstimonial: ContentEstimonial

  @Prop()
  sectionService: ContentService

  @Prop()
  sectionBlogNew: ContentBlogNew

  @Prop()
  sectionOurClient: ContentOurClient

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
  updatedAt: number

  @Prop({ type: UserSlimSchema })
  updatedBy: UserSlim

  constructor(props: Partial<ContentHomePageEntity>) {
    Object.assign(this, props)
  }
}

export const ContentHomePageSchema = SchemaFactory.createForClass(
  ContentHomePageEntity,
)
