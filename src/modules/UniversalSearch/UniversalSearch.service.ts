import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
  EnumBlogStatus,
  EnumStockModelStatus,
  EnumTypeSearch,
} from 'src/schema'

import { BlogDocument, BlogEntity } from '../Blog/schemas/Blog.schema'
import {
  ServiceDocument,
  ServiceEntity,
} from '../Service/schemas/Service.schema'
import {
  StockModelDocument,
  StockModelEntity,
} from '../StockModel/schemas/StockModel.schema'

@Injectable()
export class UniversalSearchService {
  constructor(
    @InjectModel(BlogEntity.name)
    private readonly blogModel: Model<BlogDocument>,
    @InjectModel(StockModelEntity.name)
    private readonly stockModels: Model<StockModelDocument>,
    @InjectModel(ServiceEntity.name)
    private readonly serviceModel: Model<ServiceDocument>,
  ) {}

  async searchByType(key: string, type: EnumTypeSearch) {
    const length = key?.length
    const regex = {
      $regex: new RegExp(
        `${key?.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
        'siu',
      ),
    }
    const SearchCollections = [
      {
        type: 'service',
        model: this.serviceModel,
        fieldName: 'service',
        fieldSearch: [
          { ['title']: regex },
          { ['sortDescription']: regex },
          { ['keywords']: regex },
        ],
        rules: {
          isDeleted: false,
        },
      },
      {
        type: 'blog',
        model: this.blogModel,
        fieldName: 'blog',
        fieldSearch: [
          { ['title']: regex },
          { ['sortContent']: regex },
          { ['keywords']: regex },
        ],
        rules: {
          status: EnumBlogStatus.Public,
        },
      },
      {
        type: 'product',
        model: this.stockModels,
        fieldName: 'stockModel',
        fieldSearch: [{ ['name']: regex }, { ['ecomDescription']: regex }],
        rules: {
          isEcommerce: true,
          allowGuest: true,
          isActive: true,
          ecomStatus: EnumStockModelStatus.Public,
        },
      },
    ]
    let typeResult
    for (const item of SearchCollections) {
      if (item.type === type) {
        typeResult = item
      }
    }
    if (!length) {
      const result = await typeResult.model.find({ ...typeResult.rules })
      return { [typeResult.fieldName]: result }
    }
    const result = await typeResult.model.find({
      $or: [...typeResult.fieldSearch],
      ...typeResult.rules,
    })
    if (result) return { [typeResult.fieldName]: result }
    return null
  }
}
