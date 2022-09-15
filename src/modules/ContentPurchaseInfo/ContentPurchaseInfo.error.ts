import { ApolloError } from 'apollo-server-express'

export class ContentPurchaseInfoNotFoundError extends ApolloError {
  constructor(message?: string) {
    const code = 'CONTENT_PURCHASE_INFO_NOT_FOUND'
    if (!message) message = 'Không tìm thấy content purchase info page'
    super(message, code)
  }
}
