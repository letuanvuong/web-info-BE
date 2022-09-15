import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import {
  DM_DonViHanhChinh,
  DM_DonViHanhChinhSchema,
} from '../DM_DonViHanhChinh/schemas/DM_DonViHanhChinh.schema'
import { ThuTuSinhMaModule } from '../ThuTuSinhMa/ThuTuSinhMa.module'
import { Staff, StaffSchema } from './schemas/NhanVien.schema'
import { StaffResolver } from './Staff.resolver'
import { StaffService } from './Staff.service'
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Staff.name, schema: StaffSchema },
      { name: DM_DonViHanhChinh.name, schema: DM_DonViHanhChinhSchema },
    ]),
    ThuTuSinhMaModule,
  ],
  providers: [StaffResolver, StaffService],
  exports: [StaffService],
})
export class StaffModule {}
