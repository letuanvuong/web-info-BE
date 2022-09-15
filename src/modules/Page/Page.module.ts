import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { PageResolver } from './Page.resolver'
import { PageService } from './Page.service'
import { PageEntity, PageSchema } from './schemas/Page.schema'
@Module({
  imports: [
    MongooseModule.forFeature([{ name: PageEntity.name, schema: PageSchema }]),
  ],
  providers: [PageService, PageResolver],
  exports: [PageService],
})
export class PageModule {}
