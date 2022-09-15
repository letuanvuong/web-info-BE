import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { ContentHomePageResolver } from './ContentHomePage.resolver'
import { ContentHomePageService } from './ContentHomePage.service'
import {
  ContentHomePageEntity,
  ContentHomePageSchema,
} from './schemas/ContentHomePage.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ContentHomePageEntity.name, schema: ContentHomePageSchema },
    ]),
  ],
  providers: [ContentHomePageService, ContentHomePageResolver],
  exports: [ContentHomePageService],
})
export class ContentHomePageModule {}
