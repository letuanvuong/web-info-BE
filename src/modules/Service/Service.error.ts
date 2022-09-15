import { ApolloError } from 'apollo-server-express'

export class ServiceTitlAlreadyExistseError extends ApolloError {
  constructor(message?: string) {
    const code = 'SERVICE_TITLE_ALREADY_EXISTS'
    if (!message) message = 'service title already exists'
    super(message, code)
  }
}

export class ServiceSlugAlreadyExistsError extends ApolloError {
  constructor(message?: string) {
    const code = 'SERVICE_SLUG_ALREADY_EXISTS'
    if (!message) message = 'service slug already exists'
    super(message, code)
  }
}
