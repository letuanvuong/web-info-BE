import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql'
import { DeliveryAddress } from 'src/schema'

import { UnauthenticatedError } from '../auth/auth.error'
import { IContext } from '../base-modules/graphql/gql.type'
import { DeliveryAddressService } from './DeliveryAddress.service'
@Resolver('DeliveryAddress')
export class DeliveryAddressResolver {
  constructor(private deliveryDeliveryAddressService: DeliveryAddressService) {}

  @Query()
  async getDeliveryAddressesByIdCustomer(
    @Args() args,
    @Context() context: IContext,
  ): Promise<DeliveryAddress[]> {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return this.deliveryDeliveryAddressService.getDeliveryAddressesByIdCustomer(
      args,
    )
  }

  @Query()
  async getDefaultDeliveryAddress(
    @Args() args,
    @Context() context: IContext,
  ): Promise<DeliveryAddress[]> {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return this.deliveryDeliveryAddressService.getDefaultDeliveryAddress(args)
  }

  @Mutation()
  async createDeliveryAddress(
    @Args() args,
    @Context() context: IContext,
  ): Promise<boolean> {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return this.deliveryDeliveryAddressService.createDeliveryAddress(
      args,
      context,
    )
  }

  @Mutation()
  async updateDeliveryAddress(
    @Args() args,
    @Context() context: IContext,
  ): Promise<boolean> {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return this.deliveryDeliveryAddressService.updateDeliveryAddress(
      args,
      context,
    )
  }

  @Mutation()
  async deleteDeliveryAddress(
    @Args() args,
    @Context() context: IContext,
  ): Promise<boolean> {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return this.deliveryDeliveryAddressService.deleteDeliveryAddress(
      args,
      context,
    )
  }
}
