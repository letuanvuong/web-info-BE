import { ApolloError } from 'apollo-server-express'

export class GQLEmailRenewPasswordHasAlreadySentError extends ApolloError {
  constructor(message?: string) {
    const code = 'ALREADY_SEND_EMAIL_RENEW_PASSWORD'
    if (!message) message = 'Email để đặt lại mật khẩu đã được gửi'
    super(message, code)
  }
}

export class GQLCantRenewPassword extends ApolloError {
  constructor(message?: string) {
    const code = 'CANT_RENEW_PASSWORD'
    if (!message) message = 'Không thể đặt lại mật khẩu'
    super(message, code)
  }
}

export class GQLTokenIsInvalid extends ApolloError {
  constructor(message?: string) {
    const code = 'TOKEN_IS_INVALID'
    if (!message) message = 'Token không hợp lệ'
    super(message, code)
  }
}

export class GQLTokenIsExpired extends ApolloError {
  constructor(message?: string) {
    const code = 'TOKEN_IS_EXPIRED'
    if (!message) message = 'Token đã hết hạn'
    super(message, code)
  }
}
