import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { ContentMenuResolver } from './ContentMenu.resolver'
import { ContentMenuService } from './ContentMenu.service'
import {
  ContentMenuEntity,
  ContentMenuSchema,
} from './schemas/ContentMenu.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ContentMenuEntity.name, schema: ContentMenuSchema },
    ]),
  ],
  providers: [ContentMenuService, ContentMenuResolver],
  exports: [ContentMenuService],
})
export class ContentMenuModule {}
