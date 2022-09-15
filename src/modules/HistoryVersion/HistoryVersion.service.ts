import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { ApolloError } from 'apollo-server-express'
import { Model } from 'mongoose'
import { EnumContentHistoryType, InputContentHistory } from 'src/schema'

import { MyContext } from '../base-modules/my-context/my-context'
import { ServiceManager } from '../base-modules/service-manager/service-manager'
import { DataEmptyError } from './HistoryVersion.error'
import {
  HistoryVersionDocument,
  HistoryVersionEntity,
} from './schemas/HistoryVersion.schema'

@Injectable()
export class HistoryVersionService {
  constructor(
    @InjectModel(HistoryVersionEntity.name)
    public HistoryVersionModel: Model<HistoryVersionDocument>,
    private readonly serviceManager: ServiceManager,
  ) {}

  async createContentHistory(
    input: InputContentHistory,
  ): Promise<HistoryVersionDocument> {
    try {
      const {
        type,
        idPage,
        dataPage,
        idService,
        dataService,
        idBlog,
        dataBlog,
      } = input

      const currentUserSlim = await this.serviceManager
        .get(MyContext)
        .get()
        .authManager.getCurrentUserSlim()

      const id = [
        {
          idPage,
          dataPage,
        },
        {
          idBlog,
          dataBlog,
        },
        {
          idService,
          dataService,
        },
      ].filter((item) => {
        const key = Object.keys(item)
        return item[key[0]] && item[key[1]]
      })[0]

      if (!id) {
        throw new DataEmptyError(`data input wrong field or missing`)
      }

      const key = Object.keys(id)
      let version
      const versionNumber = await this.HistoryVersionModel.findOne({
        [key[0]]: id[key[0]],
        type,
        isDeleted: false,
      }).sort({ createdAt: -1 })

      if (versionNumber) {
        version = versionNumber.version + 1
      } else {
        version = 1
      }

      const newCHVer = new this.HistoryVersionModel({
        version,
        type,
        [key[1]]: id[key[1]],
        createdBy: currentUserSlim,
        ...input,
      })

      const newVersion = await newCHVer.save()

      return newVersion
    } catch (err) {
      throw new ApolloError(err)
    }
  }

  async getContentHistory(
    idContent: string,
    type: EnumContentHistoryType,
  ): Promise<HistoryVersionDocument[]> {
    try {
      const data = await this.HistoryVersionModel.find({
        [`id${type}`]: idContent,
        type,
        isDeleted: false,
      })
      if (!data) throw new ApolloError('version not found!')
      return data
    } catch (err) {
      throw new ApolloError(err)
    }
  }

  async deleteContentHistory(_id: string): Promise<boolean> {
    try {
      const currentUserSlim = await this.serviceManager
        .get(MyContext)
        .get()
        .authManager.getCurrentUserSlim()

      const result = await this.HistoryVersionModel.findOneAndUpdate(
        { _id },
        {
          isDeleted: true,
          deleteBy: currentUserSlim,
          deleteAt: Date.now(),
        },
      )
      return !!result
    } catch (err) {
      throw new ApolloError(err)
    }
  }

  async renameVersion(_id: string, name: string): Promise<boolean> {
    try {
      const currentUserSlim = await this.serviceManager
        .get(MyContext)
        .get()
        .authManager.getCurrentUserSlim()

      const result = await this.HistoryVersionModel.findOneAndUpdate(
        { _id, isDeleted: false },
        {
          name: name.trim(),
          updatedBy: currentUserSlim,
          updatedAt: Date.now(),
        },
      )
      return !!result
    } catch (err) {
      throw new ApolloError(err)
    }
  }
}
