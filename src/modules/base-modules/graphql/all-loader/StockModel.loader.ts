import { LeanDocument } from 'mongoose'
import { StockModelDocument } from 'src/modules/StockModel/schemas/StockModel.schema'
import { StockModelService } from 'src/modules/StockModel/StockModel.service'

import { ServiceManager } from '../../service-manager/service-manager'
import { MyDataLoader } from './my-data-loader'

export function createStockModelByIdLoader(serviceManager: ServiceManager) {
  return new MyDataLoader<string, LeanDocument<StockModelDocument>>(
    async (_ids) => {
      const stockModelService = serviceManager.get(StockModelService)
      let stockModels = await stockModelService.findStockModelByFilter({
        _id: { $in: [..._ids] },
      })

      if (!stockModels) stockModels = []

      const stockModelsHash = stockModels.reduce<
        Record<string, LeanDocument<StockModelDocument>>
      >((output, currentStockModel) => {
        if (currentStockModel._id) {
          output[currentStockModel._id] = currentStockModel
        }
        return output
      }, {})

      // map below used for keeping data output has same order as list ids input
      return _ids.map((eachId) => stockModelsHash[eachId])
    },
  )
}
