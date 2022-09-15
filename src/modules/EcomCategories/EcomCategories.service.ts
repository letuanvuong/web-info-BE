import { Injectable } from '@nestjs/common'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { ApolloError } from 'apollo-server-express'
import { identity, isEmpty, pickBy } from 'lodash'
import * as moment from 'moment'
import { Connection, FilterQuery, Model } from 'mongoose'
import { removeVietnameseTones } from 'src/helper'
import {
  EcomCategories,
  EcomCategoriesFilter,
  EcomCategoriesInput,
  EcomCategoriesPagination,
  EcomCategoriesPaginationTotal,
  EcomCategoriesRes,
  EcomCategoriesSearch,
  EcomCategoriesSort,
  EcomCategoriesTreeRes,
  EnumCategoriesStatus,
  EnumStockModelStatus,
} from 'src/schema'

import { IContext } from '../base-modules/graphql/gql.type'
import { UserSlimEntity } from '../user/schemas/UserSlim.schema'
import {
  CategoryCodeExistedError,
  CategoryNameExistedError,
  CategoryParentIsItself,
  EcomCategoriesNotFoundError,
  EcomCategoriesParentNotFoundError,
} from './EcomCategories.error'
import {
  EcomCategoriesDocument,
  EcomCategoriesEntity,
} from './schemas/EcomCategories.schema'

@Injectable()
export class EcomCategoriesService {
  constructor(
    @InjectConnection() private connection: Connection,
    @InjectModel(EcomCategoriesEntity.name)
    private categoriesModel: Model<EcomCategoriesDocument>,
  ) {}

  async renderQueryPagination(
    filter: [EcomCategoriesFilter],
    search: [EcomCategoriesSearch],
  ) {
    const skip = false
    const fieldsSearch = [
      'CategoryName',
      'createdAt',
      'Status',
      'Slug',
      'CategoryParent.CategoryName',
    ]
    const fieldsForeignSearch = ['CategoryParent.CategoryName']

    // filter
    const filterObject = {}
    filter?.forEach((e) => {
      filterObject[e?.fieldFilter] = { $in: e?.values }
    })
    // search
    const searchForeignKey = {}
    const foreignKey = {}
    const foreignKeyOr = []
    let or =
      !search || search.length < 1
        ? [{}]
        : search
            .filter((s) => {
              return (
                s.fieldSearch &&
                fieldsSearch.includes(s.fieldSearch) &&
                s.textSearch
              )
            }) // lọc các field
            .map((s) => {
              if (!s?.fieldSearch || !s?.textSearch) return null
              if (s?.fieldSearch === 'CategoryName') {
                s.fieldSearch = 'CategoryName_Unsigned'
                s.textSearch = removeVietnameseTones(s.textSearch)
              }

              // đưa các khóa ngoại vào object searchForeignKey
              if (fieldsForeignSearch.includes(s?.fieldSearch)) {
                searchForeignKey[s?.fieldSearch] = s.textSearch
                return null
              }

              if (['createdAt']?.includes(s?.fieldSearch)) {
                const date = moment(s.textSearch)
                if (isNaN(date?.valueOf())) return null
                return [
                  {
                    [s?.fieldSearch]: {
                      $gte: date.startOf('day').valueOf(),
                    },
                  },
                  {
                    [s?.fieldSearch]: {
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
    if (or.length < 1) or = [{}]
    // duyệt các khóa ngoại searchForeignKey, search lấy ids và gán câu query cho từng khóa ngoại vào ForeignKey
    for await (const fieldKey of Object.keys(searchForeignKey)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const ids = []
      switch (fieldKey) {
        case 'CategoryParent.CategoryName':
          const categoriesParentIds = await this.search({
            filter: {
              CategoryName_Unsigned: {
                $regex: new RegExp(
                  removeVietnameseTones(searchForeignKey[fieldKey])?.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    '\\$&',
                  ),
                  'siu',
                ),
              },
            },
            select: { CategoryParent_Id: 1 },
            getID: true,
          })

          if (categoriesParentIds.length < 1) return { _id: { $in: [] } }
          if (categoriesParentIds.length > 0) {
            foreignKeyOr.push({
              CategoryParent_Id: { $in: categoriesParentIds },
            })
          }
          break
        default:
          break
      }
    }

    return skip
      ? { _id: { $in: [] } }
      : Object.assign(
          {},
          {
            Status: { $ne: EnumCategoriesStatus.DELETED },
            $and: or,
            ...foreignKey,
          },
          foreignKeyOr.length > 0 ? { $or: [...foreignKeyOr] } : {},
          filterObject,
        )
  }

  async getEcomCategoriesPagination(
    page: number,
    limit: number,
    search: [EcomCategoriesSearch],
    filter: [EcomCategoriesFilter],
    sort: [EcomCategoriesSort],
  ): Promise<EcomCategoriesPagination> {
    return new Promise(async (rel, rej) => {
      const query: any = await this.renderQueryPagination(filter, search)

      if (!page || page < 1) page = 1
      if (!limit && limit !== 0) limit = 10
      const sortData = {}
      sort?.map((e) => {
        sortData[e?.fieldSort] = e?.sort
      })
      try {
        const categories: EcomCategoriesRes[] = await this.categoriesModel
          .find(query)
          .populate({
            path: 'CategoryParent_Id',
            model: EcomCategoriesEntity.name,
          })
          .sort(sortData)
          .skip((page - 1) * limit)
          .limit(limit)
          .lean()
          .exec()

        const result = categories.map((x: any) => {
          const tempResult = x
          if (x?.CategoryParent_Id?._id) {
            tempResult['CategoryParent'] = x?.CategoryParent_Id
            tempResult['CategoryParent_Id'] = x?.CategoryParent_Id?._id
          }

          return tempResult
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

  async getEcomCategoriesPaginationTotal(
    page: number,
    limit: number,
    search: [EcomCategoriesSearch],
    filter: [EcomCategoriesFilter],
  ): Promise<EcomCategoriesPaginationTotal> {
    return new Promise(async (rel, rej) => {
      try {
        const query: any = await this.renderQueryPagination(filter, search)
        const total = await this.categoriesModel.find(query).countDocuments()
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

  async getEcomCategoriesById(
    id: string,
    throwError: boolean = true,
  ): Promise<EcomCategoriesDocument> {
    try {
      const categories = await this.categoriesModel.findOne({
        _id: id,
        isDeleted: false,
      })
      if (!categories && throwError) throw new EcomCategoriesNotFoundError()
      return categories
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('error', error)
      throw new ApolloError(error)
    }
  }

  async getEcomCategoriesBySlug(slug: string): Promise<EcomCategoriesDocument> {
    try {
      const categories = await this.categoriesModel.findOne({
        Slug: slug,
        isDeleted: false,
      })
      if (!categories) throw new EcomCategoriesNotFoundError()
      return categories
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('error', error)
      throw new ApolloError(error)
    }
  }

  async getEcomCategoriesHasParent(
    Status: EnumCategoriesStatus,
  ): Promise<EcomCategoriesRes[]> {
    try {
      const categoriesHasParent = await this.categoriesModel.find({
        Status: Status ? Status : { $ne: EnumCategoriesStatus.DELETED },
        CategoryParent_Id: { $exists: true },
      })
      return categoriesHasParent
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('error', error)
      throw new ApolloError(error)
    }
  }

  async createEcomCategories(
    input: EcomCategoriesInput,
    context: IContext,
  ): Promise<EcomCategoriesDocument> {
    try {
      const currentUser = await context?.authManager.getCurrentUser()
      const currentUserSlim = new UserSlimEntity({
        _id: currentUser?._id,
        username: currentUser?.username,
      })

      const { CategoryName, CategoryCode, CategoryParent_Id } = input

      const categoryCodeExisted = await this.categoriesModel.findOne({
        CategoryCode,
        isDeleted: false,
      })
      if (categoryCodeExisted) throw new CategoryCodeExistedError()

      const categoryNameExisted = await this.categoriesModel.findOne({
        CategoryName,
        isDeleted: false,
      })
      if (categoryNameExisted) throw new CategoryNameExistedError()

      // check CategoryParent_Id
      if (CategoryParent_Id) {
        const categoryParentExisted = await this.categoriesModel.findOne({
          _id: CategoryParent_Id,
          isDeleted: false,
        })
        if (!categoryParentExisted)
          throw new EcomCategoriesParentNotFoundError()
      }

      const categoriesCreated = {
        ...input,
        CategoryName_Unsigned: CategoryName
          ? removeVietnameseTones(CategoryName)
          : undefined,
        createdAt: moment().valueOf(),
        createdBy: currentUserSlim,
      }

      const categories = new this.categoriesModel(
        pickBy(categoriesCreated, identity),
      )
      const result = await categories.save()
      return result
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('error', error)
      throw new ApolloError(error)
    }
  }

  async updateEcomCategories(
    id: string,
    input: EcomCategoriesInput,
    context: IContext,
  ): Promise<EcomCategoriesDocument> {
    try {
      const currentUser = await context?.authManager.getCurrentUser()
      const currentUserSlim = new UserSlimEntity({
        _id: currentUser?._id,
        username: currentUser?.username,
      })

      const currentCategory = await this.categoriesModel.findOne({
        _id: id,
        isDeleted: false,
      })
      if (!currentCategory) throw new EcomCategoriesNotFoundError()

      const { CategoryCode, CategoryName, CategoryParent_Id } = input

      if (CategoryCode) {
        const categoryCodeExisted = await this.categoriesModel.findOne({
          _id: { $ne: currentCategory?._id },
          CategoryCode,
          isDeleted: false,
        })
        if (categoryCodeExisted) throw new CategoryCodeExistedError()
      }
      if (CategoryName) {
        const categoryNameExisted = await this.categoriesModel.findOne({
          _id: { $ne: currentCategory?._id },
          CategoryName,
          isDeleted: false,
        })
        if (categoryNameExisted) throw new CategoryNameExistedError()
      }
      // check CategoryParent_Id
      if (CategoryParent_Id) {
        if (CategoryParent_Id === currentCategory?._id)
          throw new CategoryParentIsItself()
        const categoryParentExisted = await this.categoriesModel.findOne({
          _id: CategoryParent_Id,
          isDeleted: false,
        })
        if (!categoryParentExisted)
          throw new EcomCategoriesParentNotFoundError()
      }

      const categoryUpdated = {
        ...input,
        CategoryParent_Id: CategoryParent_Id || null,
        CategoryName_Unsigned: removeVietnameseTones(CategoryName),
        updatedAt: moment().valueOf(),
        updatedBy: currentUserSlim,
      }
      // eslint-disable-next-line no-console
      console.log(categoryUpdated)

      const result = await this.categoriesModel.findOneAndUpdate(
        { _id: id },
        {
          ...categoryUpdated,
        },
        {
          new: true,
        },
      )
      return result
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('error', error)
      throw new ApolloError(error)
    }
  }

  async checkRemove(ids: string[]): Promise<boolean> {
    try {
      const [categories] = await Promise.all([
        this.categoriesModel.find({
          CategoryParent_Id: { $in: ids },
          isDeleted: false,
          // isActive: true
        }),
      ])

      return categories.length > 0
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('error', error)
      throw new ApolloError(error)
    }
  }

  async removeEcomCategories(
    ids: string[],
    context: IContext,
  ): Promise<boolean> {
    try {
      const currentUser = await context?.authManager.getCurrentUser()
      const currentUserSlim = new UserSlimEntity({
        _id: currentUser?._id,
        username: currentUser?.username,
      })

      const checkHasChildCategory = await this.checkRemove(ids)
      const checkHasProduct = await this.checkCategoriesHasProduct(ids[0])

      if (!checkHasChildCategory && !checkHasProduct) {
        const result = await this.categoriesModel.updateMany(
          { _id: { $in: ids } },
          {
            isDeleted: true,
            deletedAt: moment().valueOf(),
            deletedBy: currentUserSlim,
            Status: EnumCategoriesStatus.DELETED,
          },
        )

        return !!result
      }

      return false
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('error', error)
      throw new ApolloError(error)
    }
  }

  async search(args: {
    filter: FilterQuery<EcomCategoriesDocument>
    select?: any
    getID?: boolean
  }) {
    const { filter, select, getID } = args
    const nns = await this.categoriesModel
      .find({
        isDeleted: false,
        Status: { $ne: EnumCategoriesStatus.DELETED },
        ...filter,
      })
      .select({ _id: 1, ...(select || {}) })
      .lean()
    if (getID) return nns.map((d) => d._id)
    return nns
  }

  async findCategories(ids: string[]): Promise<EcomCategoriesDocument[]> {
    return await this.categoriesModel
      .find({ _id: { $in: ids }, isDeleted: false })
      .lean()
  }

  async findDanhMucBaiGiangByFilter(
    filter: FilterQuery<EcomCategoriesDocument>,
    projection: any = {},
  ) {
    return this.categoriesModel.find(filter).select(projection).lean().exec()
  }

  async searchEcomCategoriesChild(args: {
    keyWord?: string
    Status?: EnumCategoriesStatus
  }): Promise<EcomCategories[]> {
    try {
      const { keyWord, Status } = args
      let Categories = []
      if (keyWord) {
        Categories = await this.categoriesModel
          .find({
            Status: Status ? Status : { $ne: EnumCategoriesStatus.DELETED },
            CategoryParent_Id: { $exists: true },
            $or: [
              {
                CategoryCode: {
                  $regex: new RegExp(
                    `${keyWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                    'siu',
                  ),
                },
              },
              {
                CategoryName: {
                  $regex: new RegExp(
                    `${keyWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                    'siu',
                  ),
                },
              },
              {
                CategoryName_Unsigned: {
                  $regex: new RegExp(
                    `${keyWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                    'siu',
                  ),
                },
              },
            ],
          })
          .limit(50)
          .lean()
      } else {
        Categories = await this.categoriesModel
          .find({
            Status: Status ? Status : { $ne: EnumCategoriesStatus.DELETED },
            CategoryParent_Id: { $exists: true },
          })
          .limit(50)
          .lean()
      }
      return Categories
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err)
      throw new ApolloError(err)
    }
  }

  async getEcomCategoriesTree(): Promise<EcomCategoriesTreeRes[]> {
    try {
      const categoriesHasParent = await this.categoriesModel
        .find({
          Status: EnumCategoriesStatus.PUBLIC,
          CategoryParent_Id: { $exists: true },
        })
        .sort({ createdAt: 1 })
      const idParents = categoriesHasParent?.map(
        (category) => category?.CategoryParent_Id,
      )
      const categoriesParents = await this.categoriesModel
        .find({
          _id: { $in: idParents },
          Status: EnumCategoriesStatus.PUBLIC,
        })
        .sort({ createdAt: 1 })
      const hashCategories = {}
      categoriesHasParent.forEach((category) => {
        const array = hashCategories[category?.CategoryParent_Id] || []
        array.push({
          _id: category?._id,
          CategoryName: category?.CategoryName,
          Slug: category?.Slug,
        })
        hashCategories[category?.CategoryParent_Id] = array
      })
      const result = []
      for (const category of categoriesParents) {
        const Children = hashCategories[category?._id]
        result.push({
          _id: category?._id,
          CategoryName: category?.CategoryName,
          Slug: category?.Slug,
          Children,
        })
      }
      return result
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('error', error)
      throw new ApolloError(error)
    }
  }

  async updateCategoriesStatus(
    _id: string,
    Status: EnumCategoriesStatus,
  ): Promise<boolean> {
    const categories = await this.categoriesModel.findOneAndUpdate(
      { _id },
      { $set: { Status } },
      { new: true },
    )

    return !!categories
  }

  async updateCancelPublicCategories(_id: string): Promise<boolean> {
    const categoryHasChild = await this.categoriesModel.find({
      CategoryParent_Id: _id,
    })

    let productHasPublic = true

    if (!isEmpty(categoryHasChild)) {
      productHasPublic = await this.checkCategoriesHasProductPublic(
        categoryHasChild.map((x) => x._id),
      )
    } else {
      productHasPublic = await this.checkCategoriesHasProductPublic([_id])
    }

    if (!productHasPublic) {
      const categories = await this.categoriesModel.findOneAndUpdate(
        { _id },
        { $set: { Status: EnumCategoriesStatus.NOTPUBLIC } },
        { new: true },
      )
      return !!categories
    }
    return false
  }

  async checkCategoriesHasProductPublic(ids: string[]): Promise<boolean> {
    const products = await this.connection
      .collection('stockModels')
      .find({
        isEcommerce: true,
        ecomStatus: EnumStockModelStatus.Public,
        idEcomCategory: { $in: ids },
        isActive: true,
      })
      .toArray()

    return products?.length ? true : false
  }

  async checkCategoriesHasProduct(_id: string): Promise<boolean> {
    const products = await this.connection
      .collection('stockModels')
      .find({
        isEcommerce: true,
        idEcomCategory: _id,
        isActive: true,
      })
      .toArray()

    return products?.length ? true : false
  }

  async getCategoriesChild(ids: string[]): Promise<string[]> {
    const res = await this.categoriesModel
      .find({ CategoryParent_Id: { $in: ids }, isDeleted: false })
      .select('_id')
      .lean()
      .exec()
    return res.map((d) => d._id)
  }
}
