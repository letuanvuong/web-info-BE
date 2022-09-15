import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { EnumLanguage } from 'src/schema'

import {
  ContentPurchaseInfoDocument,
  ContentPurchaseInfoEntity,
} from './schemas/ContentPurchaseInfo.schema'

@Injectable()
export class ContentPurchaseInfoService {
  constructor(
    @InjectModel(ContentPurchaseInfoEntity.name)
    private contentPurchaseInfoModel: Model<ContentPurchaseInfoDocument>,
  ) {}

  async getContentPurchaseInfo(
    language: EnumLanguage = EnumLanguage.vi,
  ): Promise<ContentPurchaseInfoDocument> {
    const foundContentPurchaseInfo =
      await this.contentPurchaseInfoModel.findOne({
        language,
      })

    return foundContentPurchaseInfo
  }

  async createOrUpdateContentPurchaseInfo(
    language: EnumLanguage,
    input,
  ): Promise<ContentPurchaseInfoDocument> {
    return this.contentPurchaseInfoModel.findOneAndUpdate(
      { _id: `default_${language}` },
      { ...input, language },
      { upsert: true, new: true },
    )
  }
}
