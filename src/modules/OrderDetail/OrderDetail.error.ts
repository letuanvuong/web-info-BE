import { ApolloError } from 'apollo-server-express'

export class OrderDetailNotFoundError extends ApolloError {
  constructor(message?: string) {
    const code = 'ADDRESS_NOT_FOUND'
    if (!message) message = 'Không tìm thấy địa chỉ'
    super(message, code)
  }
}
