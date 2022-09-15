import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { DATABASE_COLLECTION_NAME } from 'src/constant'
import { IDFactory } from 'src/helper'

export type ThuTuSinhMaDocument = ThuTuSinhMa & Document

@Schema({ collection: DATABASE_COLLECTION_NAME.THU_TU_SINH_MA })
export class ThuTuSinhMa {
  @Prop({
    default: IDFactory.createID(),
    required: true,
  })
  _id: string

  @Prop({ required: true })
  LoaiMa: string

  @Prop()
  NgayThang: string

  @Prop({ required: true })
  ThuTuHienTai: number

  constructor(props: Partial<ThuTuSinhMa>) {
    Object.assign(this, props)
  }
}

export const ThuTuSinhMaSchema = SchemaFactory.createForClass(ThuTuSinhMa)
