import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { ContentContactResolver } from './ContentContact.resolver'
import { ContentContactService } from './ContentContact.service'
import {
  ContentContactEntity,
  ContentContactSchema,
} from './schemas/ContentContact.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ContentContactEntity.name, schema: ContentContactSchema },
    ]),
  ],
  providers: [ContentContactService, ContentContactResolver],
  exports: [ContentContactService],
})
export class ContentContactModule {}
