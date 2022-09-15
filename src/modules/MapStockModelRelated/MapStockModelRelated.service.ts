import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { ApolloError } from 'apollo-server-errors'
import * as moment from 'moment'
import { Model } from 'mongoose'
import { IDFactory } from 'src/helper'
import {
  StockModelDocument,
  StockModelEntity,
} from 'src/modules/StockModel/schemas/StockModel.schema'

import { MyContext } from '../base-modules/my-context/my-context'
import { ServiceManager } from '../base-modules/service-manager/service-manager'
import {
  DuplicateStockModelIdError,
  NotFoundStockModelIdError,
} from './MapStockModelRelated.error'
import {
  MapStockModelRelatedDocument,
  MapStockModelRelatedEntity,
} from './schemas/MapStockModelRelated.schema'

@Injectable()
export class MapStockModelRelatedService {
  constructor(
    @InjectModel(MapStockModelRelatedEntity.name)
    public mapStockModelRelatedModel: Model<MapStockModelRelatedDocument>,
    @InjectModel(StockModelEntity.name)
    public stockModelModel: Model<StockModelDocument>,
    private readonly serviceManager: ServiceManager,
  ) {}

  async getMapStockModelRelateds(): Promise<MapStockModelRelatedDocument[]> {
    try {
      return await this.mapStockModelRelatedModel
        .find()
        .populate('stockModelRelated')
        .populate('stockModel')
        .sort({ createdAt: -1 })
        .lean()
    } catch (error) {
      throw new ApolloError(error)
    }
  }

  async getMapStockModelRelatedsByStockModel(
    idStockModel: string,
    limit?: number,
  ): Promise<MapStockModelRelatedDocument[]> {
    try {
      return await this.mapStockModelRelatedModel
        .find({
          idStockModel,
          idStockModelRelated: {
            $exists: true,
          },
        })
        .populate('stockModelRelated')
        .populate('stockModel')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean()
    } catch (error) {
      throw new ApolloError(error)
    }
  }

  async createMapStockModelRelated(
    idStockModel: string,
    idsStockModelRelated: string[],
  ): Promise<MapStockModelRelatedDocument[]> {
    try {
      if (idsStockModelRelated.includes(idStockModel)) {
        throw new DuplicateStockModelIdError()
      }

      const mergeStockModelId = [idStockModel, ...idsStockModelRelated]
      const stockModels = await this.stockModelModel.find({
        _id: { $in: mergeStockModelId },
      })

      if (mergeStockModelId.length !== stockModels.length) {
        throw new NotFoundStockModelIdError()
      }

      const existed = await this.mapStockModelRelatedModel
        .find({
          idStockModel,
          idStockModelRelated: {
            $exists: true,
          },
        })
        .lean()

      const existedIds = existed.map((e) => e._id)
      const existedIdsStockModelRelated = existed.map(
        (e) => e.idStockModelRelated,
      )

      if (!idsStockModelRelated.length) {
        await this.mapStockModelRelatedModel.deleteMany({
          _id: {
            $in: existedIds,
          },
        })

        return await this.getMapStockModelRelatedsByStockModel(idStockModel)
      }

      let needInsertArr = []
      let needDeleteArr = []

      if (!existedIds.length) {
        needInsertArr = [...idsStockModelRelated]
      } else {
        needDeleteArr = existed.reduce((res, elem) => {
          if (!idsStockModelRelated.includes(elem.idStockModelRelated)) {
            res.push(elem._id)
          }
          return res
        }, [])
      }
      needInsertArr = idsStockModelRelated.reduce((res, elem) => {
        if (!existedIdsStockModelRelated.includes(elem)) {
          res.push(elem)
        }
        return res
      }, [])

      if (needDeleteArr.length) {
        await this.mapStockModelRelatedModel.deleteMany({
          _id: {
            $in: needDeleteArr,
          },
        })
      }

      const currentUserSlim = await this.serviceManager
        .get(MyContext)
        .get()
        .authManager.getCurrentUserSlim()

      if (needInsertArr.length) {
        const inputs = needInsertArr.map((elem) => ({
          _id: IDFactory.generateID(),
          idStockModel,
          isDeleted: false,
          idStockModelRelated: elem,
          createdAt: moment().valueOf(),
          createdBy: currentUserSlim,
        }))

        await this.mapStockModelRelatedModel.insertMany(inputs)
      }

      return await this.getMapStockModelRelatedsByStockModel(idStockModel)
    } catch (error) {
      throw new ApolloError(error)
    }
  }

  async removeLinkedStockModelRelated(idStockModel: string): Promise<boolean> {
    const currentStockModel = await this.stockModelModel.findOne({
      _id: idStockModel,
    })
    if (!currentStockModel) throw new NotFoundStockModelIdError()
    const findAllLinked = await this.mapStockModelRelatedModel.find({
      idStockModelRelated: idStockModel,
    })
    const getIds = findAllLinked?.map((stockModel) => stockModel._id)
    const deleteLinked = await this.mapStockModelRelatedModel.deleteMany({
      _id: { $in: getIds },
    })
    return !!deleteLinked
  }
}
