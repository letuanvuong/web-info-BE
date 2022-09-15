import { IsNotEmpty, IsString } from 'class-validator'
import { NodeInput } from 'src/schema'

export class InputNodeDTO implements NodeInput {
  @IsString()
  idParent: string

  @IsString()
  @IsNotEmpty()
  idAccountingObject: string

  // @IsString() // WIP
  idPlace: string

  @IsString()
  @IsNotEmpty()
  code: string

  codeHealthFacility: string

  @IsString()
  @IsNotEmpty()
  name: string

  namePrint: string

  codeQueue: string

  codeSubQueue: string

  codeCounter: string

  codeNextQueue: string

  codeNextSubQueue: string

  codeEndSubQueue: string

  codeEndCounter: string

  @IsString()
  @IsNotEmpty()
  category: string

  phoneNumber: string

  taxCode: string

  detailAddress: string

  note: string

  canSale: boolean

  isStoreForHealthInsurance: boolean

  /** là kho tủ trực */
  isKhoTuTruc: boolean

  /** áp dụng cho phòng khám, cho biết phòng khám thuộc chuyên khoa nào */
  idSpecialist: string
}
