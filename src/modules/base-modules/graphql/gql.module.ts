import { GraphQLModule } from '@nestjs/graphql'
import { Request, Response } from 'express'
import { GraphQLError } from 'graphql'
import { ConnectionContext, ConnectionParams } from 'subscriptions-transport-ws'

// import { UnauthenticatedError } from '../../auth/auth.error'
// import { AuthService } from '../../auth/auth.service'
import { ConfigurationService } from '../configuration/config.service'
import { MyContext } from '../my-context/my-context'
import { ServiceManager } from '../service-manager/service-manager'
import { AuthManager } from './auth-manager'
// import { UserService } from '../../user/User.service'
import { CustomLogPlugin } from './custom-log-plugin'
import { DataLoaderManager } from './data-loader-manager'
import { constraintDirective } from './directive'
import { IContext, IPubSubContext } from './gql.type'

export default GraphQLModule.forRootAsync({
  imports: [],
  useFactory: async (
    configService: ConfigurationService,
    myContext: MyContext,
    serviceManager: ServiceManager,
  ) => ({
    cors: false,
    typePaths: ['./**/*.graphql'],
    path: configService.getGQLEndpointPath(),
    playground: { settings: { 'request.credentials': 'include' } },
    installSubscriptionHandlers: true,
    context: async ({
      req: request,
      res,
    }: {
      req: Request
      res: Response
    }): Promise<IContext> => {
      // clear before create a new one
      myContext.clear()

      const reqReceivedAt = Date.now()
      // create dataloader
      const loaderManager = new DataLoaderManager(serviceManager)
      const cookieStr = request.headers?.cookie
      const currentPath = request?.headers?.currentpath as string

      const authManager = new AuthManager(
        serviceManager,
        cookieStr,
        currentPath,
      )

      const infoAddToContext: IContext = {
        res,
        reqReceivedAt,
        loaderManager,
        authManager,
      }
      // store ctx
      myContext.set(infoAddToContext)
      return infoAddToContext
    },
    subscriptions: {
      'subscriptions-transport-ws': {
        path: configService.getGQLEndpointPath(),
        keepAlive: 5000,
        onConnect: async (
          connectionParams: ConnectionParams,
          webSocket,
          context: ConnectionContext,
        ): Promise<IPubSubContext> => {
          const loaderManager = new DataLoaderManager(serviceManager)
          const cookieStr = context.request?.headers?.cookie
          const currentPath = context.request?.headers?.currentpath as string
          const authManager = new AuthManager(
            serviceManager,
            cookieStr,
            currentPath,
          )

          const infoSubscriptionContext: IPubSubContext = {
            loaderManager,
            authManager,
          }

          return infoSubscriptionContext
        },
      },
    },
    // ERROR FORMAT CONFIGURATION - THIS IS CRUCIAL TO CHANGE, ASK YOUR LEADER BEFORE
    // MAKING ANY CHANGE
    formatError: (error: GraphQLError) => {
      // Handle validation errors passed from global exception filter (which originally emit from class validator)
      if (error.extensions.code === 'INVALID_ARGUMENTS') {
        return {
          message: error.message,
          code: error.extensions.code,
          details: error.extensions.errors.map(({ constraints, property }) => ({
            property,
            constraints,
          })),
        }
      }
      // Handle throw or return ApolloError by user
      const graphQLFormattedError = {
        message: error.message,
        code:
          error.extensions?.code ||
          error.extensions?.exception?.code ||
          'UNKNOWN',
      }
      return graphQLFormattedError
    },
    plugins: [CustomLogPlugin],
    transformSchema: constraintDirective,
    transformAutoSchemaFile: true,
  }),
  inject: [ConfigurationService, MyContext, ServiceManager],
})
