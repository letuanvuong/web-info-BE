import { ApolloError } from 'apollo-server-express'

export class ContentContactNotFoundError extends ApolloError {
  constructor(message?: string) {
    const code = 'CONTENT_CONTACT_NOT_FOUND'
    if (!message) message = 'Không tìm thấy content contact'
    super(message, code)
  }
}
