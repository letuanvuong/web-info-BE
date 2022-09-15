import {
  Args,
  Context,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql'
import { LeanDocument } from 'mongoose'
import { hasOwnProperty, sendMail, StringFactory } from 'src/helper'
import {
  ChangePasswordInput,
  EnumStatusAccount,
  GridOption,
  InputCreateActivationToken,
  InputOptionsQueryUser,
  NeedOverrideInfo,
  NeedUpdateInfo,
  NewUserInfo,
  User,
  UserResponse,
  UserSlim,
} from 'src/schema'

import {
  GQLTokenIsExpired,
  GQLTokenIsInvalid,
} from '../ActivationTokenHash/ActivationTokenHash.error'
import { ActivationTokenHashService } from '../ActivationTokenHash/ActivationTokenHash.service'
import { UnauthenticatedError } from '../auth/auth.error'
import { JWTTokenPayload } from '../auth/auth.interface'
import { AuthService } from '../auth/auth.service'
import { IContext } from '../base-modules/graphql/gql.type'
import { ServiceManager } from '../base-modules/service-manager/service-manager'
import { ContentHomePageService } from '../ContentHomePage/ContentHomePage.service'
import { CustomerService } from '../Customer/Customer.service'
import { GQLCustomizeError } from '../user/User.error'
import { VerifyTokenService } from '../VerifyToken/VerifyToken.service'
import { UserDocument } from './schemas/User.schema'
import {
  GQLInputNewPasswordError,
  GQLUserWasDeleted,
  UserNotFoundError,
} from './User.error'
import { UserService } from './User.service'
@Resolver('User')
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly serviceManager: ServiceManager,
    private readonly authService: AuthService,
    private readonly activationTokenHashService: ActivationTokenHashService,
    private readonly contentHomePageService: ContentHomePageService,
  ) {}

  @Query()
  async myInfo(@Context() context: IContext): Promise<UserResponse> {
    // FIXME check authen by decorator
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return this.userService.myInfo({
      idUser: currentUserId,
      isLightWeight: true,
    })
  }

  @Query()
  async getUsersTypeAdmin(@Context() context: IContext) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return await this.userService.getUsersTypeAdmin()
  }

  /** with pagination included */
  @Query()
  async usersWithPaginate(
    @Context() context: IContext,
    @Args('filterOptions') filterOptions: InputOptionsQueryUser = {},
    @Args('gridOptions') gridOptions?: GridOption,
  ) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return this.userService.usersWithPaginate({
      filterOptions,
      gridOptions,
    })
  }

  @Query()
  async searchUser(@Args() args, @Context() context: IContext) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return await this.userService.searchUser(args)
  }

  @Query()
  async searchUserNotHaveStaff(@Args() args, @Context() context: IContext) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return await this.userService.searchUserNotHaveStaff(args)
  }

  @Mutation()
  async register(
    @Args('input') input: NewUserInfo,
    @Args('isAutoActive') isAutoActive: boolean,
    @Args('isResponseCookie') isResponseCookie: boolean,
    @Args('language') language: string,
    @Context() context: IContext,
  ): Promise<User> {
    const result = await this.userService.registerUser(
      input,
      context,
      isAutoActive,
      isResponseCookie,
    )

    // create customer for user
    if (result) {
      const createdBy: UserSlim = {
        _id: result._id,
        username: result.username,
      }
      await this.serviceManager.get(CustomerService).createCustomer({
        user_Id: result._id,
        email: result.email,
        fullName: result.displayName,
        unsignedFullName: StringFactory.formatToUnsigned(result.displayName),
        createdBy,
      })
    }

    if (!result?.isActive) {
      await this.serviceManager
        .get(VerifyTokenService)
        .sendVerifyMail(result?.username, language)
    }

    return result
  }

  @Mutation()
  async createUser(
    @Args('input') input: NewUserInfo,
    @Args('language') language: string,
    @Context() context: IContext,
  ): Promise<User> {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    const result = await this.userService.createUser(input)

    // create customer for user
    if (result) {
      const createdBy: UserSlim = {
        _id: result._id,
        username: result.username,
      }
      await this.serviceManager.get(CustomerService).createCustomer({
        user_Id: result._id,
        email: result.email,
        fullName: result.displayName,
        unsignedFullName: StringFactory.formatToUnsigned(result.displayName),
        createdBy,
      })
    }

    if (!result?.isActive) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const sendVerifyMail = await this.serviceManager
        .get(VerifyTokenService)
        .sendVerifyMail(result?.username, language)
    }

    return result
  }

  @Mutation()
  async createUserTypeAdmin(
    @Args('input') input: NewUserInfo,
    @Args('language') language: string,
    @Context() context: IContext,
  ): Promise<User> {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return await this.userService.createUserTypeAdmin(input, context)
  }

  @Mutation()
  async updateUserOverride(
    @Args('input') input: NeedOverrideInfo,
    @Args('idUser') idUser: string,
    @Context() context: IContext,
  ) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    const result = this.userService.updateUserOverride(input, idUser)
    return result
  }

  @Mutation()
  async updateStatusUsers(
    @Args('_ids') _ids: string[],
    @Args('oldStatus') oldStatus: EnumStatusAccount,
    @Args('newStatus') newStatus: EnumStatusAccount,
    @Context() context: IContext,
  ): Promise<boolean> {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    const isUpdated = await this.userService.updateStatusUsers(
      _ids,
      oldStatus,
      newStatus,
      context,
    )
    return isUpdated
  }

  @Mutation()
  async changePassword(
    @Args('input') input: ChangePasswordInput,
    @Context() context: IContext,
  ) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    const isDeleted = await this.userService.changePassword(
      input,
      currentUserId,
      context,
    )
    if (!isDeleted) throw new GQLUserWasDeleted()
    return isDeleted
  }

  @Mutation()
  async forgotPassword(
    @Args('Email') Email: string,
    @Args('language') language: string,
  ): Promise<boolean> {
    let foundUser
    try {
      foundUser = await this.userService.findUser({ email: Email })
    } catch (error) {
      throw new UserNotFoundError()
    }

    if (!foundUser) throw new UserNotFoundError()

    const findContentHomPage =
      await this.contentHomePageService.findOneContentHomePage(language)

    const User_Id = foundUser._id

    const token = await this.authService.signTokenResetPassword(User_Id)
    const expiresMore10Minutes = +new Date() + 1000 * 60 * 10

    const newInputCreateActivationToken: InputCreateActivationToken = {
      token,
      User_Id,
      expiresAt: expiresMore10Minutes,
    }

    let resultSendMail = {}

    // send link renew password to mail
    try {
      const defaultDomainWeb = process.env.CLIENT_URI

      const subjectVi = `Đặt lại mật khẩu - ${
        findContentHomPage?.SEOTitle || 'pharmacy'
      }`
      const subjectEn = `Reset Password - ${
        findContentHomPage?.SEOTitle || 'pharmacy'
      }`

      const htmlVi = `<b>Bấm vào đây để làm mới mật khẩu</b>
      <a target="_blank" href="${defaultDomainWeb}/renew-password/${token}">
        Làm mới mật khẩu
      </a>`
      const htmlEn = `<b>Click here to refresh password</b>
      <a target="_blank" href="${defaultDomainWeb}/renew-password/${token}">
      Refresh password
      </a>`

      const subjectText = language === 'en' ? subjectEn : subjectVi
      const htmlBody = language === 'en' ? htmlEn : htmlVi

      resultSendMail = await sendMail(
        findContentHomPage.SEOTitle,
        Email,
        subjectText,
        htmlBody,
      )
    } catch {
      throw new GQLCustomizeError()
    }

    // create new token
    await this.activationTokenHashService.createActivationTokenHash(
      newInputCreateActivationToken,
    )

    return !!resultSendMail
  }

  @Mutation()
  async renewPassword(
    @Args('newPassword') newPassword: string,
    @Args('token') token: string,
    @Context() context: IContext,
  ): Promise<boolean> {
    if (!token) throw new GQLTokenIsInvalid()
    if (!newPassword) throw new GQLInputNewPasswordError()

    const foundActivationToken =
      await this.activationTokenHashService.findActivationTokenHashMatchAny([
        { token },
        { expiresAt: { $lte: +new Date() } },
      ])

    if (!foundActivationToken) throw new GQLTokenIsInvalid()

    let payload: JWTTokenPayload

    try {
      payload = await this.authService.verifyToken(token)
    } catch (err) {
      if (err && err.message === 'jwt expired') {
        // Delete activation token hash same time throw err
        await this.activationTokenHashService.deleteActivationTokenHash(token)
        throw new GQLTokenIsExpired()
      }
    }

    if (!payload?.User_Id) throw new GQLTokenIsInvalid()

    const foundUser = await this.userService.findUser({
      _id: payload?.User_Id,
    })
    if (!foundUser) throw new UserNotFoundError()

    // Delete activation token hash
    await this.activationTokenHashService.deleteActivationTokenHash(token)

    // Renew password
    const resultUpdatedUserPw = await this.userService.updateUserPassword(
      newPassword,
      payload?.User_Id,
      context,
    )

    return resultUpdatedUserPw
  }

  @ResolveField('customer')
  async fieldCustomer(
    @Parent()
    user: LeanDocument<UserDocument>,
    @Context() context: IContext,
  ) {
    if (hasOwnProperty(user, 'customer')) return user['customer']

    const result = await context.loaderManager
      .getLoader('CustomerByUserIdLoader')
      .load(user._id)

    return result
  }

  @Mutation()
  async deleteUsers(@Args('idUsers') idUsers: string[]) {
    const isDeleted = await this.userService.deleteUsers(idUsers)
    if (!isDeleted) throw new GQLUserWasDeleted()
    return isDeleted
  }

  @Mutation()
  async updateUsersOverride(
    @Args('input') input: NeedOverrideInfo,
    @Args('idUsers') idUsers: string[],
    @Context() context: IContext,
  ) {
    const result = await this.userService.updateUsers(input, idUsers, context)
    if (!result) {
      throw new UserNotFoundError()
    }
    return result
  }

  @Mutation()
  async updateUser(
    @Args('input') input: NeedUpdateInfo,
    @Args('idUser') idUser: string,
    @Context() context: IContext,
  ) {
    const result = await this.userService.updateUser(input, idUser, context)

    if (!result) {
      throw new UserNotFoundError()
    }
    return result
  }
}
