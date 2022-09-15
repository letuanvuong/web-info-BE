import { LeanDocument } from 'mongoose'
import { CustomerService } from 'src/modules/Customer/Customer.service'
import { CustomerDocument } from 'src/modules/Customer/schemas/Customer.schema'

import { ServiceManager } from '../../service-manager/service-manager'
import { MyDataLoader } from './my-data-loader'

export function createCustomerByUserIdLoader(serviceManager: ServiceManager) {
  return new MyDataLoader<string, LeanDocument<CustomerDocument>>(
    async (userIds) => {
      const customerService = serviceManager.get(CustomerService)
      let customers = await customerService.findCustomers({
        user_Id: [...userIds],
      })

      if (!customers) customers = []

      const customerHashByUserId = customers.reduce<
        Record<string, LeanDocument<CustomerDocument>>
      >((output, currentCustomer) => {
        if (currentCustomer.user_Id) {
          output[currentCustomer.user_Id] = currentCustomer
        }
        return output
      }, {})

      // map below used for keeping data output has same order as list ids input
      return userIds.map((eachId) => customerHashByUserId[eachId])
    },
  )
}

export function createCustomerByIdLoader(serviceManager: ServiceManager) {
  return new MyDataLoader<string, LeanDocument<CustomerDocument>>(
    async (customerIds) => {
      const customerService = serviceManager.get(CustomerService)
      let customers = await customerService.findCustomers({
        _id: [...customerIds],
      })

      if (!customers) customers = []

      const customerHashBy_Id = customers.reduce<
        Record<string, LeanDocument<CustomerDocument>>
      >((output, currentCustomer) => {
        if (currentCustomer._id) {
          output[currentCustomer._id] = currentCustomer
        }
        return output
      }, {})

      // map below used for keeping data output has same order as list ids input
      return customerIds.map((eachId) => customerHashBy_Id[eachId])
    },
  )
}
