import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { ApolloError } from 'apollo-server-errors'
import { isEmpty } from 'lodash'
import * as moment from 'moment'
import { FilterQuery, Model } from 'mongoose'
import { removeVietnameseTones, StringFactory } from 'src/helper'
import {
  EcomCategoriesFilter,
  EcomCategoriesSearch,
  EcomCategoriesSort,
  Staff as StaffGql,
  StaffPagination,
  StaffPaginationTotal,
  StaffRes,
} from 'src/schema'

import {
  DM_DonViHanhChinh,
  DM_DonViHanhChinhDocument,
} from '../DM_DonViHanhChinh/schemas/DM_DonViHanhChinh.schema'
import { ThuTuSinhMaService } from '../ThuTuSinhMa/ThuTuSinhMa.service'
import { UserSlimEntity } from '../user/schemas/UserSlim.schema'
import { Staff, StaffDocument } from './schemas/NhanVien.schema'
// import { MicroserviceAuthService } from '../microservice-client/microservice-auth.service'
// import { ServiceCaller } from '../base-modules/service-caller/service-caller'

@Injectable()
export class StaffService {
  constructor(
    @InjectModel(Staff.name)
    private readonly staffModel: Model<StaffDocument>,
    @InjectModel(DM_DonViHanhChinh.name)
    private readonly donViHanhChinhModel: Model<DM_DonViHanhChinhDocument>,
    private readonly thuTuSinhMaService: ThuTuSinhMaService,
  ) {}

  async renderQueryPagination(
    filter: [EcomCategoriesFilter],
    search: [EcomCategoriesSearch],
  ) {
    const skip = false
    const fieldsSearch = [
      'MaNhanVien',
      'TenNhanVien',
      'Email',
      'SoDienThoai',
      'CMNDHoacHoChieu',
      'TaxCode',
      'TamNgung',
      'NgaySinh',
    ]

    const fieldsForeignSearch = ['fullAddress']

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
              if (s?.fieldSearch === 'TenNhanVien') {
                s.fieldSearch = 'TenKhongDau'
                s.textSearch = removeVietnameseTones(s.textSearch)
              }

              // đưa các khóa ngoại vào object searchForeignKey
              if (fieldsForeignSearch.includes(s?.fieldSearch)) {
                searchForeignKey[s?.fieldSearch] = s.textSearch
                return null
              }

              if (['NgaySinh']?.includes(s?.fieldSearch)) {
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
    if (or.length < 1) or = [{}]

    // duyệt các khóa ngoại searchForeignKey, search lấy ids và gán câu query cho từng khóa ngoại vào ForeignKey
    for await (const fieldKey of Object.keys(searchForeignKey)) {
      switch (fieldKey) {
        case 'fullAddress':
          const DiaChi_Ids = await this.search({
            filter: {
              TenKhongDauDayDu: {
                $regex: new RegExp(
                  removeVietnameseTones(searchForeignKey[fieldKey])?.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    '\\$&',
                  ),
                  'siu',
                ),
              },
            },
            select: { _id: 1 },
            getID: true,
          })

          if (DiaChi_Ids.length < 1) return { _id: { $in: [] } }
          if (DiaChi_Ids.length > 0) {
            foreignKeyOr.push({
              DiaChi_Id: { $in: DiaChi_Ids },
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
            isActive: true,
            $and: or,
            ...foreignKey,
          },
          foreignKeyOr.length > 0 ? { $or: [...foreignKeyOr] } : {},
          filterObject,
        )
  }

  async getStaffPagination(
    page: number,
    limit: number,
    search: [EcomCategoriesSearch],
    filter: [EcomCategoriesFilter],
    sort: [EcomCategoriesSort],
  ): Promise<StaffPagination> {
    return new Promise(async (rel, rej) => {
      const query: any = await this.renderQueryPagination(filter, search)
      if (!page || page < 1) page = 1
      if (!limit && limit !== 0) limit = 10
      const sortData = {}
      sort?.map((e) => {
        sortData[e?.fieldSort] = e?.sort
      })
      try {
        const staffs: StaffRes[] = await this.staffModel
          .find(query)
          .populate({
            path: 'DiaChi_Id',
            model: DM_DonViHanhChinh.name,
          })
          .sort(!isEmpty(sortData) ? sortData : { createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean()
          .exec()

        const result = staffs.map((x: any) => {
          const tempResult = x

          if (x?.DiaChi_Id?._id) {
            x['fullAddress'] = `${x.SoNha || ''}, ${
              x?.DiaChi_Id?.TenDayDu || x?.DiaChi_Id?.TenDonViHanhChinh || ''
            }`
            if (x['fullAddress'].slice(0, 2) === ', ') {
              x['fullAddress'] = x['fullAddress'].substr(2)
            }
            tempResult['DiaChi_Id'] = x?.DiaChi_Id?._id
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

  async getStaffPaginationTotal(
    page: number,
    limit: number,
    search: [EcomCategoriesSearch],
    filter: [EcomCategoriesFilter],
  ): Promise<StaffPaginationTotal> {
    return new Promise(async (rel, rej) => {
      try {
        const query: any = await this.renderQueryPagination(filter, search)
        const total = await this.staffModel.find(query).countDocuments()
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

  async search(args: {
    filter: FilterQuery<DM_DonViHanhChinhDocument>
    select?: any
    getID?: boolean
  }) {
    const { filter, select, getID } = args
    const nns = await this.donViHanhChinhModel
      .find({
        isActive: true,
        ...filter,
      })
      .select({ _id: 1, ...(select || {}) })
      .lean()
    if (getID) return nns.map((d) => d._id)
    return nns
  }

  public async getStaffs(): Promise<any> {
    const employees = await this.staffModel
      .find({
        isActive: true,
      })
      .sort({ createdAt: -1 })
      .lean()

    const dataDonViHanhChinh = await this.donViHanhChinhModel
      .find({
        _id: { $in: employees.map((d) => d.DiaChi_Id) },
      })
      .lean()
    const dataHasNoiSinhSong = new Map(
      dataDonViHanhChinh.map((e) => [e._id, e]),
    )

    employees.forEach((e: any) => {
      const diaChi = dataHasNoiSinhSong.get(e.DiaChi_Id)
      e['fullAddress'] = `${e.SoNha || ''}, ${
        diaChi?.TenDayDu || diaChi?.TenDonViHanhChinh || ''
      }`
      if (e['fullAddress'].slice(0, 2) === ', ') {
        e['fullAddress'] = e['fullAddress'].substr(2)
      }
    })
    return employees
  }

  public async getStaff(id): Promise<any> {
    const employee = await this.staffModel.findOne({ _id: id }).lean()
    return employee
  }

  public async getMultipleStaff({ ids }): Promise<StaffGql[]> {
    return await this.staffModel
      .find({
        _id: { $in: ids },
        isActive: true,
      })
      .lean()
  }

  public async createStaff(employeeInput: any, context: any): Promise<boolean> {
    const currentUser = await context?.authManager.getCurrentUser()
    const currentUserSlim = new UserSlimEntity({
      _id: currentUser?._id,
      username: currentUser?.username,
    })
    try {
      const { input } = employeeInput

      if (input.TaiKhoan_Id) {
        const existedAccount = await this.staffModel
          .find({
            TaiKhoan_Id: input.TaiKhoan_Id,
          })
          .lean()
        if (existedAccount?.length)
          throw new ApolloError('This account has been created')
      }
      const newObj: any = {
        MaNhanVien: await this.thuTuSinhMaService.generateCodeByIndex(
          'Staff',
          'ST',
          '-',
          6,
        ),
        TenNhanVien: input.TenNhanVien,
        TaiKhoan_Id: input.TaiKhoan_Id,
        TenKhongDau: StringFactory.formatToUnsigned(input.TenNhanVien),
        NgaySinh: input.NgaySinh,
        SoDienThoai: input.SoDienThoai,
        GioiTinh: input.GioiTinh,
        DiaChi_Id: input.DiaChi_Id,
        SoNha: input.SoNha,
        CMNDHoacHoChieu: input.CMNDHoacHoChieu,
        TamNgung: input.TamNgung,
        TaxCode: input.TaxCode,
        Email: input.Email,
        LinkAvatar: input.LinkAvatar,
        isActive: true,
        createdAt: moment().valueOf(),
        createdBy: currentUserSlim,
      }

      if (input._id) {
        newObj._id = input._id
      }

      const employee = new this.staffModel(newObj)
      const result = await employee.save()

      if (result) return true

      return false
    } catch (error) {
      throw new ApolloError(error)
    }
  }

  public async updateStaff(employeeInput: any, context: any): Promise<any> {
    try {
      const { id, input } = employeeInput

      const employee = await this.staffModel
        .findOne({
          isActive: true,
          _id: id,
        })
        .lean()

      if (input.TaiKhoan_Id) {
        const checkExistedAccount = await this.staffModel
          .findOne({
            _id: { $ne: id },
            isActive: true,
            TaiKhoan_Id: input.TaiKhoan_Id,
          })
          .lean()
        if (checkExistedAccount && checkExistedAccount?._id !== id)
          throw new ApolloError('This account has been created')
      }

      if (input.TenNhanVien) {
        input['TenKhongDau'] = StringFactory.formatToUnsigned(input.TenNhanVien)
      }
      const result = await this.staffModel.updateOne(
        {
          _id: employee._id,
        },
        {
          $set: {
            ...input,
            updatedAt: moment().valueOf(),
            updatedBy: {
              _id: context.currentUser?._id || null,
              fullName: context.currentUser?.employee?.TenNhanVien || null,
              username: context.currentUser?.username || null,
            },
          },
        },
      )

      return !!(result.ok === 1)
    } catch (error) {
      throw new ApolloError(error)
    }
  }

  public async removeStaff(args: any, context: any): Promise<any> {
    try {
      const { ids } = args
      const employees = await this.staffModel
        .find({
          _id: { $in: ids },
        })
        .lean()

      if (employees?.length) {
        await this.staffModel.updateMany(
          {
            _id: employees.map((e) => e._id),
          },
          {
            $set: {
              isActive: false,
              updatedAt: moment().valueOf(),
              updatedBy: {
                _id: context.currentUser?._id || null,
                fullName: context.currentUser?.employee?.TenNhanVien || null,
                username: context.currentUser?.username || null,
              },
              deletedAt: moment().valueOf(),
              deletedBy: {
                _id: context.currentUser?._id || null,
                fullName: context.currentUser?.employee?.TenNhanVien || null,
                username: context.currentUser?.username || null,
              },
            },
          },
        )
      }
      return true
    } catch (error) {
      throw new ApolloError(error)
    }
  }

  public async searchStaff({
    keyWord,
    idDefault,
    limit,
    idDefaults,
  }): Promise<StaffGql[]> {
    if (keyWord || idDefault || idDefaults?.length) {
      const unsignedKeyword = StringFactory.formatToUnsigned(keyWord)
      const objFind: any = {
        isActive: true,
        TamNgung: { $ne: true },
        $or: [
          {
            MaNhanVien: {
              $regex: new RegExp(
                `${keyWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                'siu',
              ),
            },
          },
          {
            TenNhanVien: {
              $regex: new RegExp(
                `${keyWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                'siu',
              ),
            },
          },
          {
            TenKhongDau: {
              $regex: new RegExp(
                `${unsignedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                'siu',
              ),
            },
          },
        ],
      }

      let nhanViens = await this.staffModel
        .find(objFind)
        .limit(limit || 50)
        .lean()
      if (idDefault && !nhanViens.find((item) => item._id === idDefault)) {
        const dataDefault = await this.staffModel
          .findOne({
            _id: idDefault,
          })
          .lean()
        if (dataDefault?._id) {
          nhanViens.push(dataDefault)
        }
      }

      if (idDefaults?.length) {
        const dataDefaults = await this.staffModel
          .find({
            _id: { $in: idDefaults },
          })
          .lean()
        if (dataDefaults?.length) {
          nhanViens = nhanViens.concat(dataDefaults)
        }
      }

      return nhanViens
    } else {
      const objFind: any = {
        isActive: true,
        TamNgung: { $ne: true },
      }

      const nhanViens = await this.staffModel
        .find(objFind)
        .limit(limit || 50)
        .lean()

      return nhanViens
    }
  }

  async findStaffByFilter(
    filter: FilterQuery<StaffDocument>,
    projection: any = {},
  ) {
    return this.staffModel.find(filter).select(projection).lean().exec()
  }

  public async findOneStaffByFilter(
    filter: FilterQuery<StaffDocument>,
    projection: any = {},
  ) {
    return this.staffModel.findOne(filter).select(projection).lean().exec()
  }
}
