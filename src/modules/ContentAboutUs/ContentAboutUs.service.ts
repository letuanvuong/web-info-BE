import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { EnumLanguage } from 'src/schema'

import {
  ContentAboutUsDocument,
  ContentAboutUsEntity,
} from './schemas/ContentAboutUs.schema'

@Injectable()
export class ContentAboutUsService {
  constructor(
    @InjectModel(ContentAboutUsEntity.name)
    private contentAboutUsModel: Model<ContentAboutUsDocument>,
  ) {}

  async getContentAboutUs(
    language: EnumLanguage = EnumLanguage.vi,
  ): Promise<ContentAboutUsDocument> {
    const foundContentAboutUs = await this.contentAboutUsModel.findOne({
      language,
    })

    return foundContentAboutUs
  }

  async createOrUpdateContentAboutUs(
    language: EnumLanguage,
    input,
  ): Promise<ContentAboutUsDocument> {
    return this.contentAboutUsModel.findOneAndUpdate(
      { _id: `default_${language}` },
      { ...input, language },
      { upsert: true, new: true },
    )
  }
}
