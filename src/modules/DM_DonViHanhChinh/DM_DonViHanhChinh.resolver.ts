/* eslint-disable no-console */
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql'
import { ApolloError } from 'apollo-server-errors'

import { DonViHanhChinhNotFound } from './DM_DonViHanhChinh.error'
import { DM_DonViHanhChinhService } from './DM_DonViHanhChinh.service'
import { CreateDonViHanhChinhDTO } from './dto/create-DM_DonViHanhChinh.dto'
import { searchDM_DonViHanhChinhDTO } from './dto/info-DM_DonViHanhChinh.dto'
import { UpdateDonViHanhChinhDTO } from './dto/update-DM_DonViHanhChinh.dto'

@Resolver()
export class DM_DonViHanhChinhResolver {
  constructor(
    private readonly dm_donViHanhChinhService: DM_DonViHanhChinhService,
  ) {}

  @Query()
  async getAllDonViHanhChinh() {
    return await this.dm_donViHanhChinhService.getAllDonViHanhChinh()
  }

  @Query()
  async findOneDonViHanhChinh(@Args('id') id: string) {
    return await this.dm_donViHanhChinhService.findOneDonViHanhChinh(id)
  }

  @Query()
  async findDonViHanhChinh(@Args('ids') ids: string[]) {
    return await this.dm_donViHanhChinhService.findDonViHanhChinh(ids)
  }

  @Query()
  async searchDM_DonViHanhChinh(
    @Args() args: searchDM_DonViHanhChinhDTO,
  ): Promise<any[]> {
    try {
      return this.dm_donViHanhChinhService.searchDM_DonViHanhChinh(args)
    } catch (err) {
      console.error(err)
      throw new ApolloError(err)
    }
  }

  @Mutation()
  async createDonViHanhChinh(
    @Context() ctx,
    @Args('donViHanhChinh')
    newDM_DonViHanhChinh: CreateDonViHanhChinhDTO,
  ) {
    return await this.dm_donViHanhChinhService.createDonViHanhChinh(
      ctx,
      newDM_DonViHanhChinh,
    )
  }

  @Mutation()
  async updateDonViHanhChinh(
    @Context() ctx,
    @Args('id') id: string,
    @Args('donViHanhChinh')
    editDM_DonViHanhChinh: UpdateDonViHanhChinhDTO,
  ) {
    const found = await this.findOneDonViHanhChinh(id)

    if (!found) {
      throw new DonViHanhChinhNotFound('DM_DonViHanhChinh not found')
    }

    return await this.dm_donViHanhChinhService.updateDonViHanhChinh(
      ctx,
      id,
      editDM_DonViHanhChinh,
    )
  }

  @Mutation()
  async deleteDonViHanhChinh(@Context() ctx, @Args('ids') ids: string[]) {
    await Promise.all(
      ids.map(async (id) => {
        const donViHanhChinh = await this.findOneDonViHanhChinh(id)

        if (!donViHanhChinh) {
          throw new DonViHanhChinhNotFound('DM_DonViHanhChinh not found')
        }

        return id
      }),
    )
    return await this.dm_donViHanhChinhService.deleteDonViHanhChinh(ctx, ids)
  }
}
