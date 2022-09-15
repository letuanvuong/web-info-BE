import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { ApolloError } from 'apollo-server-errors'
import * as moment from 'moment'
import { FilterQuery, LeanDocument, Model, UpdateQuery } from 'mongoose'
import { IDFactory, RequireAtLeastOne, StringFactory } from 'src/helper'
import {
  ChangePasswordInput,
  EnumStatusAccount,
  EnumTypeAccount,
  GridOption,
  InputOptionsQueryUser,
  NeedOverrideInfo,
  NeedUpdateInfo,
  NewUserInfo,
  UsersWithPaginate,
} from 'src/schema'

import { AuthService } from '../auth/auth.service'
import { ConfigurationService } from '../base-modules/configuration/config.service'
import { IContext } from '../base-modules/graphql/gql.type'
import { MyContext } from '../base-modules/my-context/my-context'
import { ServiceManager } from '../base-modules/service-manager/service-manager'
import { CustomerService } from '../Customer/Customer.service'
import {
  CustomerDocument,
  CustomerEntity,
} from '../Customer/schemas/Customer.schema'
import {
  DeliveryAddressDocument,
  DeliveryAddressEntity,
} from '../DeliveryAddress/schemas/DeliveryAddress.schema'
import { Staff, StaffDocument } from '../Staff/schemas/NhanVien.schema'
import { StaffService } from '../Staff/Staff.service'
import { UserDocument, UserEntity } from './schemas/User.schema'
import { UserSlimEntity } from './schemas/UserSlim.schema'
import {
  CapNhatStatusError,
  ConfirmationPasswordIsIncorrectError,
  GQLTenDangNhapAlreadyInUseError,
  MailExistedError,
  PasswordNotMatchError,
  PasswordOldUsed,
  UserDaXacNhanError,
  UserExistedError,
  UserNotFoundError,
} from './User.error'
@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserEntity.name)
    public userModel: Model<UserDocument>,
    private readonly serviceManager: ServiceManager,
    @InjectModel(CustomerEntity.name)
    private readonly customerModel: Model<CustomerDocument>,
    @InjectModel(DeliveryAddressEntity.name)
    private readonly deliveryAddressModel: Model<DeliveryAddressDocument>,
    @InjectModel(Staff.name)
    private readonly staffModel: Model<StaffDocument>,
  ) {}

  async myInfo(options: {
    idUser: string
    idCurrentNode?: string
    idCurrentProfile?: string
    /** used for reducing size send through microservice */
    isLightWeight?: boolean
  }): Promise<any> {
    const { idUser } = options
    const userPromise = this.findUser({ _id: idUser })

    const user = await userPromise
    if (!user) throw new UserNotFoundError()

    return user
  }

  async findUser(
    findArgs: RequireAtLeastOne<
      Pick<UserEntity, 'username' | 'email' | '_id'>,
      'username' | 'email' | '_id'
    >,
  ) {
    const user: any = await this.userModel
      .findOne(findArgs)
      .populate({ path: 'customer' })
      .exec()

    return user
  }

  async findUsers(isGetAllUser?: boolean): Promise<UserDocument[]> {
    const users = await this.userModel
      .find(isGetAllUser ? {} : { isDeleted: { $ne: true } })
      .exec()

    return users
  }

  /**
   * @description
   * This function find a user with any of provided conditions matched
   * @param conditions
   * @returns the first user that sastified with at least one condition immediately
   * @returns null if no user sastified with any provided conditions
   */
  async findUserMatchAny(
    matchConditions: Partial<UserEntity>[],
    isAllowDeleted = false,
  ) {
    const baseConditions = isAllowDeleted ? [] : [{ isDeleted: { $ne: true } }]

    const user = await this.userModel.findOne({
      $and: [...baseConditions, { $or: matchConditions }],
    })
    return user
  }

  async registerUser(
    input: NewUserInfo,
    context: IContext,
    isAutoActive = false,
    isResponseCookie = false,
  ): Promise<UserDocument> {
    const { username, email, password: inputPassword, displayName } = input

    // check is there any user with same info
    const sameUser = await this.findUserMatchAny([
      { username: username.toLowerCase() },
    ])
    if (sameUser && sameUser.username === username)
      throw new GQLTenDangNhapAlreadyInUseError()

    const password = await this.serviceManager
      .get(AuthService)
      .hashPassword(inputPassword)

    const isActive = isAutoActive ? true : false

    const _id = IDFactory.createID()

    const createdBy = new UserSlimEntity({
      _id,
      username: username.toLowerCase(),
    })

    const newUser = new this.userModel({
      _id,
      username: username.toLocaleLowerCase(),
      displayName,
      password,
      email,
      TypeAccount: EnumTypeAccount.Customer,
      isActive,
      createdBy,
    })

    const result = await newUser.save()

    // return with cookie for skip login after register
    if (isResponseCookie && result) {
      const tokenSigned = await this.serviceManager
        .get(AuthService)
        .signUserToken(newUser._id)

      // set into cookie
      context.res.cookie(
        this.serviceManager.get(ConfigurationService).getHeaderTokenKey(),
        tokenSigned,
        {
          httpOnly: true,
          expires: new Date(moment().add(7, 'day').valueOf()),
        },
      )
    }

    return result
  }

  /** can add case input not valid and throw error */
  async updateUserOverride(options: NeedOverrideInfo, idUser: string) {
    const currentUserSlim = await this.serviceManager
      .get(MyContext)
      .get()
      .authManager.getCurrentUserSlim()

    const { isActive, isLocked, isDeleted, newPassword, confirmNewPassword } =
      options
    const updateInfo: Partial<
      Pick<
        UserEntity,
        | 'isActive'
        | 'isDeleted'
        | 'isLocked'
        | 'password'
        | 'lastChangePasswordAt'
      >
    > = {}
    if (typeof isActive === 'boolean') updateInfo.isActive = isActive
    if (typeof isLocked === 'boolean') updateInfo.isLocked = isLocked
    if (typeof isDeleted === 'boolean') updateInfo.isDeleted = isDeleted

    if (
      newPassword &&
      confirmNewPassword &&
      newPassword === confirmNewPassword
    ) {
      const hashNewPassword = await this.serviceManager
        .get(AuthService)
        .hashPassword(newPassword)
      updateInfo.password = hashNewPassword
      updateInfo.lastChangePasswordAt = Date.now()
    }

    let output: LeanDocument<UserDocument>
    if (Object.keys(updateInfo).length) {
      output = await this.userModel
        .findOneAndUpdate(
          { _id: idUser },
          {
            $set: {
              updatedAt: Date.now(),
              updatedBy: currentUserSlim,
              ...updateInfo,
            },
          },
          { new: true },
        )
        .lean()
    } else output = null

    return output
  }

  async updateStatusUsers(
    idUsers: string[],
    oldStatus: EnumStatusAccount,
    newStatus: EnumStatusAccount,
    context: IContext,
  ): Promise<boolean> {
    if (oldStatus === EnumStatusAccount.ProfileVerified)
      throw new UserDaXacNhanError()

    const result = await this.userModel.updateMany(
      { _id: { $in: idUsers } },
      {
        $set: {
          updatedAt: Date.now(),
          Status: newStatus,
          updatedBy: new UserEntity({
            _id: context?.currentUser?._id || 'test',
          }),
        },
      },
    )
    const usersFoundedLength = result.n || 0
    const usersUpdatedLength = result.nModified || 0

    return usersFoundedLength > 0 && usersUpdatedLength > 0
  }

  /**
   * update everything of user directly, USE THIS REALLY CAREFULLY
   * @returns user document after updated
   */
  private async updateUserDirectly(
    needUpdateInfo: UpdateQuery<UserDocument>,
    userFilter: FilterQuery<UserDocument>,
  ): Promise<UserDocument> {
    return this.userModel.findOneAndUpdate(userFilter, needUpdateInfo, {
      new: true,
    })
  }

  /**
   * user change password  self
   * @returns boolean
   */
  async changePassword(
    inputChangePassword: ChangePasswordInput,
    idUser: string,
    context: IContext,
  ): Promise<boolean> {
    const { currentPassword, newPassword, confirmPassword } =
      inputChangePassword
    if (confirmPassword !== newPassword) throw new PasswordNotMatchError()

    const foundUser = await this.findUser({ _id: idUser })

    if (!foundUser) throw new UserNotFoundError()

    const pwdMatched = await this.serviceManager
      .get(AuthService)
      .compareWithHashPwd(currentPassword, foundUser.password)

    if (!pwdMatched)
      throw new ConfirmationPasswordIsIncorrectError(
        'Mật khẩu hiện tại của bạn bị thiếu hoặc không chính xác',
      )

    const newPwdMatched = await this.serviceManager
      .get(AuthService)
      .compareWithHashPwd(newPassword, foundUser.password)

    if (newPwdMatched)
      throw new PasswordOldUsed(
        'Mật khẩu mới của bạn phải khác với mật khẩu trước đó của bạn.',
      )

    const hashNewPassword = await this.serviceManager
      .get(AuthService)
      .hashPassword(newPassword)

    const currentUserId = await context?.authManager.getCurrentUserId()

    const update = await this.userModel.findOneAndUpdate(
      { _id: idUser },
      {
        $set: {
          password: hashNewPassword,
          NgayDoiMatKhau: Date.now(),
          updatedAt: Date.now(),
          updatedBy: new UserEntity({
            _id: currentUserId || 'test',
          }),
        },
      },
      {
        new: true,
        upsert: true,
        rawResult: true, // Return the raw result from the MongoDB driver
      },
    )

    return update.lastErrorObject.updatedExisting
  }

  /**
   * update nguoi dung password
   * @returns boolean
   */
  async updateUserPassword(
    newPassword: string,
    User_Id: string,
    context: IContext,
  ): Promise<boolean> {
    const hashNewPassword = await this.serviceManager
      .get(AuthService)
      .hashPassword(newPassword)

    const currentUserId = await context?.authManager.getCurrentUserId()

    const update = await this.userModel.findOneAndUpdate(
      { _id: User_Id },
      {
        $set: {
          password: hashNewPassword,
          NgayDoiMatKhau: Date.now(),
          updatedAt: Date.now(),
          updatedBy: new UserEntity({
            _id: currentUserId || 'test',
          }),
        },
      },
      {
        new: true,
        upsert: true,
        rawResult: true, // Return the raw result from the MongoDB driver
      },
    )

    return update.lastErrorObject.updatedExisting
  }

  async updateStatus(input: {
    User_Id: string
    Status?: EnumStatusAccount
    isActive?: boolean
    isDeleted?: boolean
    isLocked?: boolean
  }): Promise<boolean> {
    try {
      const { User_Id, Status, isActive, isDeleted, isLocked } = input
      const updateField: Partial<UserEntity> = {}

      if (typeof isActive === 'boolean') updateField.isActive = isActive
      if (typeof isDeleted === 'boolean') updateField.isDeleted = isDeleted
      if (typeof isLocked === 'boolean') updateField.isLocked = isLocked

      const userUpdated = await this.userModel.findOneAndUpdate(
        { _id: User_Id },
        {
          $set: {
            ...updateField,
            Status,
            updatedAt: Date.now(),
            updatedBy: new UserEntity({
              _id: 'auto',
            }),
          },
        },
        {
          new: true,
          upsert: true,
          rawResult: true, // Return the raw result from the MongoDB driver
        },
      )
      return !!userUpdated
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('error', error)
      throw new CapNhatStatusError(error)
    }
  }

  async usersWithPaginate(args: {
    filterOptions: InputOptionsQueryUser
    gridOptions: GridOption
  }) {
    // ~~~~~~~~~~~~~~~~~ extract args
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    const { filterOptions = {}, gridOptions = {} } = args
    const {
      startRow: gridStartRow,
      endRow: gridEndRow,
      // 2 fields below used on grid with group
      // rowGroupCols: gridRowGroupCols = [],
      // groupKeys: gridGroupKeys = [],
      sortModel: gridSortInput = [],
    } = gridOptions
    const gridFilterInput: Partial<
      Record<string, Record<string, any> & { filter: any }>
    > = gridOptions.filterModel || {}

    // ~~~~~~~~~~~~~~~~ create FilterQuery for main table - User in this case
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // separate fields used for foreign key
    // const { MaLoaiDichVu, idsPhamViDichVu } = filterOptions
    // const { fieldCanTach } = filterOptions
    // delete filterOptions.fieldCanTach
    // create FilterQuery User
    const filterUser: FilterQuery<UserDocument>['$and'] = [
      { isDeleted: { $ne: true } },
    ]
    // apply tự động vào filter
    // chỉ áp dụng các field khớp tên giữa graphql và db, nếu ko khớp tên cần tự xử lý riêng
    Object.entries(filterOptions).forEach(([filterKey, filterValue]) => {
      switch (typeof filterValue) {
        case 'boolean':
        case 'string':
        case 'number':
          filterUser.push({ [filterKey]: filterValue })
          break
        // case array
        case 'object':
          if (filterValue?.length)
            filterUser.push({ [filterKey]: { $in: filterValue } })
          break

        default:
          break
      }
    })

    // dựa vào các field dành cho khóa ngoại để update filterUser
    // this query not used query on foreign key yet

    // ~~~ validate filter - sort input of grid (only allow filter or sort on below fields)
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // TODO còn cách nào làm hard code bên dưới phụ thuộc vào class gốc ko
    const fieldsFilterOnUser = {
      username: 'username',
      Status: 'Status',
      displayName: 'displayName',
    }
    const fieldsFilterOnCustomer = {
      'customer.email': 'email',
      'customer.phoneNumber': 'phoneNumber',
      // fullName: 'customer.fullName',
      'customer.unsignedFullName': 'unsignedFullName',
      'customer.gender': 'gender',
    }
    const fieldsSortOnUser = {
      _id: '_id',
      username: 'username',
      Status: 'Status',
      displayName: 'displayName',
    }
    const fieldsSortOnCustomer = {
      'customer.email': 'email',
      'customer.phoneNumber': 'phoneNumber',
      // 'customer.fullName': 'fullName',
      'customer.unsignedFullName': 'unsignedFullName',
      'customer.gender': 'gender',
    }
    Object.keys(gridFilterInput).forEach((eachFieldKey) => {
      if (
        !fieldsFilterOnUser[eachFieldKey] &&
        !fieldsFilterOnCustomer[eachFieldKey]
      )
        // TODO use custom err with code
        throw new ApolloError(
          `filter ${eachFieldKey} không có trong ds hỗ trợ. ${Object.keys(
            fieldsFilterOnUser,
          )} ${Object.keys(fieldsFilterOnCustomer)}`,
        )
    })
    gridSortInput.forEach((eachSort) => {
      if (
        !fieldsSortOnUser[eachSort.colId] &&
        !fieldsSortOnCustomer[eachSort.colId]
      )
        throw new ApolloError(
          `sort ${eachSort.colId} không có trong ds hỗ trợ. ${Object.keys(
            fieldsSortOnUser,
          )} ${Object.keys(fieldsSortOnCustomer)}`,
        )
      if (eachSort.sort !== 'asc' && eachSort.sort !== 'desc')
        throw new ApolloError(`sort ${eachSort.sort} không hợp lệ, asc or desc`)
    })

    // ~~~~~~~~~~~~~~~~~ resolve filter of grid
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // phân hoạch filter trên các bảng tương ứng
    // TODO bring type to somewhere
    const filtersOnUser: Record<string, Record<string, any> & { filter: any }> =
      {}
    const filtersOnCustomer: Record<
      string,
      Record<string, any> & { filter: any }
    > = {}
    Object.entries(gridFilterInput).forEach(([filterKey, filterValue]) => {
      if (fieldsFilterOnUser[filterKey]) filtersOnUser[filterKey] = filterValue
      if (fieldsFilterOnCustomer[filterKey])
        filtersOnCustomer[filterKey] = filterValue
    })
    //
    // cập nhật filter cho User
    Object.entries(gridFilterInput).forEach((eachFilter) => {
      const [filterKey, filterValue] = eachFilter
      if (!filterValue?.filter) return
      switch (filterKey) {
        case fieldsFilterOnUser.username:
        case fieldsFilterOnUser.Status:
        case fieldsFilterOnUser.displayName:
          filterUser.push({
            [filterKey]: {
              $regex: new RegExp(
                `${StringFactory.formatToUnsigned(filterValue.filter).replace(
                  /[.*+?^${}()|[\]\\]/g,
                  '\\$&',
                )}`,
              ),
            },
          })
          break

        default:
          break
      }
    })

    // cập nhật FilterQuery search cho Customer
    if (Object.entries(filtersOnCustomer).length) {
      const filterSearchCustomer: FilterQuery<CustomerDocument> = {}
      Object.entries(filtersOnCustomer).forEach((eachFilter) => {
        const [filterKey, filterValue] = eachFilter
        switch (filterKey) {
          case 'customer.email':
          case 'customer.phoneNumber':
          case 'customer.unsignedFullName':
            filterSearchCustomer[fieldsFilterOnCustomer[filterKey]] = {
              $regex: new RegExp(
                `${StringFactory.formatToUnsigned(filterValue.filter).replace(
                  /[.*+?^${}()|[\]\\]/g,
                  '\\$&',
                )}`,
                'i',
              ),
            }
            break
          case 'customer.gender':
            filterSearchCustomer[fieldsFilterOnCustomer[filterKey]] = {
              $in: filterValue.values,
            }
            break
          default:
            break
        }
      })

      const userAllowedIds = (
        await this.serviceManager
          .get(CustomerService)
          .customerModel.find(filterSearchCustomer)
          .select({ _id: 1, user_Id: 1 })
          .lean()
      ).map((customer) => customer.user_Id)

      filterUser.push({ _id: { $in: userAllowedIds } })
    }

    // ~~~~~~~~~~~~~~~~~ compute sort obj on foreign key of grid
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    // case sort on table customer
    const sortForeignObj: Partial<Record<'addFields' | 'sort', any>> = {}
    if (fieldsSortOnCustomer[gridSortInput[0]?.colId]) {
      const colSortOn = gridSortInput[0]

      const customerSorted = await this.serviceManager
        .get(CustomerService)
        .customerModel.find({})
        .sort({
          [fieldsSortOnCustomer[colSortOn.colId]]: colSortOn.sort,
        })
        .select({ _id: true, user_Id: true })
        .lean()

      if (customerSorted.length) {
        const userSortedIds = customerSorted.map((customer) => customer.user_Id)

        sortForeignObj.addFields = {
          __order: { $indexOfArray: [userSortedIds, '$_id'] },
        }
        sortForeignObj.sort = {
          __order: 1,
          _id: 1,
        }
      }
    }

    // ~~~~~~ add filter from groupKeys
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // gridGroupKeys.forEach((groupValue, index) => {
    //   const colGroup = gridRowGroupCols[index]
    //   if (!colGroup)
    //     throw new ApolloError(`Không tìm thấy group cho '${groupValue}'`)
    //   filterUser.push({ [colGroup.id]: groupValue })
    // })

    // ~~~~~~~~~~~~~~~~~ apply get data
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    let aggregateObj = this.userModel.aggregate().match({ $and: filterUser })

    // ~~~~~~~~~~~~~~~~~~ apply groupBy
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // const colNeedGroupBy = gridRowGroupCols[gridGroupKeys.length]
    // if (colNeedGroupBy) {
    //   aggregateObj = aggregateObj.group({
    //     _id: `$${colNeedGroupBy.id}`,
    //     [colNeedGroupBy.id]: { $first: `$${colNeedGroupBy.id}` },
    //     childCount: { $sum: 1 },
    //   })
    // }

    // ~~~~~~~~~~~~~~~ resolve pageInfo
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // TODO move to resolve field
    const totalDocument = await this.userModel
      .countDocuments({ $and: filterUser })
      .lean()

    // ~~~~~~~~~~~~~~~~~~~~~ apply sort of grid
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    if (sortForeignObj.sort) {
      aggregateObj = aggregateObj
        .addFields(sortForeignObj.addFields)
        .sort(sortForeignObj.sort)
    } else {
      const sortObj: Partial<
        Record<keyof typeof fieldsSortOnUser, 'asc' | 'desc'>
      > = {}
      gridSortInput.forEach((eachSortField) => {
        const { colId, sort } = eachSortField
        sortObj[colId] = sort
      })
      // trong trường hợp có các dòng không phân biệt dc thứ tự thì có thể dựa thêm vào _id
      if (!sortObj._id) sortObj._id = 'asc'
      // apply sort
      aggregateObj = aggregateObj.sort(sortObj)
    }

    // ~~~~~~~~~~~~~~~ apply pagination of grid
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // validate and apply pagination info
    if (typeof gridStartRow === 'number') {
      if (gridStartRow < 0)
        throw new ApolloError(`startRow = ${gridStartRow} không hợp lệ`)
      aggregateObj = aggregateObj.skip(gridStartRow)
    }

    if (typeof gridEndRow === 'number') {
      if (gridEndRow < gridStartRow)
        throw new ApolloError(`endRow = ${gridEndRow} không hợp lệ`)
      aggregateObj = aggregateObj.limit(gridEndRow - gridStartRow)
    }

    // ~~~~~~~~~~~~~~~~~ compute result
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    const output: UsersWithPaginate = {
      totalRows: totalDocument,
      // TODO not rememner why not resolve pageInfo
      // pageInfo: {
      //   currentPage,
      //   sizePage,
      //   totalRows: totalDocument,
      //   totalPages: totalPage,
      // },
    }
    const users = await aggregateObj.exec()
    output.users = users

    return output
  }

  async createUser(input: NewUserInfo): Promise<UserDocument> {
    try {
      const { email, username, password: inputPassword, displayName } = input

      const foundUser = await this.userModel.findOne({ email }).lean()

      if (foundUser?._id) throw new ApolloError('Tài khoản đã tồn tại!')

      const password = await this.serviceManager
        .get(AuthService)
        .hashPassword(inputPassword)

      const _id = IDFactory.createID()

      const createdBy = new UserSlimEntity({
        _id,
        username: username.toLowerCase(),
      })

      const newUser = new this.userModel({
        _id,
        username: username.toLocaleLowerCase(),
        displayName,
        password,
        email,
        TypeAccount: EnumTypeAccount.Customer,
        createdBy,
      })

      const result = await newUser.save()

      return result
    } catch (error) {
      throw new ApolloError(error)
    }
  }

  async createUserTypeAdmin(
    input: NewUserInfo,
    context,
  ): Promise<UserDocument> {
    try {
      const {
        email,
        username,
        password: inputPassword,
        displayName,
        note,
        phoneNumber,
      } = input

      const currentUserSlim = await this.serviceManager
        .get(MyContext)
        .get()
        .authManager.getCurrentUserSlim()

      const foundUser = await this.userModel
        .findOne({ username, isDeleted: false, isActive: true })
        .lean()

      if (foundUser?._id) {
        throw new UserExistedError()
      }

      if (email) {
        const foundEmail = await this.userModel
          .findOne({
            email,
            isDeleted: false,
            isActive: true,
          })
          .lean()

        if (foundEmail?._id) {
          throw new MailExistedError()
        }
      }

      const password = await this.serviceManager
        .get(AuthService)
        .hashPassword(inputPassword)

      const _id = IDFactory.createID()

      await this.serviceManager.get(StaffService).createStaff(
        {
          input: {
            TenNhanVien: username,
            TenKhongDau: username,
            TaiKhoan_Id: _id,
            SoDienThoai: phoneNumber,
            Email: email,
            createdBy: currentUserSlim,
            updatedBy: currentUserSlim,
          },
        },
        context,
      )

      const newUser = new this.userModel({
        _id,
        username: username.toLocaleLowerCase(),
        displayName,
        password,
        email,
        TypeAccount: EnumTypeAccount.Admin,
        createdBy: currentUserSlim,
        updatedBy: currentUserSlim,
        note,
        phoneNumber,
        profiles: [
          {
            _id: 'appadmin', // FIXME generate id
            idProfile: 'appadmin',
            grantedAt: Date.now(),
            grantedBy: context?.currentUser,
          },
        ],
      })

      const result = await newUser.save()

      return result
    } catch (error) {
      throw new ApolloError(error)
    }
  }

  async search(args: {
    filter: FilterQuery<UserDocument>
    select?: any
    getID?: boolean
  }) {
    const { filter, select, getID } = args
    const nns = await this.userModel
      .find({
        isDeleted: { $ne: true },
        isActive: { $ne: false },
        ...filter,
      })
      .select({ _id: 1, ...(select || {}) })
      .lean()
    if (getID) return nns.map((d) => d._id)
    return nns
  }

  public async searchUser({
    keyword,
    idDefault,
    limit,
  }): Promise<UserDocument[]> {
    let Users = []
    if (keyword || idDefault) {
      let arrUserByCustomer = []
      const objFind: any = {
        isLocked: { $ne: true },
        isDeleted: { $ne: true },
        email: { $exists: true, $nin: ['', null, undefined] },
        TypeAccount: EnumTypeAccount.Customer,
        $or: [
          {
            username: {
              $regex: new RegExp(
                `${keyword?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                'siu',
              ),
            },
          },
        ],
      }
      const arrUser = await this.userModel
        .find(objFind)
        .limit(limit || 50)
        .lean()

      if (keyword) {
        const unsignedKeyword = StringFactory.formatToUnsigned(keyword)
        const arrCustomerByKeyword = await this.customerModel
          .find({
            unsignedFullName: {
              $regex: new RegExp(
                `${unsignedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                'siu',
              ),
            },
          })
          .lean()

        if (arrCustomerByKeyword?.length) {
          const deliveryAddress_Defaults = await this.deliveryAddressModel
            .find({
              idCustomer: {
                $in: arrCustomerByKeyword?.map((e) => e._id),
              },
              isDefault: true,
            })
            .lean()
          const dataHasDeliveryAddress = new Map(
            deliveryAddress_Defaults.map((deliveryAddress) => [
              deliveryAddress.idCustomer,
              deliveryAddress,
            ]),
          )

          arrCustomerByKeyword?.forEach((e) => {
            e['deliveryAddress_Default'] = dataHasDeliveryAddress.get(e?._id)
          })
          const dataHasCustomerByKeyword = new Map(
            arrCustomerByKeyword.map((customer) => [
              customer.user_Id,
              customer,
            ]),
          )
          const user_Ids = arrCustomerByKeyword.map((e) => e?.user_Id)
          const filterUser_Ids = user_Ids?.filter((e) => e)
          if (filterUser_Ids?.length) {
            arrUserByCustomer = await this.userModel.find({
              _id: {
                $in: filterUser_Ids,
              },
            })
            arrUserByCustomer?.forEach((e) => {
              e['customer'] = dataHasCustomerByKeyword.get(e?._id)
            })
          }
        }
      }

      let arrUserOther = arrUser
      if (arrUser?.length && arrUserByCustomer?.length) {
        const arrUserByCustomer_Ids = arrUserByCustomer.map((e) => e._id)
        const filterArrUser = arrUser.filter(
          (e) => !arrUserByCustomer_Ids.includes(e?._id),
        )
        arrUserOther = filterArrUser
      }

      if (idDefault && !arrUserOther.find((item) => item._id === idDefault)) {
        const dataDefault = await this.userModel
          .findOne({
            _id: idDefault,
          })
          .lean()
        if (dataDefault?._id) {
          arrUserOther.push(dataDefault)
        }
      }
      const customers = await this.customerModel
        .find({
          user_Id: {
            $in: arrUserOther?.map((e) => e._id),
          },
        })
        .lean()

      const dataHasCustomer = new Map(
        customers.map((customer) => [customer.user_Id, customer]),
      )

      const deliveryAddress_Defaults = await this.deliveryAddressModel
        .find({
          idCustomer: {
            $in: customers?.map((e) => e._id),
          },
          isDefault: true,
        })
        .lean()

      const dataHasDeliveryAddress = new Map(
        deliveryAddress_Defaults.map((deliveryAddress) => [
          deliveryAddress.idCustomer,
          deliveryAddress,
        ]),
      )

      customers?.forEach((e) => {
        e['deliveryAddress_Default'] = dataHasDeliveryAddress.get(e?._id)
      })

      arrUserOther?.forEach((e) => {
        e['customer'] = dataHasCustomer.get(e?._id)
      })
      const tempArrUserByCustomer = JSON.parse(
        JSON.stringify(arrUserByCustomer || []),
      )
      const tempArrUserOther = JSON.parse(JSON.stringify(arrUserOther || []))
      Users = tempArrUserByCustomer.concat(tempArrUserOther)
    } else {
      const objFind: any = {
        email: { $exists: true, $nin: ['', null, undefined] },
        isLocked: { $ne: true },
        isDeleted: { $ne: true },
        TypeAccount: EnumTypeAccount.Customer,
      }
      Users = await this.userModel
        .find(objFind)
        .limit(limit || 50)
        .lean()

      const customers = await this.customerModel
        .find({
          user_Id: {
            $in: Users?.map((e) => e._id),
          },
        })
        .lean()

      const dataHasCustomer = new Map(
        customers.map((customer) => [customer.user_Id, customer]),
      )

      const deliveryAddress_Defaults = await this.deliveryAddressModel
        .find({
          idCustomer: {
            $in: customers?.map((e) => e._id),
          },
          isDefault: true,
        })
        .lean()

      const dataHasDeliveryAddress = new Map(
        deliveryAddress_Defaults.map((deliveryAddress) => [
          deliveryAddress.idCustomer,
          deliveryAddress,
        ]),
      )

      customers?.forEach((e) => {
        e['deliveryAddress_Default'] = dataHasDeliveryAddress.get(e?._id)
      })

      Users?.forEach((e) => {
        e['customer'] = dataHasCustomer.get(e?._id)
      })
    }
    return Users
  }

  async getUsersTypeAdmin(): Promise<UserDocument[]> {
    return await this.userModel
      .find({ TypeAccount: EnumTypeAccount.Admin, isDeleted: false })
      .populate('employee')
      .lean()
  }

  public async searchUserNotHaveStaff({
    keyword,
    idDefault,
    limit,
    isUpdate,
  }): Promise<UserDocument[]> {
    let Users = []
    if (keyword || idDefault) {
      const objFind: any = {
        isLocked: { $ne: true },
        isDeleted: { $ne: true },
        TypeAccount: { $ne: EnumTypeAccount.Customer },
        $or: [
          {
            username: {
              $regex: new RegExp(
                `${keyword?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                'siu',
              ),
            },
          },
        ],
      }
      const getUsers = await this.userModel
        .find(objFind)
        .limit(limit || 50)
        .lean()

      const staffs = await this.staffModel
        .find({
          TaiKhoan_Id: {
            $in: getUsers?.map((e) => e._id),
          },
        })
        .lean()

      const user_Ids = staffs?.map((e) => e.TaiKhoan_Id)
      Users = getUsers?.filter((e) => !user_Ids.includes(e._id))

      if (
        idDefault &&
        isUpdate &&
        !Users.find((item) => item._id === idDefault)
      ) {
        const dataDefault = await this.userModel
          .findOne({
            _id: idDefault,
          })
          .lean()
        if (dataDefault?._id) {
          Users.push(dataDefault)
        }
      }
    } else {
      const objFind: any = {
        isLocked: { $ne: true },
        TypeAccount: { $ne: EnumTypeAccount.Customer },
        isDeleted: { $ne: true },
      }
      const getUsers = await this.userModel
        .find(objFind)
        .limit(limit || 50)
        .lean()

      const staffs = await this.staffModel
        .find({
          TaiKhoan_Id: {
            $in: getUsers?.map((e) => e._id),
          },
        })
        .lean()

      const user_Ids = staffs?.map((e) => e.TaiKhoan_Id)
      Users = getUsers?.filter((e) => !user_Ids.includes(e._id))
    }
    return Users
  }

  async deleteUsers(idUsers: string[]): Promise<boolean> {
    const result = await this.userModel.updateMany(
      { _id: { $in: idUsers } },
      {
        $set: {
          isDeleted: true,
          isActive: false,
        },
      },
    )

    const usersFoundLength = result.n || 0
    const usersDeletedLength = result.nModified || 0

    return usersFoundLength > 0 && usersDeletedLength > 0
  }

  async updateUsers(
    needUpdateInfo: Partial<UserEntity>,
    idUsers: string[],
    context: IContext,
  ): Promise<boolean> {
    const { isLocked, password } = needUpdateInfo

    const updated = {
      ...(isLocked !== undefined ? { isLocked } : {}),
      ...(password
        ? {
            password: await this.serviceManager
              .get(AuthService)
              .hashPassword(password),
          }
        : {}),
    }

    const result = await this.userModel.updateMany(
      { _id: { $in: idUsers } },
      {
        $set: {
          ...updated,
          updatedAt: Date.now(),
          updatedBy: new UserEntity({
            _id: context?.currentUser?._id || 'test',
          }),
        },
      },
    )
    const usersFoundedLength = result.n || 0
    const usersUpdatedLength = result.nModified || 0

    return usersFoundedLength > 0 && usersUpdatedLength > 0
  }

  async updateUser(
    needUpdateInfo: Partial<UserEntity> & NeedUpdateInfo,
    idUser: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context: IContext,
  ): Promise<UserDocument> {
    const currentUserSlim = await this.serviceManager
      .get(MyContext)
      .get()
      .authManager.getCurrentUserSlim()

    const foundUser = await this.userModel
      .findOne({
        _id: { $ne: idUser },
        username: needUpdateInfo.username,
        isDeleted: false,
        isActive: true,
      })
      .lean()

    if (foundUser?._id) {
      throw new UserExistedError()
    }

    if (needUpdateInfo.email) {
      const foundEmail = await this.userModel
        .findOne({
          _id: { $ne: idUser },
          email: needUpdateInfo.email,
          isDeleted: false,
          isActive: true,
        })
        .lean()

      if (foundEmail?._id) {
        throw new MailExistedError()
      }
    }

    // check special case for update password
    if (needUpdateInfo.password) {
      needUpdateInfo.password = await this.serviceManager
        .get(AuthService)
        .hashPassword(needUpdateInfo.password)
    }

    // update history
    needUpdateInfo.updatedAt = Date.now()
    needUpdateInfo.updatedBy = currentUserSlim

    return this.updateUserDirectly(needUpdateInfo, {
      _id: idUser,
    })
  }
}
