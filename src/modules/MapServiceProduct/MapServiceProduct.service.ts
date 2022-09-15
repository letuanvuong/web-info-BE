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
  NotFoundStockModelIdError,
  ServiceMapNotFoundError,
} from './MapServiceProduct.error'
import {
  MapServiceProductDocument,
  MapServiceProductEntity,
} from './schemas/MapServiceProduct.schema'

@Injectable()
export class MapServiceProductService {
  constructor(
    @InjectModel(MapServiceProductEntity.name)
    public mapServiceProductModel: Model<MapServiceProductDocument>,
    private readonly serviceManager: ServiceManager,
    @InjectModel(StockModelEntity.name)
    public stockModelModel: Model<StockModelDocument>,
  ) {}

  async getMapServiceProducts(): Promise<MapServiceProductDocument[]> {
    try {
      return await this.mapServiceProductModel
        .find()
        .populate('service')
        .populate('stockModel')
        .sort({ createdAt: -1 })
        .lean()
    } catch (error) {
      throw new ApolloError(error)
    }
  }

  async getMapServiceProductsByService(
    idService: string,
    limit: number,
  ): Promise<MapServiceProductDocument[]> {
    try {
      return await this.mapServiceProductModel
        .find({
          idService,
        })
        .populate('service')
        .populate('stockModel')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean()
    } catch (error) {
      throw new ApolloError(error)
    }
  }

  async createMapServiceProduct(
    idService: string,
    idsStockModel: string[],
  ): Promise<MapServiceProductDocument[]> {
    try {
      const existed = await this.mapServiceProductModel
        .find({
          idService,
          idStockModel: {
            $exists: true,
          },
        })
        .lean()

      const existedIds = existed.map((e) => e._id)
      const existedIdsProduct = existed.map((e) => e.idStockModel)

      if (!idsStockModel.length) {
        await this.mapServiceProductModel.deleteMany({
          _id: {
            $in: existedIds,
          },
        })

        return await this.mapServiceProductModel
          .find({
            idService,
            idStockModel: {
              $exists: true,
            },
          })
          .lean()
      }

      let needInsertArr = []
      let needDeleteArr = []

      if (!existedIds.length) {
        needInsertArr = [...idsStockModel]
      } else {
        needDeleteArr = existed.reduce((res, elem) => {
          if (!idsStockModel.includes(elem.idStockModel)) {
            res.push(elem._id)
          }
          return res
        }, [])
      }
      needInsertArr = idsStockModel.reduce((res, elem) => {
        if (!existedIdsProduct.includes(elem)) {
          res.push(elem)
        }
        return res
      }, [])

      if (needDeleteArr.length) {
        await this.mapServiceProductModel.deleteMany({
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
          idService,
          isDeleted: false,
          idStockModel: elem,
          createdAt: moment().valueOf(),
          createdBy: currentUserSlim,
        }))

        await this.mapServiceProductModel.insertMany(inputs)
      }

      return await this.mapServiceProductModel
        .find({
          idService,
          idStockModel: {
            $exists: true,
          },
        })
        .lean()
    } catch (error) {
      throw new ApolloError(error)
    }
  }

  async removeMapServiceProduct(
    idService: string,
    idsStockModel: string[],
  ): Promise<boolean> {
    try {
      const existed = await this.mapServiceProductModel
        .find({
          idService,
          idStockModel: {
            $exists: true,
          },
        })
        .lean()
      if (!existed) throw new ServiceMapNotFoundError()
      const findAllLinked = await this.mapServiceProductModel.find({
        idService,
        idStockModel: { $in: idsStockModel },
      })
      const getIds = findAllLinked?.map((stockModel) => stockModel._id)
      const deleteLinked = await this.mapServiceProductModel.deleteMany({
        _id: { $in: getIds },
      })
      return !!deleteLinked
      // bo sung filter isFeatureBlog
      return false
    } catch (error) {
      throw new ApolloError(error)
    }
  }

  async removeLinkedStockModelOfServiceRelated(
    idStockModel: string,
  ): Promise<boolean> {
    const currentStockModel = await this.stockModelModel.findOne({
      _id: idStockModel,
    })
    if (!currentStockModel) throw new NotFoundStockModelIdError()
    const findAllLinked = await this.mapServiceProductModel.find({
      idStockModel,
    })
    const getIds = findAllLinked?.map((stockModel) => stockModel._id)
    const deleteLinked = await this.mapServiceProductModel.deleteMany({
      _id: { $in: getIds },
    })
    return !!deleteLinked
  }
}
