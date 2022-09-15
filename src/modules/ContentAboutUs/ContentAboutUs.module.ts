import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { ContentAboutUsResolver } from './ContentAboutUs.resolver'
import { ContentAboutUsService } from './ContentAboutUs.service'
import {
  ContentAboutUsEntity,
  ContentAboutUsSchema,
} from './schemas/ContentAboutUs.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ContentAboutUsEntity.name, schema: ContentAboutUsSchema },
    ]),
  ],
  providers: [ContentAboutUsService, ContentAboutUsResolver],
  exports: [ContentAboutUsService],
})
export class ContentAboutUsModule {}
