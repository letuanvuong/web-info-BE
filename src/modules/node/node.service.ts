/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inject, Injectable } from '@nestjs/common'
import { CONTEXT } from '@nestjs/graphql'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { NodeInput, NodeTree } from 'src/schema'

import { IContext } from '../base-modules/graphql/gql.type'
import { NodeDocument, NodeEntity } from './schemas/node.schema'

@Injectable()
export class NodeService {
  constructor(
    @InjectModel(NodeEntity.name)
    private nodeModel: Model<NodeDocument>, //
  ) {}

  public async checkNodeHaveNodeType(idsNodeType: any): Promise<boolean> {
    const foundNode = await this.nodeModel
      .find({
        $and: [
          {
            isDeleted: false,
          },
          {
            category: { $in: idsNodeType },
          },
        ],
      })
      .lean()

    return !!foundNode.length
  }

  public async findNodeMatchAny(matchConditions: Partial<NodeEntity>[]) {
    const node = await this.nodeModel
      .findOne({
        $and: [{ isDeleted: false }, { $or: matchConditions }],
      })
      .populate('category')
      .lean()
    return node
  }

  public async getNodeById(_id: string): Promise<NodeDocument> {
    const foundedNode = await this.nodeModel
      .findOne({ _id, isDeleted: false })
      .populate('category')
      .exec()
    return foundedNode
  }

  public async getNodes(isGetAllNode?: boolean) {
    const result = await this.nodeModel
      .find(isGetAllNode ? {} : { isDeleted: false })
      .populate('category')
      .lean()
    return result
  }

  public async getNodeTree(): Promise<NodeTree[]> {
    return null
  }

  public async createNode(
    newNode: NodeInput,
    context: IContext,
  ): Promise<NodeDocument> {
    const dto = new NodeEntity(newNode, context.currentUser)
    const resultNewNode = await new this.nodeModel(dto).save()

    return resultNewNode
  }

  public async updateNode(
    _id: string,
    updateNode: NodeInput,
    context: IContext,
  ): Promise<NodeDocument> {
    const dto = new NodeEntity(updateNode, context.currentUser, true)
    const updatedNode = await this.nodeModel.findByIdAndUpdate(_id, dto, {
      new: true,
    })

    return updatedNode
  }

  public async deleteNode(_id: string): Promise<boolean> {
    // find children
    const childrenNodes = await this.nodeModel.aggregate([
      {
        $match: {
          _id,
        },
      },
      {
        $graphLookup: {
          from: 'nodes',
          startWith: '$_id',
          connectFromField: '_id',
          connectToField: 'idParent',
          as: 'children',
        },
      },
      {
        $group: {
          _id: '$_id',
          childrenIds: { $push: '$children._id' },
        },
      },
    ])

    // Delete parent
    childrenNodes[0]['childrenIds'].push(_id)

    const result = await this.nodeModel.updateMany(
      {
        _id: {
          $in: childrenNodes[0]['childrenIds'].flat(Infinity),
        },
      },
      {
        $set: {
          isDeleted: true,
          isActive: false,
        },
      },
    )

    return result.ok === 1
  }

  public async findNodeByIds(idNodes: string[]) {
    const nodes = await this.nodeModel
      .find({
        _id: { $in: idNodes || [] },
      })
      .populate('category')
      .lean()
    return nodes
  }
}
