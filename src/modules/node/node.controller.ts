/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller } from '@nestjs/common'
import { MessagePattern, RpcException } from '@nestjs/microservices'
import { MICROSERVICE_API } from 'src/constant'
import { Node, NodeInput } from 'src/schema'

import { IContext } from '../base-modules/graphql/gql.type'
import { NodeExistCodeError, NodeNotFoundError } from './node.error'
import { NodeService } from './node.service'
import { NodeDocument } from './schemas/node.schema'
interface UpdateNodeData {
  _id: string
  context: IContext
  updateNodeInput: NodeInput
}
@Controller('node')
export class NodeController {
  constructor(private readonly nodeService: NodeService) {}

  @MessagePattern(MICROSERVICE_API.get_nodes)
  async getNodes(data?): Promise<Node[]> {
    try {
      const { isGetAllNode } = data
      const nodes = await this.nodeService.getNodes(isGetAllNode)
      return nodes
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('error', error)
      throw new RpcException(error)
    }
  }

  @MessagePattern(MICROSERVICE_API.get_node_match_any)
  async getNode(data): Promise<Node> {
    try {
      const { _id } = data
      const node = await this.nodeService.findNodeMatchAny([{ _id }])
      return node
    } catch (error) {
      console.log('error', error)
      throw new RpcException(error)
    }
  }

  @MessagePattern(MICROSERVICE_API.update_node)
  async updateNode(data): Promise<NodeDocument | boolean> {
    try {
      const { _id, context, updateNodeInput } = data
      const foundNode = await this.nodeService.getNodeById(_id)
      if (!foundNode) throw new NodeNotFoundError('Organization does not exist')

      const sameNode = await this.nodeService.findNodeMatchAny([
        {
          ...updateNodeInput,
          _id,
        },
      ])

      if (sameNode) {
        return false
      }

      const updatedNode = await this.nodeService.updateNode(
        _id,
        updateNodeInput,
        context,
      )
      return updatedNode
    } catch (error) {
      console.log('error', error)
      throw new RpcException(error)
    }
  }

  @MessagePattern(MICROSERVICE_API.get_node_by_ids)
  async getNodeByIds(data): Promise<Node[]> {
    try {
      const { idNodes } = data
      const nodes = await this.nodeService.findNodeByIds(idNodes)
      return nodes
    } catch (error) {
      console.log('error', error)
      throw new RpcException(error)
    }
  }
}
