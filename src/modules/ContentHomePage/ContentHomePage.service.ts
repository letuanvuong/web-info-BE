import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { ApolloError } from 'apollo-server-express'
import { Model } from 'mongoose'
import { EnumLanguage, InputContentHomePage } from 'src/schema'

import {
  ContentHomePageDocument,
  ContentHomePageEntity,
} from './schemas/ContentHomePage.schema'

@Injectable()
export class ContentHomePageService {
  constructor(
    @InjectModel(ContentHomePageEntity.name)
    private contentHomePageModel: Model<ContentHomePageDocument>,
  ) {}

  async findContentHomePage(
    language: EnumLanguage,
  ): Promise<ContentHomePageDocument> {
    const foundContentHomePage = await this.contentHomePageModel.findOne({
      language,
    })

    return foundContentHomePage
  }

  async findOneContentHomePage(
    language: any,
  ): Promise<ContentHomePageDocument> {
    const foundContentHomePage = await this.contentHomePageModel.findOne({
      language,
    })

    return foundContentHomePage
  }

  async findContentHomePageMatchAny(
    matchConditions: Partial<ContentHomePageEntity>[],
  ) {
    const contentHomePage = await this.contentHomePageModel.findOne({
      $and: [{ $or: matchConditions }],
    })
    return contentHomePage
  }

  async createContentHomePage(
    newInput: InputContentHomePage,
  ): Promise<ContentHomePageDocument | ApolloError> {
    const contentHomePageEntity = new this.contentHomePageModel({ ...newInput })
    const createdContentHomePage = await contentHomePageEntity.save()
    return createdContentHomePage
  }

  async updateContentHomePage(
    _id: string,
    updateInput: InputContentHomePage,
  ): Promise<ContentHomePageDocument | ApolloError> {
    const updatedContentHomePage =
      await this.contentHomePageModel.findOneAndUpdate(
        { _id },
        { $set: { ...updateInput } },
        { new: true },
      )

    return updatedContentHomePage
  }
}
