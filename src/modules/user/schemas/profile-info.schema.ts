import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { IDFactory } from 'src/helper'
import { UserSlim } from 'src/schema'

import { UserSlimSchema } from './UserSlim.schema'

@Schema({
  toJSON: { virtuals: true, getters: true }, // enable virtuals
  toObject: { virtuals: true, getters: true }, // enable virtuals
})
export class ProfileInfoEntity {
  @Prop({
    default: IDFactory.getUUIDGenerator(),
  })
  _id: string

  @Prop()
  idProfile: string

  // profile: Profile

  @Prop()
  grantedAt: number

  @Prop({ type: UserSlimSchema })
  grantedBy: UserSlim
}

export const ProfileInfoSchema = SchemaFactory.createForClass(ProfileInfoEntity)

ProfileInfoSchema.virtual('profile', {
  // FIXME check why cant use ProfileEntity.name
  ref: 'ProfileEntity',
  localField: 'idProfile',
  foreignField: '_id',
  justOne: true,
})
