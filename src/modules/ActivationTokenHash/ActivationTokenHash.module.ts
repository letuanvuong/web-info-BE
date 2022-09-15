import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { ActivationTokenHashService } from './ActivationTokenHash.service'
import { ActivationTokenHashSchema } from './schema/ActivationTokenHash.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'ActivationTokenHashEntity', schema: ActivationTokenHashSchema },
    ]),
  ],
  providers: [ActivationTokenHashService],
  exports: [ActivationTokenHashService],
})
export class ActivationTokenHashModule {}
