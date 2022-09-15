import { Module } from '@nestjs/common'
import { MICROSERVICE_CLIENT as CLIENTS } from 'src/constant'

@Module({
  providers: [
    /* {
      // khởi tạo client cho HIS_SERVICE
      provide: CLIENTS.HIS_SERVICE,
      useFactory: (configService: ConfigurationService) => {
        return ClientProxyFactory.create(configService.getHisServiceOptions())
      },
      inject: [ConfigurationService]
    } */
  ],
  exports: [CLIENTS.HIS_SERVICE],
})
export class MicroserviceClientModule {}
