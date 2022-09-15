import { LeanDocument } from 'mongoose'
import { EcomCategoriesService } from 'src/modules/EcomCategories/EcomCategories.service'
import { EcomCategoriesDocument } from 'src/modules/EcomCategories/schemas/EcomCategories.schema'

import { ServiceManager } from '../../service-manager/service-manager'
import { MyDataLoader } from './my-data-loader'

export function createEcomCategoryLoader(serviceManager: ServiceManager) {
  return new MyDataLoader<string, LeanDocument<EcomCategoriesDocument>>(
    async (categoryIds) => {
      const ecomCategoryService = serviceManager.get(EcomCategoriesService)

      let ecomCategories = await ecomCategoryService.findCategories([
        ...categoryIds,
      ])

      if (!ecomCategories) ecomCategories = []

      const ecomCategoryHash = ecomCategories.reduce<
        Record<string, LeanDocument<EcomCategoriesDocument>>
      >((output, currentEcomCategory) => {
        if (currentEcomCategory._id) {
          output[currentEcomCategory._id] = currentEcomCategory
        }
        return output
      }, {})

      // map below used for keeping data output has same order as list ids input
      return categoryIds.map((eachId) => ecomCategoryHash[eachId])
    },
  )
}
