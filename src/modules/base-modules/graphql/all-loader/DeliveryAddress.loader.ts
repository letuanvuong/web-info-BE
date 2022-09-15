import { LeanDocument } from 'mongoose'
import { DeliveryAddressDocument } from 'src/modules/DeliveryAddress/schemas/DeliveryAddress.schema'

import { ServiceManager } from '../../service-manager/service-manager'
import { DeliveryAddressService } from './../../../DeliveryAddress/DeliveryAddress.service'
import { MyDataLoader } from './my-data-loader'

export function createDeliveryAddressByIdLoader(
  serviceManager: ServiceManager,
) {
  return new MyDataLoader<string, LeanDocument<DeliveryAddressDocument>>(
    async (staffIds) => {
      const deliveryAddressService = serviceManager.get(DeliveryAddressService)
      let staffs = await deliveryAddressService.findDeliveryAddressByFilter({
        _id: { $in: [...staffIds] },
      })

      if (!staffs) staffs = []

      const staffHashById = staffs.reduce<
        Record<string, LeanDocument<DeliveryAddressDocument>>
      >((output, currentStaff) => {
        if (currentStaff._id) {
          output[currentStaff._id] = currentStaff
        }
        return output
      }, {})

      // map below used for keeping data output has same order as list ids input
      return staffIds.map((eachId) => staffHashById[eachId])
    },
  )
}
