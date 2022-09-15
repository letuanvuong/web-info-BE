import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { ApolloError } from 'apollo-server-errors'
import * as moment from 'moment'
import { FilterQuery, Model, QueryOptions } from 'mongoose'
import { StringFactory } from 'src/helper'
import { DM_DonViHanhChinh as DM_DonViHanhChinhGql } from 'src/schema'

import { DonViHanhChinhDuplicate } from './DM_DonViHanhChinh.error'
import { searchDM_DonViHanhChinhDTO } from './dto/info-DM_DonViHanhChinh.dto'
import {
  DM_DonViHanhChinh,
  DM_DonViHanhChinhDocument,
} from './schemas/DM_DonViHanhChinh.schema'

@Injectable()
export class DM_DonViHanhChinhService {
  constructor(
    @InjectModel(DM_DonViHanhChinh.name)
    private readonly dm_DonViHanhChinhModel: Model<DM_DonViHanhChinhDocument>,
  ) {}

  async getAllDonViHanhChinh(): Promise<DM_DonViHanhChinhGql[]> {
    return await this.dm_DonViHanhChinhModel
      .find({ isActive: true })
      .sort({ createdAt: 'descending' })
      .lean()
  }

  async findOneDonViHanhChinh(id: string): Promise<DM_DonViHanhChinhGql> {
    return await this.dm_DonViHanhChinhModel
      .findOne({ _id: id, isActive: true })
      .lean()
  }

  async findDonViHanhChinh(ids: string[]): Promise<DM_DonViHanhChinhGql[]> {
    return await this.dm_DonViHanhChinhModel
      .find({ _id: { $in: ids }, isActive: true })
      .lean()
  }

  async createDonViHanhChinh(
    ctx,
    newDonViHanhChinh: Partial<DM_DonViHanhChinh>,
  ): Promise<DM_DonViHanhChinhGql> {
    const found = await this.dm_DonViHanhChinhModel
      .findOne({ MaDonViHanhChinh: newDonViHanhChinh.MaDonViHanhChinh })
      .lean()

    if (found) {
      throw new DonViHanhChinhDuplicate('MaDonViHanhChinh is existed')
    }
    newDonViHanhChinh.TenKhongDau = StringFactory.formatToUnsigned(
      newDonViHanhChinh.TenDonViHanhChinh,
    )
    newDonViHanhChinh.TenKhongDauDayDu = StringFactory.formatToUnsigned(
      newDonViHanhChinh.TenDayDu,
    )
    newDonViHanhChinh.TenTat = newDonViHanhChinh.TenTat
      ? newDonViHanhChinh.TenTat.toLowerCase()
      : ''

    const donViHanhChinh = await this.dm_DonViHanhChinhModel.create({
      ...newDonViHanhChinh,
      createdAt: moment().valueOf(),
      createdBy: {
        _id: ctx?.currentUser?._id || null,
        username: ctx?.currentUser?.username || null,
        fullName: ctx?.currentUser?.employee?.TenNhanVien || null,
      },
    })

    await donViHanhChinh.save()
    if (donViHanhChinh.MacDinh) {
      await this.dm_DonViHanhChinhModel.updateMany(
        {
          _id: { $ne: donViHanhChinh._id },
        },
        {
          $set: {
            MacDinh: false,
          },
        },
      )
    }

    return donViHanhChinh
  }

  async updateDonViHanhChinh(
    ctx,
    id: string,
    editDonViHanhChinh: Partial<DM_DonViHanhChinh>,
  ): Promise<boolean> {
    const donViHanhChinh = await this.findOneDonViHanhChinh(id)
    const found = await this.dm_DonViHanhChinhModel
      .findOne({ MaDonViHanhChinh: editDonViHanhChinh.MaDonViHanhChinh })
      .lean()

    if (found && donViHanhChinh.MaDonViHanhChinh !== found.MaDonViHanhChinh) {
      throw new DonViHanhChinhDuplicate('MaDonViHanhChinh is existed')
    }
    if (editDonViHanhChinh?.TenDonViHanhChinh) {
      editDonViHanhChinh['TenKhongDau'] = StringFactory.formatToUnsigned(
        editDonViHanhChinh?.TenDonViHanhChinh,
      )
    }
    if (editDonViHanhChinh?.TenDayDu) {
      editDonViHanhChinh['TenKhongDauDayDu'] = StringFactory.formatToUnsigned(
        editDonViHanhChinh?.TenDayDu,
      )
    }
    editDonViHanhChinh.TenTat = editDonViHanhChinh.TenTat
      ? editDonViHanhChinh.TenTat.toLowerCase()
      : ''

    const update = await this.dm_DonViHanhChinhModel.updateOne(
      {
        _id: id,
      },
      {
        $set: {
          ...editDonViHanhChinh,
          updatedAt: moment().valueOf(),
          updatedBy: {
            _id: ctx?.currentUser?._id || null,
            username: ctx?.currentUser?.username || null,
            fullName: ctx?.currentUser?.employee?.TenNhanVien || null,
          },
        },
      },
    )
    if (editDonViHanhChinh.MacDinh) {
      await this.dm_DonViHanhChinhModel.updateMany(
        {
          _id: { $ne: id },
        },
        {
          $set: {
            MacDinh: false,
          },
        },
      )
    }

    return !!update.ok
  }

  async deleteDonViHanhChinh(ctx, ids: string[]): Promise<boolean> {
    const deleted = await this.dm_DonViHanhChinhModel.updateMany(
      {
        _id: ids,
      },
      {
        $set: {
          isActive: false,
          updatedAt: moment().valueOf(),
          updatedBy: {
            _id: ctx?.currentUser?._id || null,
            username: ctx?.currentUser?.username || null,
            fullName: ctx?.currentUser?.employee?.TenNhanVien || null,
          },
          deletedAt: moment().valueOf(),
          deletedBy: {
            _id: ctx?.currentUser?._id || null,
            username: ctx?.currentUser?.username || null,
            fullName: ctx?.currentUser?.employee?.TenNhanVien || null,
          },
        },
      },
    )

    return !!deleted.ok
  }

  async getAllByCondition(
    query: any,
    option?: QueryOptions,
  ): Promise<DM_DonViHanhChinhGql[]> {
    return await this.dm_DonViHanhChinhModel.find(query, null, option).lean()
  }

  async getOneByCondition(
    query: any,
    option?: QueryOptions,
  ): Promise<DM_DonViHanhChinhGql> {
    return await this.dm_DonViHanhChinhModel.findOne(query, null, option).lean()
  }

  async searchDVHC(args: {
    filter: FilterQuery<DM_DonViHanhChinhDocument>
    select?: any
    getID?: boolean
  }) {
    const { filter, select, getID } = args
    const dvhcs = await this.dm_DonViHanhChinhModel
      .find({ isActive: true, ...filter })
      .select({ _id: 1, ...(select || {}) })
      .lean()
    if (getID) return dvhcs.map((d) => d._id)
    return dvhcs
  }

  async searchDM_DonViHanhChinh(args: searchDM_DonViHanhChinhDTO) {
    try {
      const { idDefault, limit, searchString } = args
      if (searchString) {
        const existDM_DonViHanhChinhByTenTat = await this.dm_DonViHanhChinhModel
          .find({
            isActive: true,
            TenTat: searchString?.toLowerCase(),
          })
          .lean()
        if (existDM_DonViHanhChinhByTenTat?.length) {
          return existDM_DonViHanhChinhByTenTat
        }
      }
      const unsignedKeyword = StringFactory.formatToUnsigned(searchString)
      const dataDM_DonViHanhChinh = await this.dm_DonViHanhChinhModel
        .find(
          {
            isActive: true,
            $or: [
              {
                MaDonViHanhChinh: {
                  $regex: new RegExp(
                    `${searchString?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                    'siu',
                  ),
                },
              },
              {
                TenDonViHanhChinh: {
                  $regex: new RegExp(
                    `${searchString?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                    'siu',
                  ),
                },
              },
              {
                TenDayDu: {
                  $regex: new RegExp(
                    `${searchString?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                    'siu',
                  ),
                },
              },
              {
                TenTat: {
                  $regex: new RegExp(
                    `${searchString?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                    'siu',
                  ),
                },
              },
              {
                TenKhongDau: {
                  $regex: new RegExp(
                    `${unsignedKeyword?.replace(
                      /[.*+?^${}()|[\]\\]/g,
                      '\\$&',
                    )}`,
                    'siu',
                  ),
                },
              },
              {
                TenKhongDauDayDu: {
                  $regex: new RegExp(
                    `${unsignedKeyword?.replace(
                      /[.*+?^${}()|[\]\\]/g,
                      '\\$&',
                    )}`,
                    'siu',
                  ),
                },
              },
            ],
          },
          null,
          {
            limit: limit || 30,
          },
        )
        .lean()
      if (
        idDefault &&
        !dataDM_DonViHanhChinh.find((item) => item._id === idDefault)
      ) {
        const dataDefault = await this.dm_DonViHanhChinhModel
          .findOne({
            _id: idDefault,
          })
          .lean()
        if (dataDefault) {
          dataDM_DonViHanhChinh.push(dataDefault)
        }
      }
      if (!dataDM_DonViHanhChinh.find((item) => item.MacDinh)) {
        const dataMacDinh = await this.dm_DonViHanhChinhModel
          .findOne({
            isActive: true,
            MacDinh: true,
          })
          .lean()
        if (dataMacDinh) {
          dataDM_DonViHanhChinh.push(dataMacDinh)
        }
      }
      return dataDM_DonViHanhChinh
    } catch (err) {
      throw new ApolloError(err)
    }
  }
}
