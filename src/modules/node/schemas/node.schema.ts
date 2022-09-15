import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { DATABASE_COLLECTION_NAME } from 'src/constant'
import { IDFactory, removeVietnameseTones } from 'src/helper'
import {
  UserSlimEntity,
  UserSlimSchema,
} from 'src/modules/user/schemas/UserSlim.schema'
import { Node, NodeInput, User, UserSlim } from 'src/schema'

export type NodeDocument = NodeEntity & Document

interface AdditionalNodeDbProps {
  nameUnsigned: string
  indexReceive: number
  indexExamination: number
  indexTest: number
  indexUltrasound: number
  indexXRay: number
  indexCTScan: number
  indexMRI: number
  indexEndoscopic: number
  indexTip: number
  indexECG: number
  indexEEG: number
  indexImport: number
  indexExport: number
  indexRetail: number
  indexStockControl: number
  indexReturnStock: number
  isDeleted: boolean
  isActive: boolean
  createdAt: number
  createdBy: UserSlim
  updatedAt?: number
  updatedBy?: UserSlim
}
@Schema({ collection: DATABASE_COLLECTION_NAME.NODE })
export class NodeEntity implements Required<Node & AdditionalNodeDbProps> {
  @Prop({
    default: IDFactory.getUUIDGenerator(),
    required: true,
  })
  _id: string

  @Prop()
  idParent: string

  @Prop({ required: true, default: 'default' })
  idAccountingObject: string

  @Prop()
  idPlace: string

  @Prop({ required: true })
  code: string

  @Prop()
  codeHealthFacility: string

  @Prop({ required: true })
  name: string

  @Prop()
  nameUnsigned: string

  @Prop()
  namePrint: string

  @Prop()
  codeQueue: string

  @Prop()
  codeSubQueue: string

  @Prop()
  codeCounter: string

  @Prop()
  codeNextQueue: string

  @Prop()
  codeNextSubQueue: string

  @Prop()
  codeEndSubQueue: string

  @Prop()
  codeEndCounter: string

  // @Prop({ required: true, type: String })
  // type: TypeNodeEnum

  @Prop()
  phoneNumber: string

  @Prop()
  taxCode: string

  @Prop()
  detailAddress: string

  @Prop()
  note: string

  @Prop()
  isStoreForHealthInsurance: boolean

  /** là kho tủ trực */
  @Prop()
  isKhoTuTruc: boolean

  /** áp dụng cho phòng khám, cho biết phòng khám thuộc chuyên khoa nào */
  @Prop()
  idSpecialist: string

  @Prop({ required: true, default: false })
  canSale: boolean

  @Prop()
  indexReceive: number

  @Prop()
  indexExamination: number

  @Prop()
  indexTest: number

  @Prop()
  indexUltrasound: number

  @Prop()
  indexXRay: number

  @Prop()
  indexCTScan: number

  @Prop()
  indexMRI: number

  @Prop()
  indexEndoscopic: number

  @Prop()
  indexTip: number

  @Prop()
  indexECG: number

  @Prop()
  indexEEG: number

  @Prop()
  indexImport: number

  @Prop()
  indexExport: number

  @Prop()
  indexRetail: number

  @Prop()
  indexStockControl: number

  @Prop()
  indexReturnStock: number

  @Prop({ default: false })
  isDeleted: boolean

  @Prop({ default: true })
  isActive: boolean

  @Prop({ default: Date.now })
  createdAt: number

  @Prop({ type: UserSlimSchema, ref: 'UserEntity' })
  createdBy: UserSlim

  @Prop()
  updatedAt: number

  @Prop({ type: UserSlimSchema, ref: 'UserEntity' })
  updatedBy: UserSlim

  constructor(
    nodeInput: Partial<NodeInput>,
    currentUser: User,
    isUpdate?: boolean,
  ) {
    Object.assign(this, nodeInput)
    const userSlim = new UserSlimEntity(currentUser)

    if (this.name) {
      this.nameUnsigned = removeVietnameseTones(this.name)
    }
    this.createdBy = userSlim

    if (isUpdate) {
      this.updatedAt = Date.now()
      this.updatedBy = userSlim
    }
  }
}

export const NodeSchema = SchemaFactory.createForClass(NodeEntity)
