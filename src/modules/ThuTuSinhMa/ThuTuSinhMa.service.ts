import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { IDFactory } from 'src/helper'

import { ThuTuSinhMa, ThuTuSinhMaDocument } from './schemas/ThuTuSinhMa.schema'

@Injectable()
export class ThuTuSinhMaService {
  constructor(
    @InjectModel(ThuTuSinhMa.name)
    private readonly thuTuSinhMaModel: Model<ThuTuSinhMaDocument>,
  ) {}

  public async generateCodeByIndex(
    type: string,
    prefix: string,
    prefixSymbol: string,
    /** so luong chu so */
    number: number,
  ) {
    const thuTuMoi = await this.thuTuSinhMaModel.findOneAndUpdate(
      { LoaiMa: type },
      {
        $setOnInsert: {
          _id: IDFactory.generateID(),
          LoaiMa: type,
          NgayThang: '',
        },
        $inc: { ThuTuHienTai: 1 },
      },
      { upsert: true, new: true },
    )
    const output = ('0'.repeat(number) + thuTuMoi.ThuTuHienTai).substr(-number)
    return `${prefix ? `${prefix}${prefixSymbol || ''}` : ``}${output}`
  }

  /**
   * in case upsert multiple docs at the same time, there is a bug insert duplicate docs
   * I use this func to initCode first, then all gennerate later not cause duplicate
   * @see https://docs.mongodb.com/manual/reference/method/db.collection.update/#upsert-with-unique-index
   */
  public async initCode(type: string, date = '') {
    const result = await this.thuTuSinhMaModel.findOneAndUpdate(
      {
        LoaiMa: type,
        NgayThang: date,
      },
      {
        $setOnInsert: {
          _id: IDFactory.generateID(),
          LoaiMa: type,
          NgayThang: date,
          ThuTuHienTai: 0,
        },
      },
      { upsert: true, new: true },
    )
    return result
  }

  public async generateCodeByYear(
    type: string,
    prefix: string,
    prefixSymbol: string,
    year: string,
    yearSymbol: string,
    number: number,
  ) {
    const thuTuMoi = await this.thuTuSinhMaModel.findOneAndUpdate(
      {
        LoaiMa: type,
        NgayThang: year,
      },
      {
        $setOnInsert: {
          _id: IDFactory.generateID(),
          LoaiMa: type,
          NgayThang: year,
        },
        $inc: { ThuTuHienTai: 1 },
      },
      { upsert: true, new: true },
    )
    const output = ('0'.repeat(number) + thuTuMoi.ThuTuHienTai).substr(-number)
    return `${prefix ? `${prefix}${prefixSymbol || ''}` : ``}${year}${
      yearSymbol || ''
    }${output}`
  }

  public async generateCodeByDate(
    type: string,
    prefix: string,
    prefixSymbol: string,
    date: string,
    dateSymbol: string,
    number: number,
  ) {
    const thuTuMoi = await this.thuTuSinhMaModel.findOneAndUpdate(
      {
        LoaiMa: type,
        NgayThang: date,
      },
      {
        $setOnInsert: {
          _id: IDFactory.generateID(),
          LoaiMa: type,
          NgayThang: date,
        },
        $inc: { ThuTuHienTai: 1 },
      },
      { upsert: true, new: true },
    )
    const output = ('0'.repeat(number) + thuTuMoi.ThuTuHienTai).substr(-number)
    return `${prefix ? `${prefix}${prefixSymbol || ''}` : ``}${date}${
      dateSymbol || ''
    }${output}`
  }
}
