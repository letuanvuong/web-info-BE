import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import {
  ContentHomePageEntity,
  ContentHomePageSchema,
} from '../ContentHomePage/schemas/ContentHomePage.schema'
import { SubscriberEntity, SubscriberSchema } from './schemas/Subscriber.schema'
import { SubscriberResolver } from './Subscriber.resolver'
import { SubscriberService } from './Subscriber.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SubscriberEntity.name, schema: SubscriberSchema },
      { name: ContentHomePageEntity.name, schema: ContentHomePageSchema },
    ]),
  ],
  providers: [SubscriberService, SubscriberResolver],
  exports: [SubscriberService],
})
export class SubscriberModule {}
