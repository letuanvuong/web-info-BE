/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApolloServerPlugin } from 'apollo-server-plugin-base'
import * as moment from 'moment'
import { DEFAULT_ENV } from 'src/constant'

import { IContext } from './gql.type'

export const CustomLogPlugin: ApolloServerPlugin<IContext> = {
  async requestDidStart(requestContext) {
    const { reqReceivedAt } = requestContext.context
    const startHandleAt = Date.now()
    requestContext.context.messageLogs = [
      `${moment(startHandleAt).format('MM/DD')},${moment(startHandleAt).format(
        'HH:mm:ss',
      )}  `,
      `Ctx ${addColor({
        input: startHandleAt - reqReceivedAt,
        suffix: 'ms',
      })}`,
    ]
    return {
      /** lấy được query string từ req */
      /* didResolveSource(reqCtx) {
        console.log(
          '✏️ didResolveSource',
          Date.now() - startHandleAt,
          reqCtx.source
        )
      }, */

      /** parse query string */
      /* parsingDidStart(reqCtx) {
        console.log('✏️ parsingDidStart', Date.now() - startHandleAt)
      }, */

      /** validate query hợp lệ hay ko */
      /* validationDidStart(reqCtx) {
        console.log(
          '✏️ validationDidStart',
          Date.now() - startHandleAt,
          JSON.stringify(reqCtx.document)
        )
      }, */

      /** xác định được tên operation - khác với tên query hay mutation */
      /* didResolveOperation(reqCtx) {
        console.log(
          '✏️ didResolveOperation',
          Date.now() - startHandleAt,
          reqCtx.operationName
        )
      }, */

      /** nếu return != null ở đây, sẽ ko chạy vào resolver nữa */
      /* responseForOperation(reqCtx) {
        console.log('✏️ responseForOperation', Date.now() - startHandleAt)
        return null
      }, */

      /** begin execute */
      async executionDidStart(reqCtx) {
        return {
          willResolveField({ source, args, context, info }) {
            const { path, fieldName, parentType } = info
            // const start = process.hrtime.bigint() // use this to compute time in nanoseconds
            const start = Date.now()
            return (error, result) => {
              // const end = process.hrtime.bigint() // use this to compute time in nanoseconds
              const end = Date.now()
              const time = end - start
              // log time cho resolver
              if (!path.prev) {
                if (!context.resolverTime) context.resolverTime = {}
                context.resolverTime[fieldName] = time
                context.messageLogs.push(
                  `${addColor({
                    input: fieldName,
                    color: ColorOption.FgGreen,
                  })} ${addColor({
                    input: time,
                    suffix: 'ms',
                  })}`,
                )
              }
              // log các field tiêu tốn hơn 1ms
              const {
                LOGGING_LEVEL: levelDefault,
                TIME_LIMIT_RESOLVE_FIELD: limitDefault,
              } = DEFAULT_ENV
              const {
                LOGGING_LEVEL = levelDefault,
                TIME_LIMIT_RESOLVE_FIELD = limitDefault,
              } = process.env
              if (+LOGGING_LEVEL > 1 && time > +TIME_LIMIT_RESOLVE_FIELD) {
                console.log(
                  `Field ${parentType.name}.${fieldName} took ${time}ms`,
                )
                if (error) {
                  console.log(`It failed with ${error}`)
                }
                // else {
                //   console.log(`It returned ${result}`)
                // }
              }
            }
          },
        }
      },

      /** got error */
      /* didEncounterErrors(reqCtx) {
        console.log('✏️ didEncounterErrors', reqCtx.errors)
      }, */

      /** befor send response */
      async willSendResponse(reqCtx) {
        const { context } = reqCtx
        const responseTime = Date.now()
        const hangdlingTime = responseTime - startHandleAt
        // compute time resolve fields but not include resolver time
        if (context.resolverTime) {
          let truncateTime = hangdlingTime
          Object.values(context.resolverTime).forEach(
            (resolverTime: number) => {
              truncateTime = truncateTime - resolverTime
            },
          )
          if (truncateTime > 0)
            context.messageLogs.push(
              `Other ${addColor({
                input: truncateTime,
                suffix: 'ms',
              })}`,
            )
        }
        // total time
        context.messageLogs.push(
          `👉 Actual ${addColor({
            input: responseTime - context.reqReceivedAt,
            suffix: 'ms',
            color: ColorOption.FgYellow,
          })}`,
        )
        // show log
        console.log('✏️', ...context.messageLogs)
      },
    }
  },
}

const addColor = (options: {
  input: any
  prefix?: string
  suffix?: string
  color?: ColorOption
}) => {
  const {
    input,
    prefix = '',
    suffix = '',
    color = ColorOption.FgCyan,
  } = options
  const endHighLight = '\x1b[0m'
  return `${color}${prefix}${input}${suffix}${endHighLight}`
}

/** @see https://stackoverflow.com/a/41407246/9036743 */
const enum ColorOption {
  // Reset = "\x1b[0m"
  Bright = '\x1b[1m',
  Dim = '\x1b[2m',
  Underscore = '\x1b[4m',
  Blink = '\x1b[5m',
  Reverse = '\x1b[7m',
  Hidden = '\x1b[8m',
  FgBlack = '\x1b[30m',
  FgRed = '\x1b[31m',
  FgGreen = '\x1b[32m',
  FgYellow = '\x1b[33m',
  FgBlue = '\x1b[34m',
  FgMagenta = '\x1b[35m',
  FgCyan = '\x1b[36m',
  FgWhite = '\x1b[37m',
  BgBlack = '\x1b[40m',
  BgRed = '\x1b[41m',
  BgGreen = '\x1b[42m',
  BgYellow = '\x1b[43m',
  BgBlue = '\x1b[44m',
  BgMagenta = '\x1b[45m',
  BgCyan = '\x1b[46m',
  BgWhite = '\x1b[47m',
}
