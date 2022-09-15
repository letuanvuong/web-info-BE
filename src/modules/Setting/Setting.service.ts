import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Setting as SettingGql, SettingType } from 'src/schema'

import { SettingDocument } from './schemas/Setting.schema'

export type updateSettingTypeDTO = {
  type: SettingType
  input: any
}

@Injectable()
export class SettingService {
  constructor(
    @InjectModel('settings') private settingModel: Model<SettingDocument>,
  ) {}

  public async getSetting(): Promise<SettingGql> {
    const setting = await this.settingModel.findOne({ _id: 'default' }).lean()
    return setting
  }

  public async updateSettingType(
    args: updateSettingTypeDTO,
  ): Promise<SettingGql> {
    const { type, input } = args
    const EnumSettingType = {
      Auth: 'auth',
      His: 'his',
      Report: 'report',
      Sm4: 'smartPharma',
      Ecommerce: 'ecommerce',
    }

    const updatedSettingType = await this.settingModel.findOneAndUpdate(
      { _id: 'default' },
      { $set: { [EnumSettingType[type]]: input } },
      { upsert: true, new: true },
    )

    return updatedSettingType
  }
}
