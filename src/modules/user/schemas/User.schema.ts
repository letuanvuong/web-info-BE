import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { DATABASE_COLLECTION_NAME } from 'src/constant'
import { IDFactory } from 'src/helper'
import { CustomerEntity } from 'src/modules/Customer/schemas/Customer.schema'
import { Staff } from 'src/modules/Staff/schemas/NhanVien.schema'
import {
  EnumStatusAccount,
  EnumTypeAccount,
  ProfileInfo,
  UserSlim,
} from 'src/schema'

import { ProfileInfoSchema } from './profile-info.schema'
import { UserSlimSchema } from './UserSlim.schema'

export type UserDocument = UserEntity & Document

type AdditionalFieldOnDb = {
  password: string
}
@Schema({
  collection: DATABASE_COLLECTION_NAME.USER,
  toJSON: { virtuals: true, getters: true }, // enable virtuals
  toObject: { virtuals: true, getters: true }, // enable virtuals
})
export class UserEntity implements Required<AdditionalFieldOnDb> {
  @Prop({
    default: IDFactory.getUUIDGenerator(),
    required: true,
  })
  _id: string

  // idEmployee: string

  @Prop({ required: true })
  username: string

  @Prop()
  displayName: string

  @Prop({ required: true })
  password: string

  @Prop({ type: [ProfileInfoSchema], default: [] })
  profiles: ProfileInfo[]

  @Prop()
  email: string

  @Prop()
  phoneNumber: string

  @Prop()
  note: string

  // @Prop({ type: Object })
  // employee: JSON

  @Prop({ type: EnumStatusAccount })
  Status: EnumStatusAccount

  @Prop({ type: EnumTypeAccount })
  TypeAccount: EnumTypeAccount

  @Prop()
  lastChangePasswordAt: number

  // @Prop()
  // isOnline: boolean

  @Prop({ default: false })
  isLocked: boolean

  @Prop({ default: false })
  isDeleted: boolean

  @Prop({ default: true })
  isActive: boolean

  @Prop()
  lockedAt: number

  @Prop({ type: UserSlimSchema })
  lockedBy: UserSlim

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

  constructor(props: Partial<UserEntity>) {
    // TODO: declare init value
    Object.assign(this, props)
  }
}

export const UserSchema = SchemaFactory.createForClass(UserEntity)

UserSchema.virtual('customer', {
  ref: CustomerEntity.name,
  localField: '_id',
  foreignField: 'user_Id',
  justOne: true,
})

UserSchema.virtual('employee', {
  ref: Staff.name,
  localField: '_id',
  foreignField: 'TaiKhoan_Id',
  justOne: true,
})
