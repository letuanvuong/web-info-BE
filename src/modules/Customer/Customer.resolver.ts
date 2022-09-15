import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql'
import { InputUpdateCustomer } from 'src/schema'

import { UnauthenticatedError } from '../auth/auth.error'
import { IContext } from '../base-modules/graphql/gql.type'
import { CustomerService } from './Customer.service'
import { CustomerDocument } from './schemas/Customer.schema'
@Resolver('Customer')
export class CustomerResolver {
  constructor(
    private readonly customerService: CustomerService, // private readonly serviceManager: ServiceManager, // private readonly authService: AuthService, // private readonly activationTokenHashService: ActivationTokenHashService,
  ) {}

  @Query()
  async getCustomers(@Context() context: IContext) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    const result = await this.customerService.getCustomers()
    return result
  }

  @Mutation()
  async updateCustomer(
    @Args('user_Id') user_Id: string,
    @Args('input') input: InputUpdateCustomer,
    @Context() context: IContext,
  ): Promise<CustomerDocument> {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    // TODO: check if not found user
    const updatedCostumer = await this.customerService.updateCustomer(
      user_Id,
      input,
    )

    return updatedCostumer
  }
}
