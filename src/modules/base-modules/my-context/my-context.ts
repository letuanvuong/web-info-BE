import { Injectable } from '@nestjs/common'
import { ApolloError } from 'apollo-server-express'

import { IContext } from '../graphql/gql.type'

@Injectable()
export class MyContext {
  private context: IContext

  getContext() {
    if (!this.context) throw new ApolloError('Missing graphql context')
    return this.context
  }
  /** alias of getContext */
  get = this.getContext

  setContext(inputCtx: IContext) {
    this.context = inputCtx
  }
  /** alias of setContext */
  set = this.setContext

  clear() {
    this.context = undefined
  }
}
