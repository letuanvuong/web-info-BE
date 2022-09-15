import { OAuth2Client } from 'google-auth-library'
import * as nodemailer from 'nodemailer'
import { v1 } from 'uuid'

import { UserEntity } from './modules/user/schemas/User.schema'

interface IDType {
  type: 'uuid' | 'conferenceCode'
}

export function pad(number: number, length: number) {
  let str = '' + number
  while (str.length < length) {
    str = '0' + str
  }

  return str
}

function generateRandomString(length: number): string {
  let result = ''
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const charactersLength = characters.length
  for (let i = 0; i < length; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}
export class IDFactory {
  public static createID(type?: IDType) {
    if (type?.type === 'uuid') return v1()
    if (type?.type === 'conferenceCode') return generateRandomString(6)
    // Fallback
    return v1()
  }

  public static generateID() {
    return v1()
  }

  public static getConferenceCodeGenerator() {
    return () => generateRandomString(6)
  }

  public static getUUIDGenerator() {
    return v1
  }
}

export class StringFactory {
  public static formatToUnsigned(string: string) {
    if (!string) return ''
    return (
      string
        .replace(/[àáâãăạảấầẩẫậắằẳẵặ]/g, 'a')
        .replace(/[ÀÁÂÃĂẠẢẤẦẨẪẬẮẰẲẴẶ]/g, 'A')
        .replace(/[òóôõơọỏốồổỗộớờởỡợ]/g, 'o')
        .replace(/[ÒÓÔÕƠỌỎỐỒỔỖỘỚỜỞỠỢ]/g, 'O')
        .replace(/[èéêẹẻẽếềểễệ]/g, 'e')
        .replace(/[ÈÉÊẸẺẼẾỀỂỄỆ]/g, 'E')
        .replace(/[ùúũưụủứừửữự]/g, 'u')
        .replace(/[ÙÚŨƯỤỦỨỪỬỮỰ]/g, 'U')
        .replace(/[ìíĩỉị]/g, 'i')
        .replace(/[ÌÍĨỈỊ]/g, 'I')
        .replace(/[ýỳỵỷỹ]/g, 'y')
        .replace(/[ÝỲỴỶỸ]/g, 'Y')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, '')
        .replace(/\u02C6|\u0306|\u031B/g, '')
        // .replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    )
  }

  public static formatToSlug(string: string) {
    if (!string) return ''
    return string.replace(/\s+/g, '-').trim()
  }

  public static trimString(string: string) {
    if (!string) return ''
    return string.replace(/\s+/g, ' ').trim()
  }

  public static removeSpecialCharacters(string: string) {
    if (!string) return ''
    return string.replace(/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/g, '').trim()
  }
}

/**
 * get exact cookie from headers.cookie
 * @param cookiesSrc "access-token=123123; current-node=bv; current-profile=admin"
 */
export const getCookie = (cookiesSrc: string, cookieName: string) => {
  const name = cookieName + '='
  if (cookiesSrc) {
    const listCookie = cookiesSrc.split(';')
    for (let eachCookie of listCookie) {
      eachCookie = eachCookie.trim()
      if (eachCookie.indexOf(name) === 0) {
        return eachCookie.substring(name.length, eachCookie.length)
      }
    }
  }
  return ''
}

export const removeVietnameseTones = (str) => {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i')
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
  str = str.replace(/đ/g, 'd')
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A')
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E')
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I')
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O')
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U')
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y')
  str = str.replace(/Đ/g, 'D')
  // Some system encode vietnamese combining accent as individual utf-8 characters
  // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, '') // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, '') // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
  // Remove extra spaces
  // Bỏ các khoảng trắng liền nhau
  str = str.replace(/ + /g, ' ')
  str = str.trim()
  // Remove punctuations
  // Bỏ dấu câu, kí tự đặc biệt
  str = str.replace(
    /!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
    ' ',
  )
  return str
}

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
  }[Keys]

/**
 * tạo obj con bằng cách chỉ giữ các field thỏa type điều kiện
 * @see https://www.piotrl.net/typescript-condition-subset-types/
 * @ex SubType<OneClass, (_: any) => any> giữ lại các field type function
 */
export type SubType<Base, Condition> = Pick<
  Base,
  {
    [Key in keyof Base]: Base[Key] extends Condition ? Key : never
  }[keyof Base]
>

export type ContextProps = Request & { currentUser: UserEntity }

/**
 * Returns boolean by sendMail.
 *
 * @remarks
 * This method is part of the {@link utils/sendMail}.
 *
 * @param email - 1st input number
 * @param subjectText - The third input number
 * @param htmlBody - The fourth input number
 * @returns The boolean mean of sendMail success or faild
 *
 * @beta
 */
export const sendMail = async (
  senderAddress = 'Sunny',
  emailReceive,
  subjectText,
  htmlBody,
) => {
  const emailSend = process.env.GOOGLE_MAILER_USER
  const myOAuth2Client = new OAuth2Client(
    process.env.GOOGLE_MAILER_CLIENT_ID,
    process.env.GOOGLE_MAILER_CLIENT_SECRET,
  )
  myOAuth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_MAILER_REFRESH_TOKEN,
  })

  const myAccessTokenObject = await myOAuth2Client.getAccessToken()
  const myAccessToken = myAccessTokenObject?.token

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: emailSend,
      clientId: process.env.GOOGLE_MAILER_CLIENT_ID,
      clientSecret: process.env.GOOGLE_MAILER_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_MAILER_REFRESH_TOKEN,
      accessToken: myAccessToken,
    },
  })
  // send mail with defined transport object
  const mailOptions = {
    from: `"${senderAddress}" < ${emailSend} >`, // sender address
    to: emailReceive.toLowerCase(), // list of receivers. example : "email1@example.com, email2@example.com"
    subject: subjectText, // Subject line
    html: htmlBody, // html body
  }
  const infor = await transporter.sendMail(mailOptions)
  return !!infor
}

export const validateMail = async (email) => {
  const email_regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/g
  return !!email_regex.test(email.toLowerCase())
}

export function generateRandomTokenVerifyMail(): string {
  return generateRandomString(40)
}

export function getTimeAfterHour(hour: number) {
  return new Date().getTime() + hour * 3600 * 1000
}

export function generateSlug(name: string) {
  const handleString: any = removeVietnameseTones(name.trim()).toLowerCase()
  const slug = handleString.replace(/ /g, '-')
  return slug
}

export function generateSlugRandom(name: string) {
  const handleString: any = removeVietnameseTones(name.trim()).toLowerCase()
  const randomEndSlug = generateRandomString(10)
  const slug = handleString.replace(/ /g, '-') + '-' + randomEndSlug
  return slug
}

/**
 * kiểm tra thuộc tính có trong obj hay ko
 * @see https://fettblog.eu/typescript-hasownproperty/
 */
export function hasOwnProperty<
  // eslint-disable-next-line @typescript-eslint/ban-types
  X extends {},
  Y extends PropertyKey,
>(obj: X, prop: Y): obj is X & Record<Y, unknown> {
  return obj.hasOwnProperty(prop)
}
