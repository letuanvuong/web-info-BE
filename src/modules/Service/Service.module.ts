import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { ServiceEntity, ServiceSchema } from './schemas/Service.schema'
import { ServiceResolver } from './Service.resolver'
import { ServiceService } from './Service.service'
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ServiceEntity.name, schema: ServiceSchema },
    ]),
  ],
  providers: [ServiceService, ServiceResolver],
  exports: [ServiceService],
})
export class ServiceModule {}
