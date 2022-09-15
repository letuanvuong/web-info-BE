import { ApolloError } from 'apollo-server-express'

export class NodeNotFoundError extends ApolloError {
  constructor(message?: string) {
    const code = 'ERR_NODE_NOT_FOUND'
    if (!message) message = 'Cơ sở - tổ chức không tồn tại'
    super(message, code)
  }
}

export class NodeExistCodeError extends ApolloError {
  constructor(message?: string) {
    const code = 'ERR_NODE_EXIST_CODE'
    if (!message) message = 'Mã cơ sở - tổ chức đã tồn tại'
    super(message, code)
  }
}

export class NodeEmptyNameError extends ApolloError {
  constructor(message?: string) {
    const code = 'ERR_NODE_EMPTY_NAME'
    if (!message) message = 'Nhập tên cơ sở - tổ chức '
    super(message, code)
  }
}

export class NodeNotFoundParentError extends ApolloError {
  constructor(message?: string) {
    const code = 'ERR_NODE_NOT_FOUND_PARENT'
    if (!message) message = 'Không tìm thấy node cha'
    super(message, code)
  }
}

export class NodeIsItselfError extends ApolloError {
  constructor(message?: string) {
    const code = 'ERR_NODE_NOT_FOUND'
    if (!message) message = 'Node không phải là chính nó'
    super(message, code)
  }
}
