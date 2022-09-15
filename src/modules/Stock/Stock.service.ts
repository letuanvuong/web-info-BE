import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { ApolloError } from 'apollo-server-express'
import { Model } from 'mongoose'
import { StockModelUnit } from 'src/schema'

import { OrderDocument, OrderEntity } from '../Order/schemas/order.schema'
import {
  OrderDetailDocument,
  OrderDetailEntity,
} from '../OrderDetail/schemas/OrderDetail.schema'
import {
  StockModelDocument,
  StockModelEntity,
} from '../StockModel/schemas/StockModel.schema'
import { StockDocument, StockEntity } from './schemas/Stock.schema'
import { StockNotEnoughError } from './Stock.error'
@Injectable()
export class StockService {
  constructor(
    @InjectModel(StockEntity.name)
    private stock: Model<StockDocument>,
    @InjectModel(StockModelEntity.name)
    private stockModel: Model<StockModelDocument>,
    @InjectModel(OrderEntity.name)
    private oder: Model<OrderDocument>,
    @InjectModel(OrderDetailEntity.name)
    private oderDetail: Model<OrderDetailDocument>,
  ) {}

  async findStockMatchAny(
    matchConditions: Partial<StockEntity>[],
  ): Promise<StockDocument> {
    const result = await this.stock.findOne({
      $and: [{ $or: matchConditions }],
    })
    return result
  }

  async checkInventory(idWarehouse: string, idOrder: string): Promise<boolean> {
    const listOderDetail = await this.oderDetail.find({
      idOrder,
    })
    for (const orderDetail of listOderDetail) {
      const idStockModel = orderDetail.idStockModel
      const quantity = orderDetail.count
      const stocks = await this.stock.find({
        idStockModel,
        idStore: idWarehouse,
      })

      const availableStockCount = stocks
        .map((item) => item?.quantity?.[0] || 0)
        .reduce((prev, next) => prev + next, 0)
      if (availableStockCount < quantity) {
        const stockModel = await this.stockModel.findOne({ _id: idStockModel })
        throw new StockNotEnoughError(`${stockModel?.name}`)
      }
    }

    return true
  }

  async getStockRetail(
    idSrcStore: string,
    idOrderDetail: string,
    idStockModel: string,
    type: string = 'default', // ? default lấy ưu tiên date
  ): Promise<boolean> {
    const orderDetail = await this.oderDetail.findOne({
      _id: idOrderDetail,
    })
    let getCount = orderDetail.count
    const stockMinusValues: { [idStock: string]: number } = {}

    if (type === 'default') {
      const stocks = await this.stock.find({
        idStockModel,
        idStore: idSrcStore,
        count: { $gt: 0 },
      })

      if (!stocks?.length) throw new ApolloError('not stock in store')

      const sortStocks = stocks.sort((a, b) =>
        !a.expiration || a.expiration < b.expiration
          ? -1
          : a.expiration > b.expiration
          ? 1
          : 0,
      )
      for (const stock of sortStocks) {
        if (!getCount) break

        const count =
          getCount > stock.quantity?.[0] ? stock.quantity?.[0] : getCount
        if (!stockMinusValues[stock._id]) stockMinusValues[stock._id] = 0

        stockMinusValues[stock._id] += count
        getCount -= count
      }
    } else throw new ApolloError('expected type is default')
    for (const idStock of Object.keys(stockMinusValues)) {
      await this.minusInStock(idStock, stockMinusValues[idStock])
    }
    return true
  }

  async minusInStock(
    idStock: string,
    quantityProduct: number,
    stockModelUnit?: StockModelUnit,
  ): Promise<
    { count: number; quantity: number[]; quantityString: string } | ApolloError
  > {
    try {
      if (quantityProduct < 0)
        throw new ApolloError('quantityProduct cannot be negative')
      const stock = await this.stock.findOne({
        _id: idStock,
      })
      if (!stock) throw new ApolloError('not found stock')

      let { count } = stock
      const { quantity } = stock
      const { realFactor, name } = stockModelUnit
        ? stockModelUnit
        : (
            await this.stockModel.findOne({
              _id: stock.idStockModel,
            })
          ).unit

      if (!realFactor || !realFactor.length)
        throw new ApolloError('not realFactor in stockModel')
      const amount = quantityProduct * realFactor[0]
      let newCount = (count -= amount)
      let quantityString = ''
      realFactor.forEach((numberFactor, index) => {
        if ((!newCount || !numberFactor) && index >= quantity.length) return
        quantity[index] = Math.floor(newCount / numberFactor)
        newCount %= numberFactor
        quantityString += quantity[index]
          ? `${quantity[index]} ${name[index]} `
          : ''
      })

      quantityString = quantityString.trim()
      await this.stock.updateOne(
        { _id: idStock },
        {
          $set: {
            count,
            quantity,
            quantityString,
          },
        },
      )
      return { count, quantity, quantityString }
    } catch (error) {
      throw new ApolloError(error)
    }
  }
}
