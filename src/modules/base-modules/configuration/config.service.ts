import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TcpClientOptions, Transport } from '@nestjs/microservices'

import { ConfigKeys, MicroserviceConfigKeys } from './config.interface'

@Injectable()
export class ConfigurationService {
  constructor(
    private configService: ConfigService<ConfigKeys & MicroserviceConfigKeys>,
  ) {}

  public getAppListeningPort() {
    return this.configService.get<number>('APP_PORT')
  }

  public getMongoURI() {
    return this.configService.get<string>('MONGO_URI')
  }

  public getGQLEndpointPath() {
    return this.configService.get<string>('GRAPHQL_ENDPOINT_PATH')
  }

  public getMicroservicePort() {
    return this.configService.get<string>('MS_AUTH_PORT')
  }

  public getTeleBotToken() {
    return this.configService.get<string>('TELE_BOT_TOKEN')
  }
  public getTeleChannelId() {
    return this.configService.get<string>('TELE_CHANNEL_ID')
  }

  public getLoggingLevel() {
    return this.configService.get('LOGGING_LEVEL')
  }
  public getTimeLimitResolveField() {
    return this.configService.get('TIME_LIMIT_RESOLVE_FIELD')
  }

  /**
   * @description This function return defined password salt
   * used when hash password
   * @returns number
   */
  public getPasswordHashSalt() {
    return this.configService.get<number>('PASSWORD_HASH_SALT')
  }

  public getTokenEncryptSecret() {
    return this.configService.get<string>('TOKEN_ENCRYPT_SECRET')
  }

  public getHeaderTokenKey() {
    return this.configService.get<string>('HEADER_TOKEN_KEY')
  }

  public getAdminTokenKey() {
    return this.configService.get<string>('ADMIN_TOKEN_KEY')
  }

  public getHisServiceOptions(): TcpClientOptions {
    return {
      transport: Transport.TCP,
      options: {
        host: this.configService.get<string>('MS_HIS_HOST'),
        port: this.configService.get<number>('MS_HIS_PORT'),
      },
    }
  }

  public getVerifyTokenExpires() {
    return this.configService.get<number>('VERIFY_TOKEN_EXPIRES')
  }
}
