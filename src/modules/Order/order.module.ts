import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import {
  CustomerEntity,
  CustomerSchema,
} from '../Customer/schemas/Customer.schema'
import {
  DeliveryAddressEntity,
  DeliveryAddressSchema,
} from '../DeliveryAddress/schemas/DeliveryAddress.schema'
import {
  OrderDetailEntity,
  OrderDetailSchema,
} from '../OrderDetail/schemas/OrderDetail.schema'
import { SettingModule } from '../Setting/Setting.module'
import { StockModule } from '../Stock/Stock.module'
import {
  StockModelEntity,
  StockModelSchema,
} from '../StockModel/schemas/StockModel.schema'
import { OrderResolver } from './order.resolver'
import { OrderService } from './order.service'
import { OrderEntity, OrderSchema } from './schemas/order.schema'
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OrderEntity.name, schema: OrderSchema },
      { name: StockModelEntity.name, schema: StockModelSchema },
      { name: OrderDetailEntity.name, schema: OrderDetailSchema },
      { name: DeliveryAddressEntity.name, schema: DeliveryAddressSchema },
      { name: CustomerEntity.name, schema: CustomerSchema },
    ]),
    SettingModule,
    StockModule,
  ],
  providers: [OrderService, OrderResolver],
  exports: [OrderService],
})
export class OrderModule {}
