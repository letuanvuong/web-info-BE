import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import * as moment from 'moment'
import { FilterQuery, Model } from 'mongoose'
import { generateSlug } from 'src/helper'
import {
  FilterServiceInput,
  SearchServiceInput,
  ServiceInput,
  ServicePagination,
  ServicePaginationTotal,
  SortServiceInput,
} from 'src/schema'

import { MyContext } from '../base-modules/my-context/my-context'
import { ServiceManager } from '../base-modules/service-manager/service-manager'
import { ServiceDocument, ServiceEntity } from './schemas/Service.schema'
import {
  ServiceSlugAlreadyExistsError,
  ServiceTitlAlreadyExistseError,
} from './Service.error'

@Injectable()
export class ServiceService {
  constructor(
    @InjectModel(ServiceEntity.name)
    public serviceModel: Model<ServiceDocument>,
    private readonly serviceManager: ServiceManager,
  ) {}

  async renderQueryPagination(
    filter: [FilterServiceInput],
    search: [SearchServiceInput],
  ) {
    const skip = false

    // filter
    const filterObject = {}
    if (filter) {
      for (const e of filter) {
        filterObject[e?.fieldFilter] = { $in: e?.values }
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
                return {
                  [s?.fieldSearch]: {
                    $gte: date.startOf('day').valueOf(),
                    $lte: date.endOf('day').valueOf(),
                  },
                }
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
            isDeleted: false,
          },
        )
  }
  async search(args: {
    filter: FilterQuery<ServiceDocument>
    select?: any
    getID?: boolean
  }) {
    const { filter, select, getID } = args
    const nns = await this.serviceModel
      .find({
        isDeleted: false,
        ...filter,
      })
      .select({ _id: 1, ...(select || {}) })
      .lean()
    if (getID) return nns.map((d) => d._id)
    return nns
  }

  async getServices(): Promise<ServiceDocument[]> {
    return this.serviceModel.find({ isDeleted: false }).lean()
  }

  async getServiceById(_id: string): Promise<ServiceDocument> {
    return this.serviceModel.findOne({ _id, isDeleted: false }).lean()
  }

  async getServiceBySlug(slug: string): Promise<ServiceDocument> {
    return this.serviceModel.findOne({ slug, isDeleted: false }).lean()
  }

  async getServicePagination(
    page: number,
    limit: number,
    search: [SearchServiceInput],
    filter: [FilterServiceInput],
    sort: [SortServiceInput],
  ): Promise<ServicePagination> {
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

        const data = await this.serviceModel.aggregate(pipeline)
        let cardinalNumber = limit ? (page - 1) * limit : 0
        const result = data?.map((service) => {
          const url = `${process.env.CLIENT_URI}/services/${service.slug}`
          cardinalNumber++
          return {
            url,
            cardinalNumber,
            ...service,
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

  async getServicePaginationTotal(
    page: number,
    limit: number,
    search: [SearchServiceInput],
    filter: [FilterServiceInput],
  ): Promise<ServicePaginationTotal> {
    return new Promise(async (rel, rej) => {
      try {
        const query: any = await this.renderQueryPagination(filter, search)
        const total = await this.serviceModel.find(query).countDocuments()
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

  async createService(
    serviceInput: Partial<ServiceEntity>,
  ): Promise<ServiceDocument> {
    const serviceByTitle = await this.serviceModel
      .find({ title: serviceInput.title, isDeleted: false })
      .lean()

    if (serviceByTitle.length > 0) {
      throw new ServiceTitlAlreadyExistseError()
    }

    const newService = new ServiceEntity(serviceInput)
    const currentUserSlim = await this.serviceManager
      .get(MyContext)
      .get()
      .authManager.getCurrentUserSlim()

    let slug = serviceInput.slug

    if (!slug) {
      slug = generateSlug(serviceInput.title)
    }

    const serviceBySlug = await this.serviceModel.find({
      slug,
      isDeleted: false,
    })

    if (serviceBySlug.length > 0) {
      throw new ServiceSlugAlreadyExistsError()
    }

    const rawResult = await this.serviceModel.create({
      createdBy: currentUserSlim,
      slug,
      isDeleted: false,
      ...newService,
    })

    return rawResult
  }

  async updateService(
    _id: string,
    updateInput: ServiceInput,
  ): Promise<ServiceDocument> {
    const currentUserSlim = await this.serviceManager
      .get(MyContext)
      .get()
      .authManager.getCurrentUserSlim()
    const serviceByTitle = await this.serviceModel
      .find({ title: updateInput.title, isDeleted: false, _id: { $ne: _id } })
      .lean()

    if (serviceByTitle.length > 0) {
      throw new ServiceTitlAlreadyExistseError()
    }
    const updatedService = await this.serviceModel.findOneAndUpdate(
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

    return updatedService
  }

  async deleteService(_id: string): Promise<ServiceDocument> {
    const currentUserSlim = await this.serviceManager
      .get(MyContext)
      .get()
      .authManager.getCurrentUserSlim()

    const updatedService = await this.serviceModel.findOneAndUpdate(
      { _id },
      {
        $set: {
          isDeleted: true,
          deletedBy: currentUserSlim,
          deletedAt: Date.now(),
        },
      },
      { new: true },
    )

    return updatedService
  }
}
