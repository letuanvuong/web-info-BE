import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { ApolloError } from 'apollo-server-express'
import * as moment from 'moment'
import { FilterQuery, Model } from 'mongoose'
import { IDFactory, StringFactory } from 'src/helper'
import { IDeliveryAddress } from 'src/schema'

import { IContext } from '../base-modules/graphql/gql.type'
import {
  DeliveryAddressDocument,
  DeliveryAddressEntity,
} from './schemas/DeliveryAddress.schema'
@Injectable()
export class DeliveryAddressService {
  constructor(
    @InjectModel(DeliveryAddressEntity.name)
    public deliveryAddressModel: Model<DeliveryAddressDocument>,
  ) {}

  private setFalseDefaultForAll = async (idCustomer) => {
    await this.deliveryAddressModel.updateMany(
      {
        idCustomer,
      },
      {
        $set: {
          isDefault: false,
        },
      },
    )
  }

  public async getDeliveryAddressesByIdCustomer(args: {
    idCustomer: string
  }): Promise<any> {
    try {
      const dataDeliveryAddresses = await this.deliveryAddressModel
        .find({
          idCustomer: args.idCustomer,
          isDeleted: {
            $ne: true,
          },
        })
        .lean()
      return dataDeliveryAddresses
    } catch (error) {
      throw new ApolloError(error)
    }
  }

  public async getDefaultDeliveryAddress(args: {
    idCustomer: string
  }): Promise<any> {
    try {
      const dataDeliveryAddresses = await this.deliveryAddressModel
        .findOne({
          idCustomer: args.idCustomer,
          isDeleted: {
            $ne: true,
          },
          isDefault: true,
        })
        .lean()
      return dataDeliveryAddresses
    } catch (error) {
      throw new ApolloError(error)
    }
  }

  public async createDeliveryAddress(
    args: { input: IDeliveryAddress },
    ctx: IContext,
  ): Promise<any> {
    try {
      const currentUserSlim = await ctx?.authManager.getCurrentUserSlim()
      if (args.input.isDefault) {
        await this.setFalseDefaultForAll(args.input.idCustomer)
      }
      const newItem = new DeliveryAddressEntity({
        _id: IDFactory.generateID(),
        ...args.input,
        unsignedFullName: StringFactory.formatToUnsigned(args.input.fullName),
        createdBy: currentUserSlim,
      })
      await this.deliveryAddressModel.create(newItem)
      return newItem
    } catch (error) {
      throw new ApolloError(error)
    }
  }

  public async updateDeliveryAddress(
    args: { idDeliveryAddress: string; input: IDeliveryAddress },
    ctx,
  ): Promise<any> {
    try {
      const currentUserSlim = await ctx?.authManager.getCurrentUserSlim()
      if (!args.input.oldIsDefault && args.input.isDefault) {
        await this.setFalseDefaultForAll(args.input.idCustomer)
      }
      await this.deliveryAddressModel.updateOne(
        {
          _id: args.idDeliveryAddress,
        },
        {
          $set: {
            fullName: args.input.fullName,
            unsignedFullName: StringFactory.formatToUnsigned(
              args.input.fullName,
            ),
            companyName: args.input.companyName,
            phoneNumber: args.input.phoneNumber,
            detailAddress: args.input.detailAddress,
            isDefault: args.input.isDefault,
            updatedAt: moment().valueOf(),
            updatedBy: currentUserSlim,
          },
        },
      )
      return true
    } catch (error) {
      throw new ApolloError(error)
    }
  }

  public async deleteDeliveryAddress(
    args: { idDeliveryAddress: string },
    ctx,
  ): Promise<any> {
    try {
      const currentUserSlim = await ctx?.authManager.getCurrentUserSlim()
      await this.deliveryAddressModel.updateOne(
        {
          _id: args.idDeliveryAddress,
        },
        {
          $set: {
            isDeleted: true,
            deletedAt: moment().valueOf(),
            deletedBy: currentUserSlim,
          },
        },
      )
      return true
    } catch (error) {
      throw new ApolloError(error)
    }
  }

  async findDeliveryAddressByFilter(
    filter: FilterQuery<DeliveryAddressDocument>,
    projection: any = {},
  ) {
    return this.deliveryAddressModel
      .find(filter)
      .select(projection)
      .lean()
      .exec()
  }
}
