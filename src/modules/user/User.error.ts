import { ApolloError } from 'apollo-server-express'

export class UserNotFoundError extends ApolloError {
  private static code = 'ERR_USER_NOT_FOUND'
  constructor(message?: string) {
    if (!message) message = 'Tài khoản không tồn tại'
    super(message, UserNotFoundError.code)
  }
}

export class UserInactiveError extends ApolloError {
  constructor(message?: string) {
    const code = 'ERR_NGUOI_DUNG_NOT_ACTIVATED'
    super(message, code)
    if (!message) message = 'Tài khoản không hoạt động'
    super(message, code)
  }
}

export class GQLEmailAlreadyInUseError extends ApolloError {
  constructor(message?: string) {
    const code = 'ALREADY_INUSE_EMAIL'
    if (!message) message = 'Tên email đã được sử dụng'
    super(message, code)
  }
}

export class GQLTenDangNhapAlreadyInUseError extends ApolloError {
  constructor(message?: string) {
    const code = 'ALREADY_INUSE_TEN_DANG_NHAP'
    if (!message) message = 'Tên tài khoản đã được sử dụng'
    super(message, code)
  }
}

export class GQLUserNotExistError extends ApolloError {
  constructor(message?: string) {
    const code = 'NGUOI_DUNG_NOT_EXIST'
    if (!message) message = 'Tài khoản không tồn tại'
    super(message, code)
  }
}

export class GQLUserLockedError extends ApolloError {
  constructor(message?: string) {
    const code = 'NGUOI_DUNG_LOCKED'
    if (!message) message = 'Tài khoản đã bị khoá'
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

export class GQLUserWasDeleted extends ApolloError {
  constructor(message?: string) {
    const code = 'GQLUserWasDeleted'
    if (!message) message = 'Tài khoản đã bị xoá hoặc không tồn tại'
    super(message, code)
  }
}

export class GQLLoginError extends ApolloError {
  constructor(message?: string) {
    const code = 'GQLLoginError'
    if (!message) message = 'Tên tài khoản/email hoặc mật khẩu không đúng'
    super(message, code)
  }
}

export class GQLUserNotLinkEmployeeError extends ApolloError {
  constructor(message?: string) {
    const code = 'NGUOI_DUNG_NOT_EMPLOYEE'
    if (!message) message = 'Tài khoản chưa liên kết nhân viên'
    super(message, code)
  }
}

export class PasswordNotMatchError extends ApolloError {
  private static code = 'ERR_PASSWORD_NOT_MATCH'
  constructor(message?: string) {
    if (!message) message = 'Mật khẩu không trùng'
    super(message, PasswordNotMatchError.code)
  }
}

export class GQLIdentityCardNumberAlreadyInUseError extends ApolloError {
  constructor(message?: string) {
    const code = 'ALREADY_INUSE_ID_NUMBER'
    if (!message) message = 'Số thẻ cmnd/cccd đã được sử dụng'
    super(message, code)
  }
}

export class UserDaXacNhanError extends ApolloError {
  constructor(message?: string) {
    const code = 'ACCOUNT_IS_CONFIRMED'
    if (!message) message = 'Tải khoản đã được xác nhận'
    super(message, code)
  }
}
export class CapNhatStatusError extends ApolloError {
  constructor(message?: string) {
    const code = 'UPDATE_TRANG_THAI_FAILED'
    if (!message) message = 'Cập nhật trạng thái thất bại'
    super(message, code)
  }
}
export class GQLInputNewPasswordError extends ApolloError {
  constructor(message?: string) {
    const code = 'NOT_INPUT_NEW_PASSWORD'
    if (!message) message = 'Vui lòng nhập mật khẩu mới'
    super(message, code)
  }
}
export class ConfirmationPasswordIsIncorrectError extends ApolloError {
  constructor(message?: string) {
    const code = 'CONFIRMATION_PASSWORD_IS_INCORRECT'
    if (!message) message = 'Mật khẩu xác nhận không chính xác'
    super(message, code)
  }
}

export class GQLCustomizeError extends ApolloError {
  constructor(message?: string) {
    const code = 'CUSTOMIZE_ERROR'
    if (!message) message = 'Có lỗi xảy ra khi gửi mail'
    super(message, code)
  }
}

export class UserExistedError extends ApolloError {
  constructor(message?: string) {
    const code = 'USER_EXISTED'
    if (!message) message = 'User existed'
    super(message, code)
  }
}

export class MailExistedError extends ApolloError {
  constructor(message?: string) {
    const code = 'EMAIL_EXISTED'
    if (!message) message = 'Email existed'
    super(message, code)
  }
}

export class PasswordOldUsed extends ApolloError {
  constructor(message?: string) {
    const code = 'PASSWORD_OLD'
    if (!message) message = 'Tài khoản không tồn tại'
    super(message, code)
  }
}
