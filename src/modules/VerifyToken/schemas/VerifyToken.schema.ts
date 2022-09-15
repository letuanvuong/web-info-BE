import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { DATABASE_COLLECTION_NAME } from 'src/constant'
import { IDFactory } from 'src/helper'
import { EnumTypeToken } from 'src/schema'

export type VerifyTokenDocument = VerifyTokenEntity & Document

@Schema({
  collection: DATABASE_COLLECTION_NAME.VERIFY_TOKEN,
  toJSON: { virtuals: true, getters: true }, // enable virtuals
  toObject: { virtuals: true, getters: true }, // enable virtuals
})
export class VerifyTokenEntity {
  @Prop({
    default: IDFactory.getUUIDGenerator(),
    required: true,
  })
  _id: string

  @Prop()
  Token: string

  @Prop()
  Email: string

  @Prop()
  Phone: string

  @Prop()
  User_Id: string

  @Prop()
  TypeToken: EnumTypeToken

  @Prop()
  used: boolean

  @Prop()
  isActive: boolean

  @Prop()
  isDeleted: boolean

  @Prop()
  createdAt: number

  @Prop()
  expiresAt: number

  constructor(props: Partial<VerifyTokenEntity>) {
    // TODO: declare init value
    Object.assign(this, props)
  }
}

export const VerifyTokenSchema = SchemaFactory.createForClass(VerifyTokenEntity)
