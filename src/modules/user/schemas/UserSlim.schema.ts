import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { UserSlim } from 'src/schema'

@Schema()
export class UserSlimEntity implements UserSlim {
  @Prop()
  _id: string

  @Prop()
  username: string

  @Prop()
  fullName?: string

  constructor(userSlimInput: Partial<UserSlimEntity>) {
    Object.assign(this, userSlimInput)
  }
}

export const UserSlimSchema = SchemaFactory.createForClass(UserSlimEntity)
