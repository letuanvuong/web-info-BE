import { ApolloError } from 'apollo-server-express'

export class OrderNotFoundError extends ApolloError {
  constructor(message?: string) {
    const code = 'ORDER_NOT_FOUND'
    if (!message) message = 'Không tìm thấy đơn hàng'
    super(message, code)
  }
}

export class WareHouseNotFoundError extends ApolloError {
  constructor(message?: string) {
    const code = 'WARE_HOUSE_NOT_FOUND'
    if (!message) message = 'Không tìm thấy kho thương mại điện tử mặc định'
    super(message, code)
  }
}

export class OrderDetailOfOderNotFoundError extends ApolloError {
  constructor(message?: string) {
    const code = 'ORDER_DETAIL_OF_ORDER_NOT_FOUND'
    if (!message) message = 'Không tìm thấy sản phẩm của đơn hàng này'
    super(message, code)
  }
}
