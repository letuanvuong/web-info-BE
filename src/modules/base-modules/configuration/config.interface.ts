export interface ConfigKeys {
  APP_PORT: number
  MONGO_URI: string
  PASSWORD_HASH_SALT: number
  TOKEN_ENCRYPT_SECRET: string
  GRAPHQL_ENDPOINT_PATH: string
  HEADER_TOKEN_KEY: string
  ADMIN_TOKEN_KEY: string
  // config for start microservice
  MS_AUTH_PORT: string
  // config send message telegram
  TELE_BOT_TOKEN: string
  TELE_CHANNEL_ID: string
  // config log
  LOGGING_LEVEL: string
  TIME_LIMIT_RESOLVE_FIELD: string
  VERIFY_TOKEN_EXPIRES: number
}

/**
 * Config need to connect to other microservice
 */
export interface MicroserviceConfigKeys {
  MS_HIS_HOST: string
  MS_HIS_PORT: number
}
