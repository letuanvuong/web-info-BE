import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { DeliveryAddressResolver } from './DeliveryAddress.resolver'
import { DeliveryAddressService } from './DeliveryAddress.service'
import {
  DeliveryAddressEntity,
  DeliveryAddressSchema,
} from './schemas/DeliveryAddress.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DeliveryAddressEntity.name, schema: DeliveryAddressSchema },
    ]),
  ],
  providers: [DeliveryAddressService, DeliveryAddressResolver],
  exports: [DeliveryAddressService],
})
export class DeliveryAddressModule {}
