import { ApolloError } from 'apollo-server-express'

export class ContentSecurityNotFoundError extends ApolloError {
  constructor(message?: string) {
    const code = 'CONTENT_SECURITY_NOT_FOUND'
    if (!message) message = 'Không tìm thấy content security page'
    super(message, code)
  }
}
