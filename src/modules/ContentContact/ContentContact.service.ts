import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { ApolloError } from 'apollo-server-express'
import { Model } from 'mongoose'
import { EnumLanguage, InputContentContact } from 'src/schema'

import {
  ContentContactDocument,
  ContentContactEntity,
} from './schemas/ContentContact.schema'

@Injectable()
export class ContentContactService {
  constructor(
    @InjectModel(ContentContactEntity.name)
    private contentContactModel: Model<ContentContactDocument>,
  ) {}

  async findContentContact(
    language: EnumLanguage,
  ): Promise<ContentContactDocument> {
    const foundContentContact = await this.contentContactModel.findOne({
      language,
    })

    return foundContentContact
  }

  async findContentContactMatchAny(
    matchConditions: Partial<ContentContactEntity>[],
  ) {
    const contentContact = await this.contentContactModel.findOne({
      $and: [{ $or: matchConditions }],
    })
    return contentContact
  }

  async createContentContact(
    newInput: InputContentContact,
  ): Promise<ContentContactDocument | ApolloError> {
    const contentContactEntity = new this.contentContactModel({ ...newInput })
    const createdContentContact = await contentContactEntity.save()
    return createdContentContact
  }

  async updateContentContact(
    _id: string,
    updateInput: InputContentContact,
  ): Promise<ContentContactDocument | ApolloError> {
    const updatedContentContact =
      await this.contentContactModel.findOneAndUpdate(
        { _id },
        { $set: { ...updateInput } },
        { new: true },
      )

    return updatedContentContact
  }
}
