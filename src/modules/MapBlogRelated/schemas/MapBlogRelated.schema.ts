import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { DATABASE_COLLECTION_NAME } from 'src/constant'
import { IDFactory } from 'src/helper'
import { BlogEntity } from 'src/modules/Blog/schemas/Blog.schema'
import { UserSlimSchema } from 'src/modules/user/schemas/UserSlim.schema'
import { UserSlim } from 'src/schema'

export type MapBlogRelatedDocument = MapBlogRelatedEntity & Document

@Schema({
  collection: DATABASE_COLLECTION_NAME.MAP_BLOG_RELATED,
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true },
})
export class MapBlogRelatedEntity {
  @Prop({
    default: IDFactory.getUUIDGenerator(),
    required: true,
  })
  _id: string

  @Prop()
  idBlogRelated: string

  @Prop()
  idBlog: string

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

  constructor(props: Partial<MapBlogRelatedEntity>) {
    Object.assign(this, props)
  }
}

export const MapBlogRelatedSchema =
  SchemaFactory.createForClass(MapBlogRelatedEntity)

MapBlogRelatedSchema.virtual('blogRelated', {
  ref: BlogEntity.name,
  localField: 'idBlogRelated',
  foreignField: '_id',
  justOne: true,
})

MapBlogRelatedSchema.virtual('blog', {
  ref: BlogEntity.name,
  localField: 'idBlog',
  foreignField: '_id',
  justOne: true,
})
