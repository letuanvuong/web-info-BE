import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { DATABASE_COLLECTION_NAME } from 'src/constant'

import { SettingSchema } from './schemas/Setting.schema'
import { SettingResolver } from './Setting.resolver'
import { SettingService } from './Setting.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DATABASE_COLLECTION_NAME.SETTING, schema: SettingSchema },
    ]),
  ],
  providers: [SettingResolver, SettingService],
  exports: [SettingService],
})
export class SettingModule {}
