import { Global, Module } from '@nestjs/common'

import { ServiceManager } from './service-manager'

@Global()
@Module({
  providers: [ServiceManager],
  exports: [ServiceManager],
})
export class ServiceManagerModule {}
