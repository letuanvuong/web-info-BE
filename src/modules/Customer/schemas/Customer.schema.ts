import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { DATABASE_COLLECTION_NAME } from 'src/constant'
import { IDFactory } from 'src/helper'
import { UserSlimSchema } from 'src/modules/user/schemas/UserSlim.schema'
import { EnumGender, IdentityCard, UserSlim } from 'src/schema'

export type CustomerDocument = CustomerEntity & Document

@Schema({
  collection: DATABASE_COLLECTION_NAME.CUSTOMERS,
  toJSON: { virtuals: true, getters: true }, // enable virtuals
  toObject: { virtuals: true, getters: true }, // enable virtuals
})
// export class CustomerEntity implements Required<Customer> {
export class CustomerEntity {
  @Prop({
    default: IDFactory.getUUIDGenerator(),
    required: true,
  })
  _id: string

  @Prop()
  user_Id: string

  @Prop()
  email: string

  @Prop()
  phoneNumber: string

  @Prop()
  avatar: string

  @Prop()
  fullName: string

  @Prop()
  unsignedFullName: string

  @Prop()
  gender: EnumGender

  @Prop()
  dateOfBirth: number

  @Prop()
  address: string

  @Prop()
  identityCard: IdentityCard

  @Prop({ required: true, default: Date.now })
  createdAt: number

  @Prop({ required: true, type: UserSlimSchema })
  createdBy: UserSlim

  @Prop()
  updatedAt: number

  @Prop({ type: UserSlimSchema })
  updatedBy: UserSlim

  @Prop()
  deletedAt: number

  @Prop({ type: UserSlimSchema })
  deletedBy: UserSlim

  constructor(props: Partial<CustomerEntity>) {
    Object.assign(this, props)
  }
}

export const CustomerSchema = SchemaFactory.createForClass(CustomerEntity)
