import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { DATABASE_COLLECTION_NAME } from 'src/constant'
import { IDFactory } from 'src/helper'
import { UserSlimSchema } from 'src/modules/user/schemas/UserSlim.schema'
import { UserSlim } from 'src/schema'

export type ContentSecurityDocument = ContentSecurityEntity & Document

@Schema({
  collection: DATABASE_COLLECTION_NAME.CONTENT_SECURITY,
})
export class ContentSecurityEntity {
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

  constructor(props: Partial<ContentSecurityEntity>) {
    Object.assign(this, props)
  }
}

export const ContentSecuritySchema = SchemaFactory.createForClass(
  ContentSecurityEntity,
)
