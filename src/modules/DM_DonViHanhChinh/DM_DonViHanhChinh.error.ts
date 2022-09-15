import { ApolloError } from 'apollo-server-errors'

export class DonViHanhChinhNotFound extends ApolloError {
  private static code = 'ERR_ADMINISTRATIVE_UNIT_NOT_FOUND'
  constructor(message?: string) {
    super(message, DonViHanhChinhNotFound.code)
  }
}

export class DonViHanhChinhDuplicate extends ApolloError {
  private static code = 'ERR_DM_DonViHanhChinh_EXISTED_MA_DON_VI_HANH_CHINH'
  constructor(message?: string) {
    super(message, DonViHanhChinhDuplicate.code)
  }
}
