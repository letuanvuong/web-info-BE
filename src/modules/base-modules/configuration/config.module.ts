import { Global, Module } from '@nestjs/common'
import { ConfigModule as NestConfigModule } from '@nestjs/config'
import { DEFAULT_ENV } from 'src/constant'

import { ConfigKeys, MicroserviceConfigKeys } from './config.interface'
import { ConfigurationService } from './config.service'

const ConfigModule = NestConfigModule.forRoot({
  isGlobal: true,
  envFilePath:
    process.env.NODE_ENV !== 'production'
      ? '.env.development'
      : '.env.production',
  load: [
    (): ConfigKeys & MicroserviceConfigKeys => {
      if (
        process.env.PASSOWRD_HASH_SALT &&
        isNaN(parseInt(process.env.PASSWORD_HASH_SALT))
      ) {
        console.error(
          'PASSWORD_HASH_SALT must be a number or leave it as default',
        )
        process.exit(1)
      }

      return {
        APP_PORT: parseInt(process.env.APP_PORT) || DEFAULT_ENV.APP_PORT,
        MONGO_URI: process.env.MONGO_URI || DEFAULT_ENV.MONGO_URI,
        PASSWORD_HASH_SALT:
          parseInt(process.env.PASSWORD_HASH_SALT) ||
          DEFAULT_ENV.PASSWORD_HASH_SALT,
        TOKEN_ENCRYPT_SECRET:
          process.env.TOKEN_ENCRYPT_SECRET || DEFAULT_ENV.TOKEN_ENCRYPT_SECRET,
        GRAPHQL_ENDPOINT_PATH:
          process.env.GRAPHQL_ENDPOINT_PATH ||
          DEFAULT_ENV.GRAPHQL_ENDPOINT_PATH,
        HEADER_TOKEN_KEY:
          process.env.HEADER_TOKEN_KEY || DEFAULT_ENV.HEADER_TOKEN_KEY,
        ADMIN_TOKEN_KEY:
          process.env.ADMIN_TOKEN_KEY || DEFAULT_ENV.ADMIN_TOKEN_KEY,
        MS_AUTH_PORT: process.env.MS_AUTH_PORT,
        MS_HIS_HOST: process.env.MS_HIS_HOST,
        MS_HIS_PORT: parseInt(process.env.MS_HIS_PORT),
        TELE_BOT_TOKEN: process.env.TELE_BOT_TOKEN,
        TELE_CHANNEL_ID: process.env.TELE_CHANNEL_ID,
        LOGGING_LEVEL: process.env.LOGGING_LEVEL || DEFAULT_ENV.LOGGING_LEVEL,
        TIME_LIMIT_RESOLVE_FIELD:
          process.env.TIME_LIMIT_RESOLVE_FIELD ||
          DEFAULT_ENV.TIME_LIMIT_RESOLVE_FIELD,
        VERIFY_TOKEN_EXPIRES:
          parseInt(process.env.VERIFY_TOKEN_EXPIRES) ||
          DEFAULT_ENV.VERIFY_TOKEN_EXPIRES,
      }
    },
  ],
})

@Global()
@Module({
  imports: [ConfigModule],
  providers: [ConfigurationService],
  exports: [ConfigurationService],
})
export default class ConfigurationModule {}
