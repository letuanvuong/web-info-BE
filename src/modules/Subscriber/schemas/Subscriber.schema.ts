import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { DATABASE_COLLECTION_NAME } from 'src/constant'
import { IDFactory } from 'src/helper'
import { UserSlimSchema } from 'src/modules/user/schemas/UserSlim.schema'
import { EnumSubscriberStatus, UserSlim } from 'src/schema'

export type SubscriberDocument = SubscriberEntity & Document

@Schema({
  collection: DATABASE_COLLECTION_NAME.SUBSCRIBER,
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true },
})
export class SubscriberEntity {
  @Prop({
    default: IDFactory.getUUIDGenerator(),
    required: true,
  })
  _id: string

  @Prop()
  email: string

  @Prop()
  status: EnumSubscriberStatus

  @Prop({ required: true, default: Date.now })
  subscribeAt: number

  @Prop({ required: true, default: Date.now })
  createdAt: number

  @Prop({ required: false, type: UserSlimSchema })
  createdBy: UserSlim

  @Prop()
  updatedAt: number

  @Prop({ type: UserSlimSchema })
  updatedBy: UserSlim

  constructor(props: Partial<SubscriberEntity>) {
    Object.assign(this, props)
  }
}

export const SubscriberSchema = SchemaFactory.createForClass(SubscriberEntity)
