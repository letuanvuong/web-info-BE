import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { InputCreateActivationToken } from 'src/schema'

import { ActivationTokenHashDocument } from './schema/ActivationTokenHash.schema'

@Injectable()
export class ActivationTokenHashService {
  constructor(
    @InjectModel('ActivationTokenHashEntity')
    private activationTokenHashModel: Model<ActivationTokenHashDocument>,
  ) {}

  /**
   * find activation token hash
   * @params conditions
   * @returns activation token hash
   */

  async findActivationTokenHashMatchAny(
    conditions: any,
  ): Promise<ActivationTokenHashDocument> {
    const activationTokenHash = await this.activationTokenHashModel.findOne({
      $and: [{ $or: conditions }],
    })
    return activationTokenHash
  }

  /**
   * create new  activation token hash
   * @returns activation token hash
   */
  async createActivationTokenHash(
    inputCreateActivationToken: InputCreateActivationToken,
  ): Promise<ActivationTokenHashDocument> {
    const newToken = new this.activationTokenHashModel(
      inputCreateActivationToken,
    )
    const result = await newToken.save()
    return result
  }

  /**
   * delete activation token hash
   * @returns boolean
   */
  async deleteActivationTokenHash(token: string): Promise<boolean> {
    const resultDeleted = await this.activationTokenHashModel.deleteOne({
      token,
    })

    return resultDeleted.n > 0 && resultDeleted.deletedCount > 0
  }
}
