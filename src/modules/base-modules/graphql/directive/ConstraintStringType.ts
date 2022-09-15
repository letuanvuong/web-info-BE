import { GraphQLScalarType } from 'graphql'

import { ConstraintDirectiveError as ValidationError } from './ConstraintDirectiveError'
import formats from './format'

export class ConstraintStringType extends GraphQLScalarType {
  constructor(fieldName, uniqueTypeName, type, args) {
    super({
      name: uniqueTypeName,
      serialize(value) {
        value = type.serialize(value)

        validate(fieldName, args, value)

        return value
      },
      parseValue(value) {
        value = type.serialize(value)

        validate(fieldName, args, value)

        return type.parseValue(value)
      },
      parseLiteral(ast) {
        const value = type.parseLiteral(ast)

        validate(fieldName, args, value)

        return value
      },
    })
  }
}

function validate(fieldName, args, value) {
  if (args.minLength && value?.length < args.minLength) {
    throw new ValidationError(
      fieldName,
      args?.message ||
        `Must be at least ${args.minLength} characters in length`,
      [{ arg: 'minLength', value: args.minLength }],
      args?.code,
    )
  }
  if (args.maxLength && value?.length > args.maxLength) {
    throw new ValidationError(
      fieldName,
      args?.message ||
        `Must be no more than ${args.maxLength} characters in length`,
      [{ arg: 'maxLength', value: args.maxLength }],
      args?.code,
    )
  }

  if (args.startsWith && !value.startsWith(args.startsWith)) {
    throw new ValidationError(
      fieldName,
      args?.message || `Must start with ${args.startsWith}`,
      [{ arg: 'startsWith', value: args.startsWith }],
      args?.code,
    )
  }

  if (args.endsWith && !value.endsWith(args.endsWith)) {
    throw new ValidationError(
      fieldName,
      args?.message || `Must end with ${args.endsWith}`,
      [{ arg: 'endsWith', value: args.endsWith }],
      args?.code,
    )
  }

  if (args.contains && !new RegExp(args.contains).test(value)) {
    throw new ValidationError(
      fieldName,
      args?.message || `Must contain ${args.contains}`,
      [{ arg: 'contains', value: args.contains }],
      args?.code,
    )
  }

  if (args.notContains && new RegExp(args.notContains).test(value)) {
    throw new ValidationError(
      fieldName,
      args?.message || `Must not contain ${args.notContains}`,
      [{ arg: 'notContains', value: args.notContains }],
      args?.code,
    )
  }

  if (args.pattern && !new RegExp(args.pattern).test(value)) {
    throw new ValidationError(
      fieldName,
      args?.message || `Must match ${args.pattern}`,
      [{ arg: 'pattern', value: args.pattern }],
      args?.code,
    )
  }

  if (args.format) {
    const formatter: any = formats[args.format]
    if (!formatter) {
      throw new ValidationError(
        fieldName,
        args?.message || `Invalid format type ${args.format}`,
        [{ arg: 'format', value: args.format }],
        args?.code,
      )
    }

    try {
      formatter(value) // Will throw if invalid
    } catch (e) {
      throw new ValidationError(
        fieldName,
        args?.message || e.message,
        [{ arg: 'format', value: args.format }],
        args?.code,
      )
    }
  }
}
