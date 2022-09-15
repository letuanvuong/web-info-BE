import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import {
  ContentHomePageEntity,
  ContentHomePageSchema,
} from '../ContentHomePage/schemas/ContentHomePage.schema'
import {
  VerifyTokenEntity,
  VerifyTokenSchema,
} from './schemas/VerifyToken.schema'
import { VerifyTokenResolver } from './VerifyToken.resolver'
import { VerifyTokenService } from './VerifyToken.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VerifyTokenEntity.name, schema: VerifyTokenSchema },
      { name: ContentHomePageEntity.name, schema: ContentHomePageSchema },
    ]),
  ],
  providers: [VerifyTokenService, VerifyTokenResolver],
  exports: [VerifyTokenService],
})
export class VerifyTokenModule {}
