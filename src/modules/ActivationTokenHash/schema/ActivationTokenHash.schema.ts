import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { DATABASE_COLLECTION_NAME } from 'src/constant'
import { IDFactory } from 'src/helper'

export type ActivationTokenHashDocument = ActivationTokenHashEntity & Document

@Schema({
  collection: DATABASE_COLLECTION_NAME.ACTIVATION_TOKEN_HASH,
})
export class ActivationTokenHashEntity {
  @Prop({
    default: IDFactory.getUUIDGenerator(),
    required: true,
  })
  _id: string

  @Prop()
  User_Id: string

  @Prop()
  token: string

  @Prop()
  expiresAt: number

  @Prop({ default: Date.now })
  createdAt: number

  constructor(input: Partial<ActivationTokenHashEntity>) {
    Object.assign(this, input)
    this.createdAt = +new Date()
  }
}

export const ActivationTokenHashSchema = SchemaFactory.createForClass(
  ActivationTokenHashEntity,
)
