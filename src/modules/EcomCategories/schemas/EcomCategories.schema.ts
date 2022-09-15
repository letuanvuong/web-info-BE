import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { DATABASE_COLLECTION_NAME } from 'src/constant'
import { IDFactory } from 'src/helper'
import { UserSlimSchema } from 'src/modules/user/schemas/UserSlim.schema'

import { EnumCategoriesStatus, UserSlim } from './../../../schema'

export type EcomCategoriesDocument = EcomCategoriesEntity & Document

type AdditionalFieldOnDb = {
  isActive: boolean
  isDeleted: boolean
}

@Schema({ collection: DATABASE_COLLECTION_NAME.ECOMCATEGORIES })
export class EcomCategoriesEntity implements Required<AdditionalFieldOnDb> {
  @Prop({
    default: IDFactory.getUUIDGenerator(),
    required: true,
  })
  _id: string

  @Prop()
  CategoryCode: string

  @Prop()
  CategoryName: string

  @Prop()
  Slug: string

  @Prop()
  Status: EnumCategoriesStatus

  @Prop()
  CategoryName_Unsigned: string

  @Prop()
  Color: string

  @Prop()
  CategoryParent_Id: string

  @Prop({ default: false })
  isDeleted: boolean

  @Prop({ default: true })
  isActive: boolean

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

  constructor(props: Partial<EcomCategoriesEntity>) {
    Object.assign(this, props)
  }
}

export const EcomCategoriesSchema =
  SchemaFactory.createForClass(EcomCategoriesEntity)
