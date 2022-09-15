import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { ApolloError } from 'apollo-server-express'
import * as moment from 'moment'
import { FilterQuery, Model } from 'mongoose'
import { DATABASE_COLLECTION_NAME } from 'src/constant'
import { removeVietnameseTones } from 'src/helper'
import {
  EnumMailContactStatus,
  FilterMailContactInput,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  InputMailContact,
  MailContactPagination,
  MailContactPaginationTotal,
  SearchMailContactInput,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Service,
  SortMailContactInput,
} from 'src/schema'
import { Telegraf } from 'telegraf'

import { ServiceManager } from '../base-modules/service-manager/service-manager'
import {
  ServiceDocument,
  ServiceEntity,
} from '../Service/schemas/Service.schema'
import { sendMail } from './../../helper'
import {
  ContentHomePageDocument,
  ContentHomePageEntity,
} from './../ContentHomePage/schemas/ContentHomePage.schema'
import {
  MailContactDocument,
  MailContactEntity,
} from './schemas/MailContact.schema'

@Injectable()
export class MailContactService {
  constructor(
    @InjectModel(MailContactEntity.name)
    public mailContactModel: Model<MailContactDocument>,
    @InjectModel(ServiceEntity.name)
    public serviceModel: Model<ServiceDocument>,
    private readonly serviceManager: ServiceManager,
    @InjectModel(ContentHomePageEntity.name)
    public readonly ContentHomePage: Model<ContentHomePageDocument>,
  ) {}

  async renderQueryPagination(
    filter: [FilterMailContactInput],
    search: [SearchMailContactInput],
  ) {
    const skip = false
    const fieldsSearch = [
      'email',
      'phoneNumber',
      'fullName',
      'subject',
      'service.title',
      'topic',
      'message',
      'createdAt',
    ]
    const fieldsForeignSearch = ['service.title']

    const filterObject = {}
    filter?.forEach((e) => {
      filterObject[e?.fieldFilter] = { $in: e?.values }
    })
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
            })
            .map((s) => {
              if (!s?.fieldSearch || !s?.textSearch) {
                return null
              }

              if (fieldsForeignSearch.includes(s?.fieldSearch)) {
                searchForeignKey[s?.fieldSearch] = s.textSearch
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

    if (or.length < 1) {
      or = [{}]
    }

    for await (const fieldKey of Object.keys(searchForeignKey)) {
      switch (fieldKey) {
        case 'service.title':
          const id_Service = await this.search({
            filter: {
              title: {
                $regex: new RegExp(
                  removeVietnameseTones(searchForeignKey[fieldKey])?.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    '\\$&',
                  ),
                  'siu',
                ),
              },
            },
            select: { idService: 1 },
            getID: true,
          })

          if (id_Service.length < 1) return { _id: { $in: [] } }
          if (id_Service.length > 0) {
            foreignKeyOr.push({
              idService: { $in: id_Service },
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
            status: { $ne: EnumMailContactStatus.Deleted },
            $and: or,
            ...foreignKey,
          },
          foreignKeyOr.length > 0 ? { $or: [...foreignKeyOr] } : {},
          filterObject,
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

  async getMailContacts() {
    const resutlt = await this.mailContactModel.find({
      status: EnumMailContactStatus.NotRead,
    })
    if (resutlt) return resutlt
    return null
  }

  // async createMailContact(
  //   newInput: InputMailContact,
  // ): Promise<MailContactDocument | ApolloError> {
  //   const mailContactEntity = new this.mailContactModel({ ...newInput })
  //   const createdContentContact = await mailContactEntity.save()
  //   return createdContentContact
  // }

  async createMailContact(
    mailContactInput: Partial<InputMailContact>,
  ): Promise<MailContactDocument | ApolloError> {
    const sendTelegram = async () => {
      const isNotSend = process.env.NOTIFICATION_TELEGRAM !== 'ON'
      if (!isNotSend) {
        const bot = new Telegraf(process.env.BOT_TELE_TOKEN)
        const roomId = process.env.CHAT_ID_TELEGRAM
        const day = moment(Date.now()).locale(mailContactInput.language)
        const contentEn = `Customer ${mailContactInput.fullName} (${
          mailContactInput.email
        }) has contacted on ${day.format('MMMM Do YYYY')}!`
        const contentVi = `Khách hàng ${mailContactInput.fullName} (${
          mailContactInput.email
        }) đã liên hệ vào ngày ${day.format('DD/MM/YYYY')}!`
        const content =
          mailContactInput.language === 'en' ? contentEn : contentVi
        await bot.telegram.sendMessage(roomId, content)
      }
    }
    const sendEmailContact = async () => {
      const foundContentHomePage = await this.ContentHomePage.findOne({
        language: mailContactInput.language,
      }).lean()
      const isNotSend = process.env.NOTIFICATION_MAIL !== 'ON'
      if (!isNotSend) {
        const subjectVi = `Cảm ơn bạn đã liên hệ với chúng tôi`
        const subjectEn = `Thank you for contacting us`

        const htmlVi = `<b>Xin chào ${mailContactInput.email}</b>,<br><br>
          Chúng tôi đã nhận được thông tin liên hệ của bạn, chúng tôi sẽ phản hồi cho bạn trong thời gian sớm nhất!.<br><br>
          <b>Đội ngũ ${foundContentHomePage?.SEOTitle} cảm ơn bạn đã quan tâm.</b>  
          </b>`
        const htmlEn = `<b>Hello ${mailContactInput.email}</b>,<br><br>
          We have received your contact information, we will respond to you as soon as possible!.<br><br>
          <b>The ${foundContentHomePage?.SEOTitle}'s Team thank you for your interest.</b>  
          </b>`

        const subjectText =
          mailContactInput.language === 'en' ? subjectEn : subjectVi
        const htmlBody = mailContactInput.language === 'en' ? htmlEn : htmlVi

        await sendMail(
          foundContentHomePage?.SEOTitle,
          mailContactInput.email,
          subjectText,
          htmlBody,
        )
      }
    }

    const newMailContact = new MailContactEntity(mailContactInput)

    const mailContactIsUse = await this.mailContactModel.findOne({
      email: mailContactInput.email,
      phoneNumber: mailContactInput.phoneNumber,
      fullName: mailContactInput.fullName,
      subject: mailContactInput.subject,
      idService: mailContactInput.idService,
      topic: mailContactInput.topic,
      message: mailContactInput.message,
      status: EnumMailContactStatus.NotRead,
    })

    if (mailContactIsUse) {
      await this.mailContactModel.findOneAndUpdate(
        {
          email: mailContactInput.email,
          phoneNumber: mailContactInput.phoneNumber,
          fullName: mailContactInput.fullName,
          subject: mailContactInput.subject,
          idService: mailContactInput.idService,
          topic: mailContactInput.topic,
          message: mailContactInput.message,
        },
        {
          subscribeAt: Date.now(),
          updatedAt: Date.now(),
        },
      )
      await sendEmailContact()
      await sendTelegram()
      return
    }

    const rawResult = await this.mailContactModel.create({
      status: EnumMailContactStatus.NotRead,
      ...newMailContact,
    })
    await sendEmailContact()
    await sendTelegram()
    return rawResult
  }

  async deleteMailContact(_id: string): Promise<MailContactDocument> {
    const result = await this.mailContactModel.findOneAndUpdate(
      { _id },
      { status: EnumMailContactStatus.Deleted, updatedAt: Date.now() },
    )
    if (result) return result
    return null
  }

  async getMailContactPagination(
    page: number,
    limit: number,
    search: [SearchMailContactInput],
    filter: [FilterMailContactInput],
    sort: [SortMailContactInput],
  ): Promise<MailContactPagination> {
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
          {
            $lookup: {
              from: DATABASE_COLLECTION_NAME.SERVICE,
              localField: 'idService',
              foreignField: '_id',
              as: 'service',
            },
          },
          { $sort: sort ? sortData : { createdAt: -1 } },
          {
            $project: {
              _id: 1,
              email: 1,
              phoneNumber: 1,
              fullName: 1,
              subject: 1,
              service: { $first: '$service' },
              topic: 1,
              message: 1,
              createdAt: 1,
            },
          },
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

        const data = await this.mailContactModel.aggregate(pipeline)

        let cardinalNumber = limit ? (page - 1) * limit : 0
        const result = data?.map((page) => {
          cardinalNumber++
          return {
            cardinalNumber,
            ...page,
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

  async getMailContactPaginationTotal(
    page: number,
    limit: number,
    search: [SearchMailContactInput],
    filter: [FilterMailContactInput],
  ): Promise<MailContactPaginationTotal> {
    return new Promise(async (rel, rej) => {
      try {
        const query: any = await this.renderQueryPagination(filter, search)
        const total = await this.mailContactModel.find(query).countDocuments()
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
}
