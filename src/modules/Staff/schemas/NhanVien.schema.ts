import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { DATABASE_COLLECTION_NAME } from 'src/constant'
import { IDFactory } from 'src/helper'
import { EnumGender, LinkImage, UserSlim } from 'src/schema'

export type StaffDocument = Staff & Document
@Schema({
  collection: DATABASE_COLLECTION_NAME.STAFF,
})
export class Staff {
  @Prop({
    default: IDFactory.getUUIDGenerator(),
    required: true,
  })
  _id: string

  @Prop()
  DoiTuongKeToan_Id: string

  @Prop({ required: true })
  MaNhanVien: string

  @Prop({ required: true })
  TenNhanVien: string

  @Prop({ required: true })
  TenKhongDau: string

  @Prop()
  ChuKySo: string

  @Prop()
  NgaySinh: number

  @Prop()
  SoDienThoai: string

  @Prop({ type: EnumGender })
  GioiTinh: EnumGender

  @Prop()
  DanToc_Id: string

  @Prop()
  NgheNghiep_Id: string

  @Prop()
  DiaChi_Id: string

  @Prop()
  QuocTich_Id: string

  @Prop()
  KhoaLamViec_Id: string

  @Prop()
  TaiKhoan_Id: string

  @Prop()
  ChucVu_Id: string

  @Prop()
  ChucDanh_Id: string

  @Prop()
  SoNha: string

  @Prop()
  CMNDHoacHoChieu: string

  @Prop()
  NgayVaoLam: number

  @Prop()
  ChungChiNgoai: string

  @Prop()
  GiayPhepHanhNghe: string

  @Prop()
  PhanTramHoaHong: number

  @Prop()
  LinkAvatar: LinkImage

  @Prop()
  PhamViDichVu_Ids: string[]

  @Prop({ required: true, default: false })
  TamNgung: boolean

  @Prop()
  TaxCode: string

  @Prop()
  Email: string

  @Prop()
  GhiChu: string

  @Prop({ required: true, default: true })
  isActive: boolean

  @Prop({ required: true, default: Date.now })
  createdAt: number

  @Prop({ required: true, type: Object })
  createdBy: UserSlim

  @Prop()
  updatedAt?: number

  @Prop({ type: Object })
  updatedBy: UserSlim

  @Prop()
  deletedAt?: number

  @Prop({ type: Object })
  deletedBy: UserSlim

  constructor(props: Partial<Staff>) {
    Object.assign(this, props)
  }
}

export const StaffSchema = SchemaFactory.createForClass(Staff)
