import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { FilterQuery, Model } from 'mongoose'
import { StringFactory } from 'src/helper'
import { InputOptionsQueryCustomer, InputUpdateCustomer } from 'src/schema'

import { MyContext } from '../base-modules/my-context/my-context'
import { ServiceManager } from '../base-modules/service-manager/service-manager'
import { CustomerDocument, CustomerEntity } from './schemas/Customer.schema'

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel(CustomerEntity.name)
    public customerModel: Model<CustomerDocument>,
    private readonly serviceManager: ServiceManager,
  ) {}

  async getCustomers(): Promise<CustomerDocument[]> {
    return this.customerModel.find({}).lean()
  }

  /** can upgrade more filter variables */
  async findCustomers(queryOptions?: InputOptionsQueryCustomer) {
    const { user_Id, _id } = queryOptions
    const filterCustomer: FilterQuery<CustomerDocument>['$and'] = [
      { _id: { $ne: null } },
    ]
    if (user_Id?.length) filterCustomer.push({ user_Id: { $in: user_Id } })
    if (_id?.length) filterCustomer.push({ _id: { $in: _id } })
    return this.customerModel.find({ $and: filterCustomer }).lean()
  }

  async createCustomer(
    customerInfo: Partial<CustomerEntity>,
  ): Promise<CustomerDocument> {
    const newCustomer = new CustomerEntity(customerInfo)
    /** used for createdBy, can pass args to override */
    const currentUserSlim = await this.serviceManager
      .get(MyContext)
      .get()
      .authManager.getCurrentUserSlim()

    const rawResult = await this.customerModel.create({
      createdBy: currentUserSlim,
      ...newCustomer,
    })
    return rawResult
  }

  async updateCustomer(
    user_Id: string,
    updateInput: InputUpdateCustomer,
  ): Promise<CustomerDocument> {
    const currentUserSlim = await this.serviceManager
      .get(MyContext)
      .get()
      .authManager.getCurrentUserSlim()

    const unsignedFullName = StringFactory.formatToUnsigned(
      updateInput.fullName,
    )

    const updatedCustomer = await this.customerModel.findOneAndUpdate(
      { user_Id },
      {
        $set: {
          ...updateInput,
          unsignedFullName,
          updatedBy: currentUserSlim,
          updatedAt: Date.now(),
        },
      },
      { new: true },
    )

    return updatedCustomer
  }
}
