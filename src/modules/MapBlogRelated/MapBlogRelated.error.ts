import { ApolloError } from 'apollo-server-express'

export class DuplicateBlogIdError extends ApolloError {
  constructor(message?: string) {
    const code = 'DUPLICATE_BLOG__ID'
    if (!message) message = 'Duplicate blog id'
    super(message, code)
  }
}

export class NotFoundBlogIdError extends ApolloError {
  constructor(message?: string) {
    const code = 'NOT_FOUND_BLOG__ID'
    if (!message) message = 'Not found blog id'
    super(message, code)
  }
}
