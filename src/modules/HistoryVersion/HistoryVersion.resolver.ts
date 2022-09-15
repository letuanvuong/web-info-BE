import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { EnumContentHistoryType, InputContentHistory } from 'src/schema'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { HistoryVersionService } from './HistoryVersion.service'
import { HistoryVersionDocument } from './schemas/HistoryVersion.schema'

@Resolver('HistoryVersion')
export class HistoryVersionResolver {
  constructor(private readonly HistoryVersionService: HistoryVersionService) {}

  @Mutation()
  async createContentHistory(
    @Args('input') input: InputContentHistory,
  ): Promise<HistoryVersionDocument> {
    return await this.HistoryVersionService.createContentHistory(input)
  }

  @Mutation()
  async deleteContentHistory(@Args('_id') _id: string): Promise<boolean> {
    return await this.HistoryVersionService.deleteContentHistory(_id)
  }

  @Mutation()
  async renameVersion(
    @Args('_id') _id: string,
    @Args('name') name: string,
  ): Promise<boolean> {
    return await this.HistoryVersionService.renameVersion(_id, name)
  }

  @Query()
  async getContentHistory(
    @Args('idContent') idContent: string,
    @Args('type') type: EnumContentHistoryType,
  ): Promise<HistoryVersionDocument[]> {
    return await this.HistoryVersionService.getContentHistory(idContent, type)
  }
}
