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
        const subjectTextVi = `Ch??o m???ng b???n ?????n v???i ${
          foundContentHomePage?.SEOTitle || 'pharmacy'
        } - K??ch ho???t t??i kho???n ng?????i d??ng`
        const subjectTextEn = `Welcome to ${
          foundContentHomePage?.SEOTitle || 'pharmacy'
        } - Activate user account`
        const linkActive = `${domain}/activate/${token}`
        const htmlBodyVi = `
      <b>Xin ch??o ${emailReceive},</b><br><br>
      T??i kho???n ng?????i d??ng c???a b???n v???i ?????a ch??? e-mail ${emailReceive} ???? ???????c t???o.<br><br>
      Vui l??ng b???m v??o li??n k???t b??n d?????i ????? k??ch ho???t t??i kho???n c???a b???n.<br>
      <a href="${linkActive}" target="_blank">Nh???p v??o ????y</a>.<br><br>
      B???n s??? c?? th??? thay ?????i c??i ?????t c???a m??nh (m???t kh???u, ng??n ng???, v.v.) sau khi t??i kho???n c???a b???n ???????c k??ch ho???t..<br><br><br>
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
