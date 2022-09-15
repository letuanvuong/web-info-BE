import { ApolloError } from 'apollo-server-express'

export class DataEmptyError extends ApolloError {
  constructor(message?: string) {
    const code = 'DATA_INPUT_EMPTY'
    if (!message) message = 'data input wrong field or missing'
    super(message, code)
  }
}
