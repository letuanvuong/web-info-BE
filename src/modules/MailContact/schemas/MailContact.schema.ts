import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { DATABASE_COLLECTION_NAME } from 'src/constant'
import { IDFactory } from 'src/helper'
import { UserSlimSchema } from 'src/modules/user/schemas/UserSlim.schema'
import { EnumMailContactStatus, EnumTopicContact, UserSlim } from 'src/schema'

export type MailContactDocument = MailContactEntity & Document

@Schema({
  collection: DATABASE_COLLECTION_NAME.MAIL_CONTACT,
  toJSON: { virtuals: true, getters: true }, // enable virtuals
  toObject: { virtuals: true, getters: true }, // enable virtuals
})
export class MailContactEntity {
  @Prop({
    default: IDFactory.getUUIDGenerator(),
    required: true,
  })
  _id: string

  @Prop()
  email: string

  @Prop()
  phoneNumber: string

  @Prop()
  fullName: string

  @Prop()
  subject: string

  @Prop()
  idService: string

  @Prop({ type: EnumTopicContact })
  topic: EnumTopicContact

  @Prop()
  message: string

  @Prop({ type: EnumMailContactStatus, required: true, default: 'NotRead' })
  status: EnumMailContactStatus

  @Prop({ required: true, default: Date.now })
  createdAt: number

  @Prop({ type: UserSlimSchema })
  createdBy: UserSlim

  @Prop()
  updatedAt: number

  @Prop({ type: UserSlimSchema })
  updatedBy: UserSlim

  constructor(props: Partial<MailContactEntity>) {
    Object.assign(this, props)
  }
}

export const MailContactSchema = SchemaFactory.createForClass(MailContactEntity)
