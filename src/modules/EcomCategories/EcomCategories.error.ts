import { ApolloError } from 'apollo-server-express'

export class EcomCategoriesNotFoundError extends ApolloError {
  constructor(message?: string) {
    const code = 'CATEGORIES_NOTFOUND'
    if (!message) message = 'Cannot found categories'
    super(message, code)
  }
}

export class EcomCategoriesParentNotFoundError extends ApolloError {
  constructor(message?: string) {
    const code = 'CATEGORIES_PARENT_NOTFOUND'
    if (!message) message = 'Cannot found categories parent'
    super(message, code)
  }
}

export class CategoryNameExistedError extends ApolloError {
  constructor(message?: string) {
    const code = 'CATEGORIES_NAME_EXISTED'
    if (!message) message = 'Category name already exists'
    super(message, code)
  }
}

export class CategoryCodeExistedError extends ApolloError {
  constructor(message?: string) {
    const code = 'CATEGORIES_CODE_EXISTED'
    if (!message) message = 'Category code already exists'
    super(message, code)
  }
}

export class CategoryParentIsItself extends ApolloError {
  constructor(message?: string) {
    const code = 'CATEGORY_PARENT_IS_ITSELF_ERROR'
    if (!message) message = 'Category parent is itself'
    super(message, code)
  }
}

export class PublishCategoriesFailedError extends ApolloError {
  private static code = 'PUBLISH_CATEGORIES_FAILED_ERROR'
  constructor(message?: string) {
    if (!message) message = 'Publish categories failed'
    super(message, PublishCategoriesFailedError?.code)
  }
}
