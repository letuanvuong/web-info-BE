import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { MapBlogRelatedModule } from 'src/modules/MapBlogRelated/MapBlogRelated.module'

import { BlogResolver } from './Blog.resolver'
import { BlogService } from './Blog.service'
import { BlogEntity, BlogSchema } from './schemas/Blog.schema'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: BlogEntity.name, schema: BlogSchema }]),
    MapBlogRelatedModule,
  ],
  providers: [BlogService, BlogResolver],
  exports: [BlogService],
})
export class BlogModule {}
