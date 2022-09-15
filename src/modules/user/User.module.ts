import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { ActivationTokenHashModule } from '../ActivationTokenHash/ActivationTokenHash.module'
import { AuthModule } from '../auth/auth.module'
import { ContentHomePageModule } from '../ContentHomePage/ContentHomePage.module'
import {
  ContentHomePageEntity,
  ContentHomePageSchema,
} from '../ContentHomePage/schemas/ContentHomePage.schema'
import {
  CustomerEntity,
  CustomerSchema,
} from '../Customer/schemas/Customer.schema'
import {
  DeliveryAddressEntity,
  DeliveryAddressSchema,
} from '../DeliveryAddress/schemas/DeliveryAddress.schema'
import { Staff, StaffSchema } from '../Staff/schemas/NhanVien.schema'
import { UserEntity, UserSchema } from './schemas/User.schema'
import { UserResolver } from './User.resolver'
import { UserService } from './User.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserEntity.name, schema: UserSchema },
      { name: ContentHomePageEntity.name, schema: ContentHomePageSchema },
      { name: CustomerEntity.name, schema: CustomerSchema },
      { name: DeliveryAddressEntity.name, schema: DeliveryAddressSchema },
      { name: Staff.name, schema: StaffSchema },
    ]),
    AuthModule,
    ActivationTokenHashModule,
    ContentHomePageModule,
  ],
  providers: [UserResolver, UserService],
  exports: [UserService],
})
export class UserModule {}
