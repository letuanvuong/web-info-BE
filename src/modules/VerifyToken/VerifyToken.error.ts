import { ApolloError } from 'apollo-server-express'

export class SendMailError extends ApolloError {
  constructor(message?: string) {
    const code = 'SEND_EMAIL_FAILED'
    if (!message) message = 'Gửi mail thất bại'
    super(message, code)
  }
}

export class VerifyAccountError extends ApolloError {
  constructor(message?: string) {
    const code = 'VERIFY_ACCOUNT_FAILED'
    if (!message) message = 'Xác nhận tài khoản thất bại'
    super(message, code)
  }
}

export class TokenNotFoundError extends ApolloError {
  constructor(message?: string) {
    const code = 'TOKEN_NOTFOUND'
    if (!message) message = 'Không tìm thấy Token'
    super(message, code)
  }
}

export class TokenExpiredError extends ApolloError {
  constructor(message?: string) {
    const code = 'TOKEN_EXPIRED'
    if (!message) message = 'Token hết hạn'
    super(message, code)
  }
}
