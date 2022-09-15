import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { DATABASE_COLLECTION_NAME } from 'src/constant'
import { IDFactory } from 'src/helper'
import { UserSlimSchema } from 'src/modules/user/schemas/UserSlim.schema'
import { EnumBlogStatus, LinkImage, UserSlim } from 'src/schema'

export type BlogDocument = BlogEntity & Document

@Schema({
  collection: DATABASE_COLLECTION_NAME.BLOG,
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true },
})
export class BlogEntity {
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
  content: string

  @Prop()
  sortContent: string

  @Prop()
  keywords: string

  @Prop({ default: false })
  isFeatureBlog: boolean

  @Prop()
  status: EnumBlogStatus

  @Prop()
  priority: number

  @Prop({ default: Date.now })
  publishAt: number

  @Prop()
  publishBy: UserSlim

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

  constructor(props: Partial<BlogEntity>) {
    Object.assign(this, props)
  }
}

export const BlogSchema = SchemaFactory.createForClass(BlogEntity)
