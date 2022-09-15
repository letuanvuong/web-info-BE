import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { CustomerResolver } from './Customer.resolver'
import { CustomerService } from './Customer.service'
import { CustomerEntity, CustomerSchema } from './schemas/Customer.schema'
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CustomerEntity.name, schema: CustomerSchema },
    ]),
  ],
  providers: [CustomerService, CustomerResolver],
  exports: [CustomerService],
})
export class CustomerModule {}
