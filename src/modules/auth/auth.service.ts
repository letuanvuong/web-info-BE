/* eslint-disable no-console */
import { Injectable, OnModuleInit } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { compare, hash } from 'bcrypt'
import { Request, Response } from 'express'
import { sign, verify } from 'jsonwebtoken'
import * as moment from 'moment'
import { EnumTypeAccount } from 'src/schema'

import { ConfigurationService } from '../base-modules/configuration/config.service'
import { MyContext } from '../base-modules/my-context/my-context'
import {
  GQLLoginError,
  GQLUserLockedError,
  GQLUserUnverifiedError,
} from '../user/User.error'
import { UserService } from '../user/User.service'
import { WebhookService } from '../webhook/webhook.service'
// import {
//   PermissionEntity,
//   PermissionDocument
// } from './schemas/permission.schema'
import { AlreadyLogoutError, InvalidInputError } from './auth.error'
import { JWTTokenPayload } from './auth.interface'

@Injectable()
export class AuthService implements OnModuleInit {
  private userService: UserService
  private webhookService: WebhookService

  constructor(
    private readonly configSrv: ConfigurationService,
    private moduleRef: ModuleRef,
    private myContext: MyContext,
  ) {}

  onModuleInit() {
    this.userService = this.moduleRef.get(UserService, {
      strict: false,
    })
    this.webhookService = this.moduleRef.get(WebhookService, { strict: false })
  }

  /**
   * @description
   * Verify whether the provided token is valid or not
   *
   * @returns - decrypted payload if the token is valid
   * @throws - Error if token is invalid
   */
  async verifyToken(token: string): Promise<JWTTokenPayload> {
    return new Promise((resolve, reject) => {
      verify(
        token,
        this.configSrv.getTokenEncryptSecret(),
        {},
        (err, payload: JWTTokenPayload) => {
          if (err) return reject(err)

          resolve(payload)
        },
      )
    })
  }

  // public async authenticateUser (token: string) {
  //     if (!token) throw new UnauthenticatedError('Authentication required')
  // }
  // public async findPermission() {}
  /**
   *
   * @param rawPassword raw input password
   * @returns hashed password
   */
  public hashPassword(rawPassword: string): Promise<string> {
    return hash(rawPassword, this.configSrv.getPasswordHashSalt())
  }

  public async compareWithHashPwd(rawPwd: string, hashedPwd: string) {
    return compare(rawPwd, hashedPwd)
  }

  public async signUserToken(userId: string): Promise<string> {
    return sign({ userId }, this.configSrv.getTokenEncryptSecret(), {
      expiresIn: '7d',
    })
  }

  public async signTokenResetPassword(User_Id: string): Promise<string> {
    return sign({ User_Id }, this.configSrv.getTokenEncryptSecret(), {
      expiresIn: '10m',
    })
  }

  public async login(options: {
    Username: string
    Email: string
    Password: string
    request?: any
    response?: Response
    host?: string
  }) {
    const { Username, Email, Password, request, host, response } = options
    if ((!Username && !Email) || (Username && Email)) {
      // TODO bring to decorator
      throw new InvalidInputError('Tên tài khoản hoặc email là bắt buộc')
    } else {
      const optionSendMessage = { request, Username, host }
      const foundUser = await this.userService.findUserMatchAny([
        { username: Username ? Username.toLowerCase() : '' },
      ])

      if (!foundUser) {
        console.log(`❌ ~ not found user with username ${Username}`)
        this.throwErrorWithMessage({
          error: new GQLLoginError(),
          ...optionSendMessage,
        })
      }
      if (foundUser.TypeAccount !== EnumTypeAccount.Customer) {
        console.log(`❌ ~ ${Username} is Admin cant login normal page`)
        this.throwErrorWithMessage({
          error: new GQLLoginError(),
          ...optionSendMessage,
        })
      }
      if (!foundUser.isActive) {
        console.log(`❌ ~ user ${Username} is not active`)
        this.throwErrorWithMessage({
          error: new GQLUserUnverifiedError(),
          ...optionSendMessage,
        })
      }
      if (foundUser.isLocked) {
        console.log(`❌ ~ user ${Username} is locked`)
        this.throwErrorWithMessage({
          error: new GQLUserLockedError(),
          ...optionSendMessage,
        })
      }

      const pwdMatched = await this.compareWithHashPwd(
        Password,
        foundUser.password,
      )
      if (!pwdMatched) {
        console.log(`❌ ~ user ${Username} use wrong password`)
        this.throwErrorWithMessage({
          error: new GQLLoginError(),
          ...optionSendMessage,
        })
      } else {
        const tokenSigned = await this.signUserToken(foundUser._id)

        // call telegram hook
        this.sendMessageTelegramLogin({
          loginState: 'succeed',
          ...optionSendMessage,
        })

        // set into cookie
        response.cookie(this.configSrv.getHeaderTokenKey(), tokenSigned, {
          httpOnly: true,
          expires: new Date(moment().add(7, 'day').valueOf()),
        })

        return {
          token: tokenSigned,
          userId: foundUser._id,
          Status: foundUser?.Status,
        }
      }
    }
  }

  public async loginAdmin(options: {
    Username: string
    Email: string
    Password: string
    request?: any
    response?: Response
    host?: string
  }) {
    const { Username, Email, Password, request, host, response } = options
    if ((!Username && !Email) || (Username && Email)) {
      // TODO bring to decorator
      throw new InvalidInputError('Tên tài khoản hoặc email là bắt buộc')
    } else {
      const optionSendMessage = { request, Username, host }
      const foundUser = await this.userService.userModel.findOne({
        isDeleted: { $ne: true },
        username: Username.toLowerCase(),
      })

      if (!foundUser) {
        console.log(`❌ ~ not found user with username ${Username}`)
        this.throwErrorWithMessage({
          error: new GQLLoginError(),
          ...optionSendMessage,
        })
      }
      if (foundUser.TypeAccount !== EnumTypeAccount.Admin) {
        console.log(`❌ ~ ${Username} is not Admin`)
        this.throwErrorWithMessage({
          error: new GQLLoginError(),
          ...optionSendMessage,
        })
      }
      if (foundUser.isLocked) {
        console.log(`❌ ~ user ${Username} is locked`)
        this.throwErrorWithMessage({
          error: new GQLUserLockedError(),
          ...optionSendMessage,
        })
      }

      const pwdMatched = await this.compareWithHashPwd(
        Password,
        foundUser.password,
      )
      if (!pwdMatched) {
        console.log(`❌ ~ user ${Username} use wrong password`)
        this.throwErrorWithMessage({
          error: new GQLLoginError(),
          ...optionSendMessage,
        })
      } else {
        const tokenSigned = await this.signUserToken(foundUser._id)

        // call telegram hook
        this.sendMessageTelegramLogin({
          loginState: 'succeed',
          ...optionSendMessage,
        })

        // set into cookie
        response.cookie(this.configSrv.getAdminTokenKey(), tokenSigned, {
          httpOnly: true,
          expires: new Date(moment().add(7, 'day').valueOf()),
        })

        return {
          token: tokenSigned,
          userId: foundUser._id,
          Status: foundUser?.Status,
        }
      }
    }
  }

  public logout(): boolean {
    const context = this.myContext.get()

    const tokenKey = this.configSrv.getHeaderTokenKey()

    if (!context.req.cookies[tokenKey]) {
      throw new AlreadyLogoutError()
    }

    this.myContext.get().res.cookie(tokenKey, '', {
      maxAge: -1,
    })
    return true
  }

  public logoutAdmin(): boolean {
    const context = this.myContext.get()
    const adminTokenKey = this.configSrv.getAdminTokenKey()
    if (!context.req.cookies[adminTokenKey]) {
      throw new AlreadyLogoutError()
    }

    this.myContext.get().res.cookie(adminTokenKey, '', {
      maxAge: -1,
    })
    return true
  }

  // public async savePermission(
  //   permission: PermissionEntity
  // ): Promise<PermissionEntity> {
  //   const newPermission = new this.permissionModel(permission)
  //   const rs = newPermission.save()
  //   return rs
  // }

  // public async savePermissions(
  //   permissions: PermissionEntity[]
  // ): Promise<PermissionEntity[]> {
  //   const rs = await this.permissionModel.insertMany(permissions)
  //   return rs?.length ? rs : []
  // }

  // public async findAllPermissions(): Promise<PermissionEntity[]> {
  //   const permissions = await this.permissionModel
  //     .find({ isActive: true })
  //     .lean()
  //   return permissions
  // }

  // public async deleteAllPermissions(): Promise<Boolean> {
  //   const rs = await this.permissionModel.deleteMany()
  //   return !!rs.ok
  // }

  private throwErrorWithMessage(options: {
    request?: Request
    host?: string
    Username: string
    error: any
  }) {
    const { request, host, Username, error } = options
    this.sendMessageTelegramLogin({
      request,
      host,
      Username,
      loginState: 'fail',
    })
    throw error
  }

  private sendMessageTelegramLogin(options: {
    request?: Request
    host?: string
    Username: string
    loginState: 'succeed' | 'fail'
  }) {
    const { request, host, Username, loginState } = options
    /** ex abc.xyz */
    const domain = host ? host : request?.headers?.host || ''
    /** ex [abc.xyz](abc.xyz): */
    const link = domain ? `[${domain}](${domain}): ` : ''
    const loginInfo = loginState === 'succeed' ? 'thành công' : 'thất bại'

    const content = `${link}tài khoản *${Username}*\nđăng nhập ${loginInfo}`
    this.webhookService.sendMessageTelegram(content)
  }
}
