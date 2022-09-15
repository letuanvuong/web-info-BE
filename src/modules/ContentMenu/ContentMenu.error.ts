import { ApolloError } from 'apollo-server-express'

export class ContentMenuNotFoundError extends ApolloError {
  constructor(message?: string) {
    const code = 'CONTENT_MENU_NOT_FOUND'
    if (!message) message = 'Không tìm thấy content menu'
    super(message, code)
  }
}
