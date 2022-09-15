import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import * as moment from 'moment'
import { Model } from 'mongoose'
import { MAX_BLOG_FEATURE } from 'src/constant'
import { generateSlugRandom } from 'src/helper'
import { MapBlogRelatedService } from 'src/modules/MapBlogRelated/MapBlogRelated.service'
import {
  BlogInput,
  BlogPagination,
  BlogPaginationTotal,
  EnumBlogStatus,
  FilterBlogInput,
  SearchBlogInput,
  SortBlogInput,
} from 'src/schema'
import { NonNullExpression } from 'ts-morph'

import { MyContext } from '../base-modules/my-context/my-context'
import { ServiceManager } from '../base-modules/service-manager/service-manager'
import {
  BlogNotFound,
  BlogSlugAlreadyExistsError,
  MaxFeatureBlogError,
} from './Blog.error'
import { BlogDocument, BlogEntity } from './schemas/Blog.schema'

@Injectable()
export class BlogService {
  constructor(
    @InjectModel(BlogEntity.name)
    public blogModel: Model<BlogDocument>,
    private readonly serviceManager: ServiceManager,
    private readonly mapBlogRelatedService: MapBlogRelatedService,
  ) {}

  async renderQueryPagination(
    filter: [FilterBlogInput],
    search: [SearchBlogInput],
  ) {
    const skip = false

    // filter
    const filterObject = {}
    if (filter) {
      for (const e of filter) {
        filterObject[e?.fieldFilter] = { $in: e?.values }
        if (e?.fieldFilter === 'isFeatureBlog') {
          filterObject[e?.fieldFilter] =
            e?.values?.[0] === 'true' ? true : false
        }
      }
    }

    // search
    let searchArr =
      !search || search.length < 1
        ? [{}]
        : search
            .filter((s) => s.fieldSearch && s.textSearch)
            .map((s) => {
              if (!s?.fieldSearch || !s?.textSearch) {
                return null
              }

              if (['createdAt']?.includes(s?.fieldSearch)) {
                const date = moment(s.textSearch)
                if (isNaN(date?.valueOf())) return null
                return [
                  {
                    [s?.fieldSearch]: {
                      $gte: date.startOf('day').valueOf(),
                      $lte: date.endOf('day').valueOf(),
                    },
                  },
                ]
              }

              return {
                [s?.fieldSearch]: {
                  $regex: new RegExp(
                    `${s?.textSearch?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                    'siu',
                  ),
                },
              }
            })
            .filter((s) => s)
            ?.flat()

    if (searchArr.length < 1) {
      searchArr = [{}]
    }

    return skip
      ? { _id: { $in: [] } }
      : Object.assign(
          {},
          {
            $and: searchArr,
          },
          filterObject,
          {
            status: { $ne: EnumBlogStatus.Deleted },
          },
        )
  }

  async getBlogs(): Promise<BlogDocument[]> {
    return this.blogModel
      .find({ status: { $ne: EnumBlogStatus.Deleted } })
      .lean()
  }

  async getBlogById(_id: string): Promise<BlogDocument> {
    return this.blogModel
      .findOne({ _id, status: { $ne: EnumBlogStatus.Deleted } })
      .lean()
  }

  async getBlogBySlug(slug: string): Promise<BlogDocument> {
    return this.blogModel
      .findOne({ slug, status: { $ne: EnumBlogStatus.Deleted } })
      .lean()
  }

  async getBlogPagination(
    page: number,
    limit: number,
    search: [SearchBlogInput],
    filter: [FilterBlogInput],
    sort: [SortBlogInput],
    idsDefault: string[],
  ): Promise<BlogPagination> {
    return new Promise(async (rel, rej) => {
      try {
        const query: any = await this.renderQueryPagination(filter, search)
        if (!page || page < 1) page = 1

        const sortData = {}

        sort?.map((e) => {
          sortData[e?.fieldSort] = e?.sort
        })

        const pipeline: any[] = [
          {
            $match: query,
          },
          { $sort: sort ? sortData : { publishAt: -1 } },
        ]

        if (limit) {
          pipeline.push(
            {
              $skip: (page - 1) * limit,
            },
            {
              $limit: limit,
            },
          )
        }

        const data = await this.blogModel.aggregate(pipeline)

        // search hold blog active
        if (idsDefault?.length) {
          const dataDefaults: any = await this.blogModel
            .find({
              _id: { $in: idsDefault },
              status: { $ne: EnumBlogStatus.Deleted },
            })
            .lean()
          if (dataDefaults?.length) {
            dataDefaults.forEach((item) => {
              const indexOfArray = data.findIndex(
                (blog) => blog._id === item._id,
              )
              if (indexOfArray !== -1) {
                data.splice(indexOfArray, 1)
              }
              data.unshift(item)
            })
          }
        }

        let cardinalNumber = limit ? (page - 1) * limit : 0
        const result = data?.map((blog) => {
          const url = `${process.env.CLIENT_URI}/blog/${blog.slug}`
          cardinalNumber++
          return {
            url,
            cardinalNumber,
            ...blog,
          }
        })
        rel({
          currentPage: page,
          data: result,
        })
      } catch (error) {
        rej(error)
      }
    })
  }

  async getBlogPaginationTotal(
    page: number,
    limit: number,
    search: [SearchBlogInput],
    filter: [FilterBlogInput],
  ): Promise<BlogPaginationTotal> {
    return new Promise(async (rel, rej) => {
      try {
        const query: any = await this.renderQueryPagination(filter, search)
        const total = await this.blogModel.find(query).countDocuments()
        rel({
          totalRows: total,
          totalPages: Math.ceil(total / limit),
          currentPage:
            page > Math.ceil(total / limit) ? Math.ceil(total / limit) : page,
        })
      } catch (error) {
        rej(error)
      }
    })
  }

  async createBlog(
    blogInput: Partial<BlogEntity>,
    idsBlogRelated?: string[],
  ): Promise<BlogDocument> {
    const newBlog = new BlogEntity(blogInput)
    const currentUserSlim = await this.serviceManager
      .get(MyContext)
      .get()
      .authManager.getCurrentUserSlim()

    let slug = blogInput.slug

    if (!slug) {
      slug = generateSlugRandom(blogInput.title)
    }

    const blogBySlug = await this.blogModel.find({
      slug,
      status: { $ne: EnumBlogStatus.Deleted },
    })

    if (blogBySlug.length > 0) {
      throw new BlogSlugAlreadyExistsError()
    }
    const rawResult = await this.blogModel.create({
      createdBy: currentUserSlim,
      publishBy: currentUserSlim,
      slug,
      status: EnumBlogStatus.Public, // temporary
      ...newBlog,
    })
    if (idsBlogRelated?.length >= 0 && rawResult._id) {
      await this.mapBlogRelatedService.createMapBlogRelated(
        rawResult._id,
        idsBlogRelated,
      )
    }

    return rawResult
  }

  async updateBlog(
    _id: string,
    updateInput: BlogInput,
    idsBlogRelated?: string[],
  ): Promise<BlogDocument> {
    const currentUserSlim = await this.serviceManager
      .get(MyContext)
      .get()
      .authManager.getCurrentUserSlim()
    const updatedBlog = await this.blogModel.findOneAndUpdate(
      { _id },
      {
        $set: {
          ...updateInput,
          updatedBy: currentUserSlim,
          updatedAt: Date.now(),
        },
      },
      { new: true },
    )

    if (idsBlogRelated?.length >= 0 && _id) {
      await this.mapBlogRelatedService.createMapBlogRelated(_id, idsBlogRelated)
    }

    return updatedBlog
  }

  async deleteBlog(_id: string): Promise<BlogDocument> {
    const currentUserSlim = await this.serviceManager
      .get(MyContext)
      .get()
      .authManager.getCurrentUserSlim()
    const updatedBlog = await this.blogModel.findOneAndUpdate(
      { _id },
      {
        $set: {
          priority: null,
          status: EnumBlogStatus.Deleted,
          deletedBy: currentUserSlim,
          deletedAt: Date.now(),
        },
      },
      { new: true },
    )

    // remove linked blog related
    await this.mapBlogRelatedService.removeLinkedBlogRelated(_id)

    return updatedBlog
  }
  async changePriorityBlog(_id: string): Promise<BlogDocument> {
    const currentUserSlim = await this.serviceManager
      .get(MyContext)
      .get()
      .authManager.getCurrentUserSlim()
    const blogEdit = await this.blogModel.findOne({ _id })
    if (blogEdit?.priority == null) {
      const lastBlog = await this.blogModel
        .find({
          priority: { $exists: true, $ne: null },
          status: { $ne: EnumBlogStatus.Deleted },
        })
        .sort({ priority: -1 })
        .limit(1)
      const updatedBlog = await this.blogModel.findOneAndUpdate(
        { _id },
        {
          $set: {
            priority: lastBlog[0] ? lastBlog[0]?.priority + 1 : 1,
            updatedBy: currentUserSlim,
            updatedAt: Date.now(),
          },
        },
        { new: true },
      )
      return updatedBlog
      // unpriority
    } else {
      const updatedBlog = await this.blogModel.findOneAndUpdate(
        { _id },
        {
          $set: {
            priority: null,
            updatedBy: currentUserSlim,
            updatedAt: Date.now(),
          },
        },
        { new: true },
      )
      return updatedBlog
    }
  }

  async unChangePriorityMultiBlog(ids: string[]): Promise<BlogDocument[]> {
    const currentUserSlim = await this.serviceManager
      .get(MyContext)
      .get()
      .authManager.getCurrentUserSlim()
    const blogList = await this.blogModel.find({ _id: { $in: ids } })
    await this.blogModel.update(
      { _id: { $in: ids } },
      {
        $set: {
          priority: null,
          updatedBy: currentUserSlim,
          updatedAt: Date.now(),
        },
      },
      { multi: true },
    )
    return blogList
  }

  async publicBlog(_id: string): Promise<BlogDocument> {
    const currentUserSlim = await this.serviceManager
      .get(MyContext)
      .get()
      .authManager.getCurrentUserSlim()

    const updatedBlog = await this.blogModel.findOneAndUpdate(
      { _id },
      {
        $set: {
          status: EnumBlogStatus.Public,
          updatedBy: currentUserSlim,
          updatedAt: Date.now(),
        },
      },
      { new: true },
    )

    return updatedBlog
  }

  async updateFeatureBlog(_id: string): Promise<BlogDocument> {
    const currentUserSlim = await this.serviceManager
      .get(MyContext)
      .get()
      .authManager.getCurrentUserSlim()
    const currentBlog = await this.blogModel.findOne({
      _id,
      status: { $ne: EnumBlogStatus.Deleted },
    })
    if (!currentBlog) throw new BlogNotFound()
    const getAllFeatureBlog = await this.blogModel.find({
      isFeatureBlog: true,
      status: { $ne: EnumBlogStatus.Deleted },
    })
    if (
      !currentBlog?.isFeatureBlog &&
      getAllFeatureBlog?.length >= MAX_BLOG_FEATURE
    ) {
      throw new MaxFeatureBlogError()
    }
    const updatedBlog = await this.blogModel.findOneAndUpdate(
      { _id },
      {
        $set: {
          isFeatureBlog: !currentBlog?.isFeatureBlog,
          updatedBy: currentUserSlim,
          updatedAt: Date.now(),
        },
      },
      { new: true },
    )

    return updatedBlog
  }
}
