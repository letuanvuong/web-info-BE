import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { IDFactory } from 'src/helper'
import { MenuItem } from 'src/schema'

@Schema()
export class MenuItemEntity {
  @Prop({
    default: IDFactory.getUUIDGenerator(),
    required: true,
  })
  _id: string

  @Prop()
  name: string

  @Prop()
  link: string

  @Prop()
  children: MenuItem[]

  constructor(props: Partial<MenuItemEntity>) {
    Object.assign(this, props)
  }
}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItemEntity)
