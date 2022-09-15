import { ApolloError } from 'apollo-server-express'

export class ContentAboutUsNotFoundError extends ApolloError {
  constructor(message?: string) {
    const code = 'CONTENT_ABOUT_US_NOT_FOUND'
    if (!message) message = 'Không tìm thấy content about us page'
    super(message, code)
  }
}
