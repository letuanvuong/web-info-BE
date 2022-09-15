import { ApolloError } from 'apollo-server-express'

export class ConstraintDirectiveError extends ApolloError {
  private code: string
  private fieldName: string
  constructor(fieldName, message: string, context, code?: string) {
    super(message, code || 'ERR_GRAPHQL_CONSTRAINT_VALIDATION')
    this.code = code || 'ERR_GRAPHQL_CONSTRAINT_VALIDATION'
    this.fieldName = fieldName
  }
}
