import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { DATABASE_COLLECTION_NAME } from 'src/constant'
import { IDFactory } from 'src/helper'
import { UserSlimSchema } from 'src/modules/user/schemas/UserSlim.schema'
import { UserSlim } from 'src/schema'

export type ContentAboutUsDocument = ContentAboutUsEntity & Document

@Schema({
  collection: DATABASE_COLLECTION_NAME.CONTENT_ABOUT_US,
})
export class ContentAboutUsEntity {
  @Prop({
    default: IDFactory.getUUIDGenerator(),
    required: true,
  })
  _id: string

  @Prop()
  language: string

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
  Content: string

  @Prop()
  updatedAt: number

  @Prop({ type: UserSlimSchema })
  updatedBy: UserSlim

  constructor(props: Partial<ContentAboutUsEntity>) {
    Object.assign(this, props)
  }
}

export const ContentAboutUsSchema =
  SchemaFactory.createForClass(ContentAboutUsEntity)
