import { ApolloError } from 'apollo-server-errors'

import { ServiceManager } from '../service-manager/service-manager'
import {
  createCustomerByIdLoader,
  createCustomerByUserIdLoader,
} from './all-loader/Customer.loader'
import { createDeliveryAddressByIdLoader } from './all-loader/DeliveryAddress.loader'
import { createEcomCategoryLoader } from './all-loader/EcomCategory.loader'
import { createOrderDetailByOrderIdLoader } from './all-loader/OrderDetail.loader'
import { createStaffByIdLoader } from './all-loader/Staff.loader'
import { createStockModelByIdLoader } from './all-loader/StockModel.loader'

/**
 * @note to add a new dataloader, declare it in this interface
 */
interface AvailableLoader {
  CustomerByUserIdLoader: ReturnType<typeof createCustomerByUserIdLoader>
  CustomerByIdLoader: ReturnType<typeof createCustomerByIdLoader>
  EcomCategoryLoader: ReturnType<typeof createEcomCategoryLoader>
  OrderDetailLoader: ReturnType<typeof createOrderDetailByOrderIdLoader>
  StockModelLoader: ReturnType<typeof createStockModelByIdLoader>
  StaffByIdLoader: ReturnType<typeof createStaffByIdLoader>
  DeliveryAddressByIdLoader: ReturnType<typeof createDeliveryAddressByIdLoader>
}

type LoaderCreator = {
  [Property in keyof AvailableLoader]: (
    serviceManager: ServiceManager,
  ) => AvailableLoader[Property]
}
/**
 * contain all creator function
 */
const loaderCreator: LoaderCreator = {
  CustomerByUserIdLoader: createCustomerByUserIdLoader,
  CustomerByIdLoader: createCustomerByIdLoader,
  EcomCategoryLoader: createEcomCategoryLoader,
  OrderDetailLoader: createOrderDetailByOrderIdLoader,
  StockModelLoader: createStockModelByIdLoader,
  StaffByIdLoader: createStaffByIdLoader,
  DeliveryAddressByIdLoader: createDeliveryAddressByIdLoader,
}

export class DataLoaderManager {
  constructor(private serviceManager: ServiceManager) {}

  private availableLoader: Partial<AvailableLoader> = {}

  getLoader<LoaderName extends string & keyof LoaderCreator>(
    loaderName: LoaderName,
  ): LoaderCreator[LoaderName] extends (...args: any) => any
    ? ReturnType<LoaderCreator[LoaderName]>
    : never

  getLoader(loaderName: keyof LoaderCreator) {
    // dynamic init loader when needed
    if (!this.availableLoader[loaderName]) {
      if (typeof loaderCreator[loaderName] !== 'function')
        throw new ApolloError(
          `creator function for ${loaderName} not available`,
        )
      this.availableLoader[loaderName] = loaderCreator[loaderName](
        this.serviceManager,
      ) as any
    }
    return this.availableLoader[loaderName]
  }
}
