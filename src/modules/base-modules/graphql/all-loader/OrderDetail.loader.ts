import { LeanDocument } from 'mongoose'
import { OrderDetailService } from 'src/modules/OrderDetail/OrderDetail.service'
import { OrderDetailDocument } from 'src/modules/OrderDetail/schemas/OrderDetail.schema'

import { ServiceManager } from '../../service-manager/service-manager'
import { MyDataLoader } from './my-data-loader'

export function createOrderDetailByOrderIdLoader(
  serviceManager: ServiceManager,
) {
  return new MyDataLoader<string, LeanDocument<OrderDetailDocument>[]>(
    async (_ids) => {
      const orderService = serviceManager.get(OrderDetailService)
      let orderDetails = await orderService.findOrderDetailByFilter({
        idOrder: { $in: [..._ids] },
      })

      if (!orderDetails) orderDetails = []

      const orderDetailHash = orderDetails.reduce<
        Record<string, LeanDocument<OrderDetailDocument>[]>
      >((output, currentOrderDetail) => {
        const idOrder = currentOrderDetail.idOrder
        // init array
        if (!output[idOrder]) output[idOrder] = []
        output[idOrder].push(currentOrderDetail)
        return output
      }, {})

      return _ids.map((eachId) => orderDetailHash[eachId] || [])
    },
  )
}
