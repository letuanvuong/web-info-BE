import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { ApolloError } from 'apollo-server-errors'
import * as moment from 'moment'
import { Model } from 'mongoose'
import { IDFactory } from 'src/helper'
import { BlogDocument, BlogEntity } from 'src/modules/Blog/schemas/Blog.schema'

import { MyContext } from '../base-modules/my-context/my-context'
import { ServiceManager } from '../base-modules/service-manager/service-manager'
import {
  DuplicateBlogIdError,
  NotFoundBlogIdError,
} from './MapBlogRelated.error'
import {
  MapBlogRelatedDocument,
  MapBlogRelatedEntity,
} from './schemas/MapBlogRelated.schema'

@Injectable()
export class MapBlogRelatedService {
  constructor(
    @InjectModel(MapBlogRelatedEntity.name)
    public mapBlogRelatedModel: Model<MapBlogRelatedDocument>,
    @InjectModel(BlogEntity.name)
    public blogModel: Model<BlogDocument>,
    private readonly serviceManager: ServiceManager,
  ) {}

  async getMapBlogRelateds(): Promise<MapBlogRelatedDocument[]> {
    try {
      return await this.mapBlogRelatedModel
        .find()
        .populate('blogRelated')
        .populate('blog')
        .sort({ createdAt: -1 })
        .lean()
    } catch (error) {
      throw new ApolloError(error)
    }
  }

  async getMapBlogRelatedsByBlog(
    idBlog: string,
    limit?: number,
  ): Promise<MapBlogRelatedDocument[]> {
    try {
      return await this.mapBlogRelatedModel
        .find({
          idBlog,
          idBlogRelated: {
            $exists: true,
          },
        })
        .populate('blogRelated')
        .populate('blog')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean()
    } catch (error) {
      throw new ApolloError(error)
    }
  }

  async createMapBlogRelated(
    idBlog: string,
    idsBlogRelated: string[],
  ): Promise<MapBlogRelatedDocument[]> {
    try {
      if (idsBlogRelated.includes(idBlog)) {
        throw new DuplicateBlogIdError()
      }

      const mergeIdBlog = [idBlog, ...idsBlogRelated]

      const blogs = await this.blogModel.find({ _id: { $in: mergeIdBlog } })

      if (blogs.length !== mergeIdBlog.length) {
        throw new NotFoundBlogIdError()
      }

      const existed = await this.mapBlogRelatedModel
        .find({
          idBlog,
        })
        .lean()

      const existedIds = existed.map((e) => e._id)
      const existedIdsBlogRelated = existed.map((e) => e.idBlogRelated)

      if (!idsBlogRelated.length) {
        await this.mapBlogRelatedModel.deleteMany({
          _id: {
            $in: existedIds,
          },
        })

        return await this.getMapBlogRelatedsByBlog(idBlog)
      }

      let needInsertArr = []
      let needDeleteArr = []

      if (!existedIds.length) {
        needInsertArr = [...idsBlogRelated]
      } else {
        needDeleteArr = existed.reduce((res, elem) => {
          if (!idsBlogRelated.includes(elem.idBlogRelated)) {
            res.push(elem._id)
          }
          return res
        }, [])
      }
      needInsertArr = idsBlogRelated.reduce((res, elem) => {
        if (!existedIdsBlogRelated.includes(elem)) {
          res.push(elem)
        }
        return res
      }, [])

      if (needDeleteArr.length) {
        await this.mapBlogRelatedModel.deleteMany({
          _id: {
            $in: needDeleteArr,
          },
        })
      }

      const currentUserSlim = await this.serviceManager
        .get(MyContext)
        .get()
        .authManager.getCurrentUserSlim()

      if (needInsertArr.length) {
        const inputs = needInsertArr.map((elem) => ({
          _id: IDFactory.generateID(),
          idBlog,
          isDeleted: false,
          idBlogRelated: elem,
          createdAt: moment().valueOf(),
          createdBy: currentUserSlim,
        }))

        await this.mapBlogRelatedModel.insertMany(inputs)
      }

      return await this.getMapBlogRelatedsByBlog(idBlog)
    } catch (error) {
      throw new ApolloError(error)
    }
  }

  async removeLinkedBlogRelated(idBlog: string): Promise<boolean> {
    const currentBlog = await this.blogModel.findOne({ _id: idBlog })
    if (!currentBlog) throw new NotFoundBlogIdError()
    const findAllLinked = await this.mapBlogRelatedModel.find({
      idBlogRelated: idBlog,
    })
    const getIds = findAllLinked?.map((blog) => blog._id)
    const deleteLinked = await this.mapBlogRelatedModel.deleteMany({
      _id: { $in: getIds },
    })
    return !!deleteLinked
  }
}
