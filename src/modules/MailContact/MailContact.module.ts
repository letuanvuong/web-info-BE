import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { ServiceEntity, ServiceSchema } from '../Service/schemas/Service.schema'
import {
  ContentHomePageEntity,
  ContentHomePageSchema,
} from './../ContentHomePage/schemas/ContentHomePage.schema'
import { MailContactResolver } from './MailContact.resolver'
import { MailContactService } from './MailContact.service'
import {
  MailContactEntity,
  MailContactSchema,
} from './schemas/MailContact.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MailContactEntity.name, schema: MailContactSchema },
      { name: ServiceEntity.name, schema: ServiceSchema },
      { name: ContentHomePageEntity.name, schema: ContentHomePageSchema },
    ]),
  ],
  providers: [MailContactService, MailContactResolver],
  exports: [MailContactService],
})
export class MailContactModule {}
