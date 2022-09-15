import { ApolloError } from 'apollo-server-express'
import { MAX_BLOG_FEATURE } from 'src/constant'
export class BlogTitleAlreadyExistsError extends ApolloError {
  constructor(message?: string) {
    const code = 'BLOG_TITLE_ALREADY_EXISTS'
    if (!message) message = 'Blog title already exists'
    super(message, code)
  }
}

export class BlogSlugAlreadyExistsError extends ApolloError {
  constructor(message?: string) {
    const code = 'BLOG_SLUG_ALREADY_EXISTS'
    if (!message) message = 'Blog slug already exists'
    super(message, code)
  }
}

export class BlogNotFound extends ApolloError {
  constructor(message?: string) {
    const code = 'BLOG_NOT_FOUND'
    if (!message) message = 'Blog not found'
    super(message, code)
  }
}

export class MaxFeatureBlogError extends ApolloError {
  constructor(message?: string) {
    const code = 'MAX_FEATURE_BLOG_ERROR'
    if (!message)
      message = `The number of featured posts exceeds ${MAX_BLOG_FEATURE}!`
    super(message, code)
  }
}
