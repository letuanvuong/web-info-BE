import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { HistoryVersionResolver } from './HistoryVersion.resolver'
import { HistoryVersionService } from './HistoryVersion.service'
import {
  HistoryVersionEntity,
  HistoryVersionSchema,
} from './schemas/HistoryVersion.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HistoryVersionEntity.name, schema: HistoryVersionSchema },
    ]),
  ],
  providers: [HistoryVersionService, HistoryVersionResolver],
  exports: [HistoryVersionService],
})
export class HistoryVersionModule {}
