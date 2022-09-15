import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { NodeController } from './node.controller'
import { NodeResolver } from './node.resolver'
import { NodeService } from './node.service'
import { NodeEntity, NodeSchema } from './schemas/node.schema'
@Module({
  imports: [
    MongooseModule.forFeature([{ name: NodeEntity.name, schema: NodeSchema }]),
  ],
  providers: [NodeService, NodeResolver],
  exports: [NodeService],
  controllers: [NodeController],
})
export class NodeModule {}
