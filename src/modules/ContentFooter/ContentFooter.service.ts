import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { ApolloError } from 'apollo-server-express'
import { Model } from 'mongoose'
import { EnumLanguage, InputContentFooter } from 'src/schema'

import {
  ContentFooterDocument,
  ContentFooterEntity,
} from './schemas/ContentFooter.schema'

@Injectable()
export class ContentFooterService {
  constructor(
    @InjectModel(ContentFooterEntity.name)
    private contentFooterModel: Model<ContentFooterDocument>,
  ) {}

  async findContentFooter(
    language: EnumLanguage,
  ): Promise<ContentFooterDocument> {
    const foundContentFooter = await this.contentFooterModel.findOne({
      language,
    })

    return foundContentFooter
  }

  async findContentFooterMatchAny(
    matchConditions: Partial<ContentFooterEntity>[],
  ) {
    const contentFooter = await this.contentFooterModel.findOne({
      $and: [{ $or: matchConditions }],
    })
    return contentFooter
  }

  async createContentFooter(
    newInput: InputContentFooter,
  ): Promise<ContentFooterDocument | ApolloError> {
    const contentFooterEntity = new this.contentFooterModel({ ...newInput })
    const createdContentFooter = await contentFooterEntity.save()
    return createdContentFooter
  }

  async updateContentFooter(
    _id: string,
    updateInput: InputContentFooter,
  ): Promise<ContentFooterDocument | ApolloError> {
    const updatedContentFooter = await this.contentFooterModel.findOneAndUpdate(
      { _id },
      { $set: { ...updateInput } },
      { new: true },
    )

    return updatedContentFooter
  }
}
