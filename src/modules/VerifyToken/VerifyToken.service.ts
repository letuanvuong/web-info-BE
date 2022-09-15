import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { EnumTypeToken } from 'src/schema'

import {
  generateRandomTokenVerifyMail,
  getTimeAfterHour,
  sendMail,
} from '../../helper'
import { ConfigurationService } from '../base-modules/configuration/config.service'
import { MyContext } from '../base-modules/my-context/my-context'
import { ServiceManager } from '../base-modules/service-manager/service-manager'
import {
  ContentHomePageDocument,
  ContentHomePageEntity,
} from '../ContentHomePage/schemas/ContentHomePage.schema'
import { UserDaXacNhanError, UserNotFoundError } from '../user/User.error'
import { UserService } from '../user/User.service'
import {
  VerifyTokenDocument,
  VerifyTokenEntity,
} from './schemas/VerifyToken.schema'
import {
  SendMailError,
  TokenExpiredError,
  TokenNotFoundError,
} from './VerifyToken.error'

@Injectable()
export class VerifyTokenService {
  constructor(
    @InjectModel(VerifyTokenEntity.name)
    private verifyTokenModel: Model<VerifyTokenDocument>,
    private readonly myContext: MyContext,
    private readonly serviceManager: ServiceManager,
    private readonly configSrv: ConfigurationService,
    @InjectModel(ContentHomePageEntity.name)
    private contentHomePageModel: Model<ContentHomePageDocument>,
  ) {}

  async sendVerifyMail(email: string, language?: string): Promise<boolean> {
    const User = await this.serviceManager
      .get(UserService)
      .findUser({ username: email })
    if (!User) throw new UserNotFoundError()
    if (User?.isActive === true) {
      throw new UserDaXacNhanError()
    }
    const foundContentHomePage = await this.contentHomePageModel
      .findOne({
        language,
      })
      .lean()
    // write database
    const token = generateRandomTokenVerifyMail()

    const verifyTokenCreate = {
      Email: email,
      Token: token,
      User_Id: User._id,
      TypeToken: EnumTypeToken.EMAIL,
      used: false,
      isActive: true,
      createdAt: Date.now(),
      expiresAt: getTimeAfterHour(this.configSrv.getVerifyTokenExpires()),
    }
    const verifyToken = new this.verifyTokenModel(verifyTokenCreate)
    const result = await verifyToken.save()
    // send mail
    if (result) {
      try {
        const signatureMail = "The Sunny's Team" //DB
        const domain = process.env.CLIENT_URI //DB ENV

        const emailReceive = email
        const subjectTextVi = `Chào mừng bạn đến với ${
          foundContentHomePage?.SEOTitle || 'pharmacy'
        } - Kích hoạt tài khoản người dùng`
        const subjectTextEn = `Welcome to ${
          foundContentHomePage?.SEOTitle || 'pharmacy'
        } - Activate user account`
        const linkActive = `${domain}/activate/${token}`
        const htmlBodyVi = `
      <b>Xin chào ${emailReceive},</b><br><br>
      Tài khoản người dùng của bạn với địa chỉ e-mail ${emailReceive} đã được tạo.<br><br>
      Vui lòng bấm vào liên kết bên dưới để kích hoạt tài khoản của bạn.<br>
      <a href="${linkActive}" target="_blank">Nhấp vào đây</a>.<br><br>
      Bạn sẽ có thể thay đổi cài đặt của mình (mật khẩu, ngôn ngữ, v.v.) sau khi tài khoản của bạn được kích hoạt..<br><br><br>
      ${signatureMail ? `<b>${signatureMail}</b>` : ''}
    `
        const htmlBodyEn = `
      <b>Hi ${emailReceive},</b><br><br>
      Your user account with e-mail address ${emailReceive} has been created.<br><br>
      Please click on the link below to activate your account.<br>
      <a href="${linkActive}" target="_blank">Click here</a>.<br><br>
      You will be able to change your settings (password, language, etc) once your account is activated..<br><br><br>
      ${signatureMail ? `<b>${signatureMail}</b>` : ''}
    `
        const subjectText = language === 'en' ? subjectTextEn : subjectTextVi
        const htmlBody = language === 'en' ? htmlBodyEn : htmlBodyVi
        const resultSendMail = await sendMail(
          foundContentHomePage?.SEOTitle,
          emailReceive,
          subjectText,
          htmlBody,
        )

        if (resultSendMail) {
          return true
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log('error', error)
        throw new SendMailError()
      }
    }
    return false
  }

  async verifyAccount(token: string): Promise<boolean> {
    const Token = await this.verifyTokenModel.findOne({ Token: token })

    if (!Token) throw new TokenNotFoundError()

    if (Token?.expiresAt < new Date().getTime()) throw new TokenExpiredError()

    const user = await this.serviceManager
      .get(UserService)
      .findUser({ _id: Token?.User_Id })

    if (!user) throw new UserNotFoundError()

    if (user?.isActive === true) {
      throw new UserDaXacNhanError()
    }

    const isUpdateStatus = await this.serviceManager
      .get(UserService)
      .updateStatus({ User_Id: Token?.User_Id, isActive: true })

    return isUpdateStatus
  }
}
