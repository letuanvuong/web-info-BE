/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Args,
  Context,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql'
import { Node, NodeInput } from 'src/schema'

import { IContext } from '../base-modules/graphql/gql.type'
import { ServiceManager } from '../base-modules/service-manager/service-manager'
import { InputNodeDTO } from './dto/input-node.dto'
import {
  NodeEmptyNameError,
  NodeExistCodeError,
  NodeIsItselfError,
  NodeNotFoundError,
  NodeNotFoundParentError,
} from './node.error'
import { NodeService } from './node.service'
import { NodeDocument, NodeEntity } from './schemas/node.schema'

@Resolver('Node')
export class NodeResolver {
  constructor(
    private readonly nodeService: NodeService,
    private readonly serviceManager: ServiceManager,
  ) {}

  @Query()
  async getNodeById(@Args('_id') _id: string): Promise<NodeDocument> {
    const foundNode = await this.nodeService.getNodeById(_id)
    if (!foundNode) throw new NodeNotFoundError('Cơ sở - tổ chức không tồn tại') // WIP
    return foundNode
  }

  @Query()
  async getNodes(): Promise<Node[]> {
    const nodes = await this.nodeService.getNodes()
    return nodes
  }

  @Query()
  async getNodeTree() {
    const nodeTree = await this.nodeService.getNodeTree()
    return nodeTree
  }

  @Mutation()
  async createNode(
    @Args('newNodeInput') newNodeInput: InputNodeDTO,
    @Context() context: IContext,
  ): Promise<NodeDocument> {
    const { code, name, idParent } = newNodeInput
    const sameCode = await this.nodeService.findNodeMatchAny([
      {
        code,
        isActive: true,
      },
    ])

    if (sameCode) throw new NodeExistCodeError('Mã cơ sở - tổ chức đã tồn tại')

    // if (this.nodeService.isEmptyName(name))
    //   throw new NodeEmptyNameError('Please input organization name')

    // if (this.nodeService.isHaveParentNode(idParent)) {
    //   const foundParentNode = await this.getNodeById(idParent)
    //   if (!foundParentNode)
    //     throw new NodeNotFoundParentError("Can't find parent organization")
    // }

    const createdNode = await this.nodeService.createNode(newNodeInput, context)
    return createdNode
  }

  @Mutation()
  async updateNode(
    @Args('_id') _id: string,
    @Args('updateNodeInput') updateNodeInput: NodeInput,
    @Context() context: IContext,
  ): Promise<NodeDocument> {
    const { code, name, idParent } = updateNodeInput
    const foundNode = await this.nodeService.getNodeById(_id)
    if (!foundNode) throw new NodeNotFoundError('Cơ sở - tổ chức không tồn tại')

    const sameCode = await this.nodeService.findNodeMatchAny([
      {
        code,
        isActive: true,
      },
    ])

    if (sameCode && sameCode._id !== _id)
      throw new NodeExistCodeError('Mã cơ sở - tổ chức đã tồn tại')
    // if (this.nodeService.isEmptyName(name))
    //   throw new NodeEmptyNameError('Please input organization name')
    // if (_id === idParent) throw new NodeIsItselfError('Can\t update itself')

    // if (this.nodeService.isHaveParentNode(idParent)) {
    //   const foundParentNode = await this.getNodeById(idParent)
    //   if (!foundParentNode)
    //     throw new NodeNotFoundParentError("Can't find parent organization")
    // }

    const updatedNode = await this.nodeService.updateNode(
      _id,
      updateNodeInput,
      context,
    )
    return updatedNode
  }

  @Mutation()
  async deleteNode(@Args('_id') _id: string): Promise<boolean> {
    const foundedNode = await this.nodeService.getNodeById(_id)
    if (!foundedNode)
      throw new NodeNotFoundError('Cơ sở - tổ chức không tồn tại')

    const deletedNode = await this.nodeService.deleteNode(_id)

    return false
  }
}
