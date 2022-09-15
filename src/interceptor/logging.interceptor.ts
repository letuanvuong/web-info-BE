/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { Observable, throwError } from 'rxjs'
import { catchError, tap } from 'rxjs/operators'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context?.['contextType'] !== 'graphql') return next.handle()
    // const now: number = Date.now()
    // const actionType: string = String(context['args'][3].parentType)
    // const functionName: string = String(context.getArgs()[3].fieldName)

    return next.handle()
  }

  /**
   * show log action type, function name, time exe and date time.
   */
  public showLogAction(actionType: string, functionName: string, now: number) {
    // eslint-disable-next-line no-console
    console.log(
      '🚀',
      `\x1b[32m[${actionType}]\x1b[0m`,
      '»',
      functionName,
      `\x1b[33m[+${Date.now() - now}ms]\x1b[0m`,
      new Date().toLocaleString(),
      '👌',
    )
    return
  }

  /**
   * show log error
   */
  public showLogError(error: any) {
    console.error(
      '❌',
      `\x1b[31m[Interceptor: ${(error + '').replace(
        /(Error: |Authentication|UserInputError: )+/g,
        '',
      )}]\x1b[0m`,
      '😢',
    )
    return
  }
}
