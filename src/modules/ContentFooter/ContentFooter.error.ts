import { ApolloError } from 'apollo-server-express'

export class ContentFooterNotFoundError extends ApolloError {
  constructor(message?: string) {
    const code = 'CONTENT_FOOTER_NOT_FOUND'
    if (!message) message = 'Không tìm thấy content footer'
    super(message, code)
  }
}
