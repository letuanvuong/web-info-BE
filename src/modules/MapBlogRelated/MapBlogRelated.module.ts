import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { BlogEntity, BlogSchema } from 'src/modules/Blog/schemas/Blog.schema'

import { MapBlogRelatedResolver } from './MapBlogRelated.resolver'
import { MapBlogRelatedService } from './MapBlogRelated.service'
import {
  MapBlogRelatedEntity,
  MapBlogRelatedSchema,
} from './schemas/MapBlogRelated.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: MapBlogRelatedEntity.name,
        schema: MapBlogRelatedSchema,
      },
      { name: BlogEntity.name, schema: BlogSchema },
    ]),
  ],
  providers: [MapBlogRelatedService, MapBlogRelatedResolver],
  exports: [MapBlogRelatedService],
})
export class MapBlogRelatedModule {}
