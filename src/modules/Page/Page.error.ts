import { ApolloError } from 'apollo-server-express'

export class PageTitlEalreadyExistsError extends ApolloError {
  constructor(message?: string) {
    const code = 'PAGE_TITLE_ALREADY_EXISTS'
    if (!message) message = 'Page title already exists'
    super(message, code)
  }
}

export class PageSlugAlreadyExistsError extends ApolloError {
  constructor(message?: string) {
    const code = 'PAGE_SLUG_ALREADY_EXISTS'
    if (!message) message = 'Page slug already exists'
    super(message, code)
  }
}
