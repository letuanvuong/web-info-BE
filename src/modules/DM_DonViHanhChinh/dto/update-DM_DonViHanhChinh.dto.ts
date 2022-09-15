import { EditDonViHanhChinhInput, EnumLoaiDonViHanhChinh } from 'src/schema'

export class UpdateDonViHanhChinhDTO implements EditDonViHanhChinhInput {
  MaDonViHanhChinh: string

  TenDonViHanhChinh: string

  TenDayDu: string

  TenTat: string

  LoaiDonViHanhChinh: EnumLoaiDonViHanhChinh

  MaDonViHanhChinhCha: string

  MaDonViHanhChinhChaDayDu: string
}
