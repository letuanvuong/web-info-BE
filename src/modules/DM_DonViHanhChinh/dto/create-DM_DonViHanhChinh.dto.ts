import { IsNotEmpty } from 'class-validator'
import { EnumLoaiDonViHanhChinh, NewDonViHanhChinhInput } from 'src/schema'

export class CreateDonViHanhChinhDTO implements NewDonViHanhChinhInput {
  @IsNotEmpty()
  MaDonViHanhChinh: string

  @IsNotEmpty()
  TenDonViHanhChinh: string

  @IsNotEmpty()
  TenDayDu: string

  TenTat: string

  @IsNotEmpty()
  LoaiDonViHanhChinh: EnumLoaiDonViHanhChinh

  @IsNotEmpty()
  MaDonViHanhChinhCapTren: string

  @IsNotEmpty()
  MaDonViHanhChinhCapTrenDayDu: string
}
