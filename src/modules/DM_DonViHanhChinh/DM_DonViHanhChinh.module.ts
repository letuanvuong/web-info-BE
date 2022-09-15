import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { DM_DonViHanhChinhResolver } from './DM_DonViHanhChinh.resolver'
import { DM_DonViHanhChinhService } from './DM_DonViHanhChinh.service'
import {
  DM_DonViHanhChinh,
  DM_DonViHanhChinhSchema,
} from './schemas/DM_DonViHanhChinh.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DM_DonViHanhChinh.name, schema: DM_DonViHanhChinhSchema },
    ]),
  ],
  providers: [DM_DonViHanhChinhResolver, DM_DonViHanhChinhService],
  exports: [DM_DonViHanhChinhService],
})
export class DM_DonViHanhChinhModule {}
