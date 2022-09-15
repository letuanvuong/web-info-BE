import { ApolloError } from 'apollo-server-express'

export class ContentHomePageNotFoundError extends ApolloError {
  constructor(message?: string) {
    const code = 'CONTENT_HOME_PAGE_NOT_FOUND'
    if (!message) message = 'Không tìm thấy content home page'
    super(message, code)
  }
}
