import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import * as moment from 'moment'
import { Model } from 'mongoose'
import { generateSlug } from 'src/helper'
import {
  EnumPageStatus,
  FilterPageInput,
  PageInput,
  PagePagination,
  PagePaginationTotal,
  SearchPageInput,
  SortPageInput,
} from 'src/schema'

import { MyContext } from '../base-modules/my-context/my-context'
import { ServiceManager } from '../base-modules/service-manager/service-manager'
import {
  PageSlugAlreadyExistsError,
  PageTitlEalreadyExistsError,
} from './Page.error'
import { PageDocument, PageEntity } from './schemas/Page.schema'

@Injectable()
export class PageService {
  constructor(
    @InjectModel(PageEntity.name)
    public pageModel: Model<PageDocument>,
    private readonly serviceManager: ServiceManager,
  ) {}

  async renderQueryPagination(
    filter: [FilterPageInput],
    search: [SearchPageInput],
  ) {
    const skip = false

    // filter
    const filterObject = {}
    if (filter) {
      for (const e of filter) {
        filterObject[e?.fieldFilter] = { $in: e?.values }
        filterObject[e?.fieldFilter] = { $in: e?.values }
        if (['isAddToFooterMenu', 'isAddToMainMenu'].includes(e?.fieldFilter)) {
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
            status: { $ne: EnumPageStatus.Deleted },
          },
        )
  }

  async getPages(): Promise<PageDocument[]> {
    return this.pageModel
      .find({ status: { $ne: EnumPageStatus.Deleted } })
      .lean()
  }

  async getPageById(_id: string): Promise<PageDocument> {
    return this.pageModel
      .findOne({ _id, status: { $ne: EnumPageStatus.Deleted } })
      .lean()
  }

  async getPageBySlug(slug: string): Promise<PageDocument> {
    return this.pageModel
      .findOne({ slug, status: { $ne: EnumPageStatus.Deleted } })
      .lean()
  }

  async getPagePagination(
    page: number,
    limit: number,
    search: [SearchPageInput],
    filter: [FilterPageInput],
    sort: [SortPageInput],
  ): Promise<PagePagination> {
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
          { $sort: sort ? sortData : { createdAt: -1 } },
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

        const data = await this.pageModel.aggregate(pipeline)
        let cardinalNumber = limit ? (page - 1) * limit : 0
        const result = data?.map((page) => {
          const url = `${process.env.CLIENT_URI}/pages/${page.slug}`
          cardinalNumber++
          return {
            url,
            cardinalNumber,
            ...page,
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

  async getPagePaginationTotal(
    page: number,
    limit: number,
    search: [SearchPageInput],
    filter: [FilterPageInput],
  ): Promise<PagePaginationTotal> {
    return new Promise(async (rel, rej) => {
      try {
        const query: any = await this.renderQueryPagination(filter, search)
        const total = await this.pageModel.find(query).countDocuments()
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

  async createPage(pageInput: Partial<PageEntity>): Promise<PageDocument> {
    const pageByTitle = await this.pageModel.find({
      title: pageInput.title,
      status: { $ne: EnumPageStatus.Deleted },
    })

    if (pageByTitle.length > 0) {
      throw new PageTitlEalreadyExistsError()
    }

    let slug = pageInput.slug

    if (!slug) {
      slug = generateSlug(pageInput.title)
    }

    const pageBySlug = await this.pageModel.find({
      slug,
      status: { $ne: EnumPageStatus.Deleted },
    })

    if (pageBySlug.length > 0) {
      throw new PageSlugAlreadyExistsError()
    }

    const newPage = new PageEntity(pageInput)
    const currentUserSlim = await this.serviceManager
      .get(MyContext)
      .get()
      .authManager.getCurrentUserSlim()

    const rawResult = await this.pageModel.create({
      createdBy: currentUserSlim,
      status: EnumPageStatus.Public, // Temporary
      slug,
      ...newPage,
    })

    return rawResult
  }

  async updatePage(_id: string, updateInput: PageInput): Promise<PageDocument> {
    const currentUserSlim = await this.serviceManager
      .get(MyContext)
      .get()
      .authManager.getCurrentUserSlim()

    const pageByTitle = await this.pageModel.find({
      title: updateInput?.title,
      status: { $ne: EnumPageStatus.Deleted },
      _id: { $ne: _id },
    })

    if (pageByTitle.length > 0) {
      throw new PageTitlEalreadyExistsError()
    }
    const updatedPage = await this.pageModel.findOneAndUpdate(
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

    return updatedPage
  }

  async deletePage(_id: string): Promise<PageDocument> {
    const currentUserSlim = await this.serviceManager
      .get(MyContext)
      .get()
      .authManager.getCurrentUserSlim()

    const updatedPage = await this.pageModel.findOneAndUpdate(
      { _id },
      {
        $set: {
          status: EnumPageStatus.Deleted,
          deletedBy: currentUserSlim,
          deletedAt: Date.now(),
        },
      },
      { new: true },
    )

    return updatedPage
  }
}
