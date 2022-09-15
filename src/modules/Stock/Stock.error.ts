import { ApolloError } from 'apollo-server-express'

export class StockModelNotFoundError extends ApolloError {
  constructor(message?: string) {
    const code = 'STOCK_MODEL_NOT_FOUND'
    if (!message) message = 'Không tìm thấy stock model'
    super(message, code)
  }
}

export class IsLatestProductError extends ApolloError {
  constructor(message?: string) {
    const code = 'STOCK_MODEL_IS_LATEST'
    if (!message) message = 'Stock model đã là mới nhất'
    super(message, code)
  }
}

export class StockNotEnoughError extends ApolloError {
  constructor(message?: string) {
    const code = 'STOCK_NOT_ENOUGH'
    if (!message) message = 'not enough inventory for product'
    super(message, code)
  }
}
