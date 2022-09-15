import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { ApolloError } from 'apollo-server-express'
import { Model } from 'mongoose'
import { EnumLanguage, InputContentMenu } from 'src/schema'

import {
  ContentMenuDocument,
  ContentMenuEntity,
} from './schemas/ContentMenu.schema'

@Injectable()
export class ContentMenuService {
  constructor(
    @InjectModel(ContentMenuEntity.name)
    private contentMenuModel: Model<ContentMenuDocument>,
  ) {}

  async findContentMenu(language: EnumLanguage): Promise<ContentMenuDocument> {
    const foundContentMenu = await this.contentMenuModel.findOne({
      language,
    })

    return foundContentMenu
  }

  async findContentMenuMatchAny(matchConditions: Partial<ContentMenuEntity>[]) {
    const contentMenu = await this.contentMenuModel.findOne({
      $and: [{ $or: matchConditions }],
    })
    return contentMenu
  }

  async createContentMenu(
    newInput: InputContentMenu,
  ): Promise<ContentMenuDocument | ApolloError> {
    const contentMenuEntity = new this.contentMenuModel({ ...newInput })
    const createdContentMenu = await contentMenuEntity.save()
    return createdContentMenu
  }

  async updateContentMenu(
    _id: string,
    updateInput: InputContentMenu,
  ): Promise<ContentMenuDocument | ApolloError> {
    const updatedContentMenu = await this.contentMenuModel.findOneAndUpdate(
      { _id },
      { $set: { ...updateInput } },
      { new: true },
    )

    return updatedContentMenu
  }
}
