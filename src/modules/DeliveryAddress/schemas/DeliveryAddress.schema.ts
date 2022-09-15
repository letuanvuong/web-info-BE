import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { DATABASE_COLLECTION_NAME } from 'src/constant'
import { IDFactory } from 'src/helper'
import { UserSlimEntity } from 'src/modules/user/schemas/UserSlim.schema'

export type DeliveryAddressDocument = DeliveryAddressEntity & Document

@Schema({
  collection: DATABASE_COLLECTION_NAME.DELIVERY_ADDRESSES,
  toJSON: { virtuals: true, getters: true }, // enable virtuals
  toObject: { virtuals: true, getters: true }, // enable virtuals
})
export class DeliveryAddressEntity {
  @Prop({
    default: IDFactory.getUUIDGenerator(),
    required: true,
  })
  _id: string

  @Prop({ required: true })
  idCustomer: string

  @Prop({ required: true })
  fullName: string

  @Prop()
  unsignedFullName: string

  @Prop()
  companyName: string

  @Prop({ required: true })
  phoneNumber: string

  @Prop({ required: true })
  detailAddress: string

  @Prop({ default: false })
  isDefault: boolean

  @Prop()
  isDeleted: boolean

  @Prop({ required: true, default: Date.now })
  createdAt: number

  @Prop()
  createdBy: UserSlimEntity

  @Prop()
  updatedAt: number

  @Prop()
  updatedBy: UserSlimEntity

  @Prop()
  deletedAt: number

  @Prop()
  deletedBy: UserSlimEntity

  constructor(props: Partial<DeliveryAddressEntity>) {
    Object.assign(this, props)
  }
}

export const DeliveryAddressSchema = SchemaFactory.createForClass(
  DeliveryAddressEntity,
)
