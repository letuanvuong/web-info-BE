import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { DATABASE_COLLECTION_NAME } from 'src/constant'
import { IDFactory } from 'src/helper'
import { EcomSetting, UserSlim } from 'src/schema'

export type SettingDocument = Setting & Document

@Schema({ collection: DATABASE_COLLECTION_NAME.SETTING })
export class Setting {
  @Prop({
    default: IDFactory.createID(),
    required: true,
  })
  _id: string

  @Prop()
  ecommerce: EcomSetting

  @Prop({ required: true, default: Date.now })
  createdAt: number

  @Prop()
  createdBy: UserSlim

  @Prop()
  updatedAt: number

  @Prop()
  updatedBy: UserSlim

  constructor(props: Partial<Setting>) {
    Object.assign(this, props)
  }
}

export const SettingSchema = SchemaFactory.createForClass(Setting)
