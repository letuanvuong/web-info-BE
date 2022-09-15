import 'moment-timezone'

import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory, Reflector } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import * as bodyParser from 'body-parser'
import * as cookieParser from 'cookie-parser'
import * as moment from 'moment'
import { join } from 'path'

import { AppModule } from './app.module'
import { LoggingInterceptor } from './interceptor/logging.interceptor'
import { RolesGuard } from './modules/auth/permission.guard'
import { ConfigurationService } from './modules/base-modules/configuration/config.service'
import { GQLArgumentGuard } from './modules/base-modules/graphql/gql.arg.guard'
import { GQLArgValidationFailedError } from './modules/base-modules/graphql/gql.error'
moment.tz.setDefault('Asia/Ho_Chi_Minh')

declare const module: any

const logger = new Logger('Main')
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {})
  app.use(
    bodyParser.json({
      limit: '50mb',
    }),
  )
  app.use(
    bodyParser.urlencoded({
      limit: '50mb',
      extended: true,
    }),
  )

  const appPort = app.get(ConfigurationService).getAppListeningPort()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const microservicePort = app.get(ConfigurationService).getMicroservicePort()

  app.useGlobalGuards(new RolesGuard(new Reflector()))
  app.useGlobalGuards(new GQLArgumentGuard(new Reflector()))
  // app.useGlobalFilters(new ApolloErrorFilter())
  // Below function passes validation errors to GraphQLModule in order
  // to generate a developer-friendly response format for frontend developer
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        // This custom error only supposed to be used here.
        // It's not a good idea to use below error at anywhere
        return new GQLArgValidationFailedError(errors)
      },
    }),
  )

  // app.useGlobalFilters(new DocumentValidationErrorFilter())
  app.useGlobalInterceptors(new LoggingInterceptor())
  app.useStaticAssets(join(__dirname, '..', process.env.FILE_PATH || 'files'), {
    index: false,
    prefix: '/webinfo_files',
  })
  app.enableCors({
    credentials: true,
    origin: true,
  })
  app.use(cookieParser())

  await app.listen(appPort, () => {
    const mongoURI = app.get(ConfigurationService).getMongoURI()
    const gqlEndpoint = app.get(ConfigurationService).getGQLEndpointPath()
    logger.debug('Database uri: ' + mongoURI)
    logger.debug('App is listening on port: ' + appPort)
    logger.debug('GraphQL server is serving at: ' + gqlEndpoint)
  })

  if (module.hot) {
    module.hot.accept()
    module.hot.dispose(() => app.close())
  }
}
bootstrap()
