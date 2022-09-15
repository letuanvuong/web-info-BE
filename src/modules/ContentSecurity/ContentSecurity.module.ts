import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { ContentSecurityResolver } from './ContentSecurity.resolver'
import { ContentSecurityService } from './ContentSecurity.service'
import {
  ContentSecurityEntity,
  ContentSecuritySchema,
} from './schemas/ContentSecurity.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ContentSecurityEntity.name, schema: ContentSecuritySchema },
    ]),
  ],
  providers: [ContentSecurityService, ContentSecurityResolver],
  exports: [ContentSecurityService],
})
export class ContentSecurityModule {}
