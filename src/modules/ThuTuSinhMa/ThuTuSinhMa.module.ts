import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { ThuTuSinhMa, ThuTuSinhMaSchema } from './schemas/ThuTuSinhMa.schema'
import { ThuTuSinhMaService } from './ThuTuSinhMa.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ThuTuSinhMa.name, schema: ThuTuSinhMaSchema },
    ]),
  ],
  providers: [ThuTuSinhMaService],
  exports: [ThuTuSinhMaService],
})
export class ThuTuSinhMaModule {}
