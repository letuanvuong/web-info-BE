import { ApolloError } from 'apollo-server-express'

export class StockModelNotFoundError extends ApolloError {
  constructor(message?: string) {
    const code = 'STOCK_MODEL_NOT_FOUND'
    if (!message) message = 'No products found'
    super(message, code)
  }
}

export class IsLatestProductError extends ApolloError {
  constructor(message?: string) {
    const code = 'STOCK_MODEL_IS_LATEST'
    if (!message) message = 'Latest product'
    super(message, code)
  }
}

export class StockModelCodeExistedError extends ApolloError {
  constructor(message?: string) {
    const code = 'STOCK_MODEL_CODE_EXISTED'
    if (!message) message = 'Product already exists'
    super(message, code)
  }
}

export class StockModelByEcomSlugExistedError extends ApolloError {
  constructor(message?: string) {
    const code = 'STOCK_MODEL_BY_ECOM_SLUG_EXISTED'
    if (!message) message = 'Stock model slug already exists'
    super(message, code)
  }
}

export class StockModelNameExistedError extends ApolloError {
  constructor(message?: string) {
    const code = 'STOCK_MODEL_NAME_EXISTED'
    if (!message) message = 'stock model name already exists'
    super(message, code)
  }
}
