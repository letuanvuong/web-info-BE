import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { EnumLanguage } from 'src/schema'

import {
  ContentSecurityDocument,
  ContentSecurityEntity,
} from './schemas/ContentSecurity.schema'

@Injectable()
export class ContentSecurityService {
  constructor(
    @InjectModel(ContentSecurityEntity.name)
    private contentSecurityModel: Model<ContentSecurityDocument>,
  ) {}

  async getContentSecurity(
    language: EnumLanguage = EnumLanguage.vi,
  ): Promise<ContentSecurityDocument> {
    const foundContentSecurity = await this.contentSecurityModel.findOne({
      language,
    })

    return foundContentSecurity
  }

  async createOrUpdateContentSecurity(
    language: EnumLanguage,
    input,
  ): Promise<ContentSecurityDocument> {
    return this.contentSecurityModel.findOneAndUpdate(
      { _id: `default_${language}` },
      { ...input, language },
      { upsert: true, new: true },
    )
  }
}
