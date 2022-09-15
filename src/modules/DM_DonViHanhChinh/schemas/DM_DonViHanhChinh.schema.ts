import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { IDFactory } from 'src/helper'
import { EnumLoaiDonViHanhChinh, UserSlim } from 'src/schema'

export type DM_DonViHanhChinhDocument = DM_DonViHanhChinh & Document

@Schema({ collection: 'DM_DonViHanhChinh' })
export class DM_DonViHanhChinh {
  @Prop({ default: IDFactory.createID(), required: true })
  _id: string

  @Prop({ required: true })
  MaDonViHanhChinh: string

  @Prop({ required: true })
  TenDonViHanhChinh: string

  @Prop({ required: true })
  TenDayDu: string

  @Prop()
  TenTat: string

  @Prop({ required: true })
  TenKhongDau: string

  @Prop({ required: true })
  TenKhongDauDayDu: string

  @Prop({ required: true, type: EnumLoaiDonViHanhChinh })
  LoaiDonViHanhChinh: EnumLoaiDonViHanhChinh

  @Prop()
  MaDonViHanhChinhCapTren: string

  @Prop()
  MaDonViHanhChinhCapTrenDayDu: string

  @Prop({ required: true, default: false })
  MacDinh: boolean

  @Prop({ required: true, default: true })
  isActive: boolean

  @Prop({ required: true, default: Date.now })
  createdAt: number

  @Prop({ required: true, type: Object })
  createdBy: UserSlim

  @Prop()
  updatedAt: number

  @Prop({ type: Object })
  updatedBy: UserSlim

  @Prop()
  deletedAt: number

  @Prop({ type: Object })
  deletedBy: UserSlim

  constructor(props: Partial<DM_DonViHanhChinh>) {
    Object.assign(this, props)
  }
}

export const DM_DonViHanhChinhSchema =
  SchemaFactory.createForClass(DM_DonViHanhChinh)
