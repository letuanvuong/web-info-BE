import { ApolloError } from 'apollo-server-express'
import {
  isBase64,
  isEmail,
  isIP,
  isISO8601,
  isRFC3339,
  isURL,
  isUUID,
} from 'class-validator'

const formats = {
  byte: (value, args) => {
    if (isBase64(value)) return true
    throw new ApolloError(
      args?.message || 'Must be in byte format',
      args?.code || 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
    )
  },
  'date-time': (value, args) => {
    if (isRFC3339(value)) return true
    throw new ApolloError(
      args?.message || 'Must be a date-time in RFC 3339 format',
      args?.code || 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
    )
  },
  date: (value, args) => {
    if (isISO8601(value)) return true
    throw new ApolloError(
      args?.message || 'Must be a date-time in ISO 8601 format',
      args?.code || 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
    )
  },
  email: (value, args) => {
    if (isEmail(value)) return true
    throw new ApolloError(
      args?.message || 'Must be in email format',
      args?.code || 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
    )
  },
  ipv4: (value, args) => {
    if (isIP(value, 4)) return true
    throw new ApolloError(
      args?.message || 'Must be in IP v4 format',
      args?.code || 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
    )
  },
  ipv6: (value, args) => {
    if (isIP(value, 6)) return true
    throw new ApolloError(
      args?.message || 'Must be in IP v6 format',
      args?.code || 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
    )
  },
  uri: (value, args) => {
    if (isURL(value)) return true
    throw new ApolloError(
      args?.message || 'Must be in IP v6 format',
      args?.code || 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
    )
  },
  uuid: (value, args) => {
    if (isUUID(value)) return true
    throw new ApolloError(
      args?.message || 'Must be in UUID format',
      args?.code || 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
    )
  },
  'phone-number': (value, args) => {
    if (new RegExp(/^(84|0[3|5|7|8|9])+([0-9]{8})/).test(value)) return true
    throw new ApolloError(
      args?.message || 'Must be in phone number format',
      args?.code || 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
    )
  },
  password: (value, args) => {
    if (new RegExp('^(?=.*d)(?=.*[a-z])(?=.*[a-zA-Z]).{8,}$').test(value))
      return true
    throw new ApolloError(
      args?.message || 'Must be in phone number format',
      args?.code || 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
    )
  },
}

export default formats
