import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { ContentPurchaseInfoResolver } from './ContentPurchaseInfo.resolver'
import { ContentPurchaseInfoService } from './ContentPurchaseInfo.service'
import {
  ContentPurchaseInfoEntity,
  ContentPurchaseInfoSchema,
} from './schemas/ContentPurchaseInfo.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ContentPurchaseInfoEntity.name,
        schema: ContentPurchaseInfoSchema,
      },
    ]),
  ],
  providers: [ContentPurchaseInfoService, ContentPurchaseInfoResolver],
  exports: [ContentPurchaseInfoService],
})
export class ContentPurchaseInfoModule {}
