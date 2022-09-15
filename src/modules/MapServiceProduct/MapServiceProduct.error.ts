import { ApolloError } from 'apollo-server-express'

export class DuplicateStockModelIdError extends ApolloError {
  constructor(message?: string) {
    const code = 'DUPLICATE_STOCK_MODEL_ID'
    if (!message) message = 'Duplicate stock model id'
    super(message, code)
  }
}

export class NotFoundStockModelIdError extends ApolloError {
  constructor(message?: string) {
    const code = 'NOT_FOUND_STOCK_MODEL_ID'
    if (!message) message = 'Not found stock model id'
    super(message, code)
  }
}

export class ServiceMapNotFoundError extends ApolloError {
  constructor(message?: string) {
    const code = 'SERVICE_MAP_NOT_FOUND_ERROR'
    if (!message) message = 'Service map not found'
    super(message, code)
  }
}
