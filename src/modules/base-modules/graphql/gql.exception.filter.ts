/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { GqlExceptionFilter } from '@nestjs/graphql'
import { ApolloError } from 'apollo-server-express'
import { Error } from 'mongoose'

@Catch()
export class ApolloErrorFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    throw exception
  }
}

/**
 * TODO check hoạt động của exception filter
 */
@Catch(Error.ValidationError)
export class DocumentValidationErrorFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    // eslint-disable-next-line no-console
    console.log(
      '🚀 ~ file: gql.exception.filter.ts ~ line 27 ~ DocumentValidationErrorFilter ~ exception',
      exception,
    )
    throw new ApolloError('Hello world')
  }
}
