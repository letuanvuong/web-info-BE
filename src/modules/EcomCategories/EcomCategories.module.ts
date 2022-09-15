import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { EcomCategoriesResolver } from './EcomCategories.resolver'
import { EcomCategoriesService } from './EcomCategories.service'
import {
  EcomCategoriesEntity,
  EcomCategoriesSchema,
} from './schemas/EcomCategories.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: EcomCategoriesEntity.name,
        schema: EcomCategoriesSchema,
      },
    ]),
  ],
  providers: [EcomCategoriesService, EcomCategoriesResolver],
  exports: [EcomCategoriesService],
})
export class EcomCategoriesModule {}
