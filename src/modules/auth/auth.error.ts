import { ApolloError } from 'apollo-server-express'

export class TokenExpiredError extends ApolloError {
  constructor(message?: string) {
    const code = 'TOKEN_EXPIRED'
    if (!message) message = 'Token hết hạn'
    super(message, code)
  }
}

export class UnauthenticatedError extends ApolloError {
  constructor(message?: string) {
    const code = 'UNAUTHENTICATED'
    if (!message) message = 'Chưa được xác thực'
    super(message, code)
  }
}

export class UnauthorizedError extends ApolloError {
  constructor(message?: string) {
    const code = 'UNAUTHORIZED'
    if (!message) message = 'Chưa đủ quyền'
    super(message, code)
  }
}

export class InvalidInputError extends ApolloError {
  constructor(message?: string) {
    const code = 'INVALID_INPUT'
    if (!message) message = 'Đầu vào không hợp lệ'
    super(message, code)
  }
}

export class AlreadyLogoutError extends ApolloError {
  constructor(message?: string) {
    const code = 'ALREADY_LOGOUT'
    if (!message) message = 'Hiện đã logout'
    super(message, code)
  }
}

export class GQLUserUnverifiedError extends ApolloError {
  constructor(message?: string) {
    const code = 'NGUOI_DUNG_UNVERIFIED'
    if (!message) message = 'Tài khoản chưa xác minh'
    super(message, code)
  }
}
