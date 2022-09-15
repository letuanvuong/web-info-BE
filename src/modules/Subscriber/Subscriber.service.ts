import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import * as moment from 'moment'
import { Model } from 'mongoose'
import {
  EmailPagination,
  EmailPaginationTotal,
  EnumSubscriberStatus,
  FilterEmailInput,
  SearchEmailInput,
  SortEmailInput,
} from 'src/schema'
import { Telegraf } from 'telegraf'

import { ServiceManager } from '../base-modules/service-manager/service-manager'
import { sendMail } from './../../helper'
import { EmailInput } from './../../schema'
import {
  ContentHomePageDocument,
  ContentHomePageEntity,
} from './../ContentHomePage/schemas/ContentHomePage.schema'
import {
  SubscriberDocument,
  SubscriberEntity,
} from './schemas/Subscriber.schema'

@Injectable()
export class SubscriberService {
  constructor(
    @InjectModel(SubscriberEntity.name)
    public subscriberModel: Model<SubscriberDocument>,
    private readonly serviceManager: ServiceManager,
    @InjectModel(ContentHomePageEntity.name)
    private readonly ContentHomePage: Model<ContentHomePageDocument>,
  ) {}

  async renderQueryPagination(
    filter: [FilterEmailInput],
    search: [SearchEmailInput],
  ) {
    const skip = false

    // filter
    const filterObject = {}
    if (filter) {
      for (const e of filter) {
        filterObject[e?.fieldFilter] = { $in: e?.values }
      }
    }
    // search
    let searchArr =
      !search || search.length < 1
        ? [{}]
        : search
            .filter((s) => s.fieldSearch && s.textSearch)
            .map((s) => {
              if (!s?.fieldSearch || !s?.textSearch) {
                return null
              }

              if (['createdAt']?.includes(s?.fieldSearch)) {
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

    if (searchArr.length < 1) {
      searchArr = [{}]
    }

    return skip
      ? { _id: { $in: [] } }
      : Object.assign(
          {},
          {
            $and: searchArr,
          },
          filterObject,
          {
            status: { $ne: EnumSubscriberStatus.Canceled },
          },
        )
  }

  async subscribeEmail(
    subscriberInput: Partial<EmailInput>,
  ): Promise<SubscriberDocument> {
    try {
      const sendTelegram = async () => {
        const isNotSend = process.env.NOTIFICATION_TELEGRAM !== 'ON'
        if (!isNotSend) {
          const bot = new Telegraf(process.env.BOT_TELE_TOKEN)
          const roomId = process.env.CHAT_ID_TELEGRAM
          const day = moment(Date.now()).locale(subscriberInput.language)
          const contentEn = `User ${
            subscriberInput.email
          } subscribed to receive news on ${day.format('MMMM Do YYYY')}!`
          const contentVi = `Người dùng ${
            subscriberInput.email
          } đã đăng ký theo dõi tin tức vào ngày ${day.format('DD/MM/YYYY')}!`
          const content =
            subscriberInput.language === 'en' ? contentEn : contentVi
          await bot.telegram.sendMessage(roomId, content)
        }
      }

      const sendEmailSubcriber = async () => {
        const foundContentHomePage = await this.ContentHomePage.findOne({
          language: subscriberInput.language,
        })
        const isNotSend = process.env.NOTIFICATION_MAIL !== 'ON'
        if (!isNotSend) {
          const subjectVi = `Bạn đã đăng ký nhận tin tức mới nhất từ ${foundContentHomePage?.SEOTitle}`
          const subjectEn = `You have subscribed to receive the latest news from ${foundContentHomePage?.SEOTitle}`

          const htmlVi = `<b>Xin chào ${subscriberInput.email}</b>,<br><br>
          Tài khoản người dùng của bạn đã đăng ký thành công nhận tin tức mới nhất từ ${foundContentHomePage?.SEOTitle}.<br><br>
          <b>Đội ngũ ${foundContentHomePage?.SEOTitle} cảm ơn bạn đã quan tâm.</b>  
          </b>`
          const htmlEn = `<b>Hello</b> ${subscriberInput.email},<br><br>
          Your user account has been successfully registered to receive the latest news from ${foundContentHomePage?.SEOTitle}.<br><br>
          <b>The ${foundContentHomePage?.SEOTitle}'s Team thank you for your interest.</b>  
          </b>`

          const subjectText =
            subscriberInput.language === 'en' ? subjectEn : subjectVi
          const htmlBody = subscriberInput.language === 'en' ? htmlEn : htmlVi

          await sendMail(
            foundContentHomePage?.SEOTitle,
            subscriberInput.email,
            subjectText,
            htmlBody,
          )
        }
      }

      const newSubscriber = new SubscriberEntity(subscriberInput)
      const emailIsUse = await this.subscriberModel.findOne({
        email: subscriberInput.email,
        status: EnumSubscriberStatus.OnSubscribe,
      })

      if (emailIsUse) {
        await this.subscriberModel.findOneAndUpdate(
          { email: subscriberInput.email },
          {
            subscribeAt: Date.now(),
            updatedAt: Date.now(),
          },
        )
        await sendTelegram()
        await sendEmailSubcriber()
        return emailIsUse
      }

      const rawResult = await this.subscriberModel.create({
        status: EnumSubscriberStatus.OnSubscribe,
        ...newSubscriber,
      })
      await sendTelegram()
      await sendEmailSubcriber()
      return rawResult
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err)
    }
  }

  async unSubscribeEmail(_id: string): Promise<SubscriberDocument> {
    const result = await this.subscriberModel.findOneAndUpdate(
      { _id },
      { status: EnumSubscriberStatus.Canceled, updatedAt: Date.now() },
    )
    if (result) return result
    return null
  }

  async getAllEmailOnSubs() {
    const resutlt = await this.subscriberModel.find({
      status: EnumSubscriberStatus.OnSubscribe,
    })
    if (resutlt) return resutlt
    return null
  }

  async getEmailOnSubsPagination(
    page: number,
    limit: number,
    search: [SearchEmailInput],
    filter: [FilterEmailInput],
    sort: [SortEmailInput],
  ): Promise<EmailPagination> {
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
          { $sort: sort ? sortData : { createdAt: -1 } },
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
        const data = await this.subscriberModel.aggregate(pipeline)
        let cardinalNumber = limit ? (page - 1) * limit : 0
        const result = data?.map((page) => {
          const url = `${process.env.CLIENT_URI}/pages/${page.slug}`
          cardinalNumber++
          return {
            url,
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

  async getEmailOnSubsPaginationTotal(
    page: number,
    limit: number,
    search: [SearchEmailInput],
    filter: [FilterEmailInput],
  ): Promise<EmailPaginationTotal> {
    return new Promise(async (rel, rej) => {
      try {
        const query: any = await this.renderQueryPagination(filter, search)
        const total = await this.subscriberModel.find(query).countDocuments()
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
