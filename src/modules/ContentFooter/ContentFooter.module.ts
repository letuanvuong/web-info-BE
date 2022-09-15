import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { ContentFooterResolver } from './ContentFooter.resolver'
import { ContentFooterService } from './ContentFooter.service'
import {
  ContentFooterEntity,
  ContentFooterSchema,
} from './schemas/ContentFooter.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ContentFooterEntity.name, schema: ContentFooterSchema },
    ]),
  ],
  providers: [ContentFooterService, ContentFooterResolver],
  exports: [ContentFooterService],
})
export class ContentFooterModule {}
