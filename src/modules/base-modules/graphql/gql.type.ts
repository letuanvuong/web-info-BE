// Copy and edit from cfr-backend

import { Request, Response } from 'express'
import { User } from 'src/schema'

import { AuthManager } from './auth-manager'
import { DataLoaderManager } from './data-loader-manager'

/**
 * Subscriptions Context
 * @readonly `connection`: any
 * @readonly `currentUserId?`: string
 * @readonly `variables?`: any
 */
export interface SContext {
  connection: any
  currentUserId?: string
  variables?: any
  session?: string
}

/** Queries / Mutations Context */
export interface IContext {
  req?: Request
  res?: Response
  authManager?: AuthManager
  loaderManager?: DataLoaderManager
  // 3 fields for log req time
  reqReceivedAt?: number
  resolverTime?: Record<string, number>
  messageLogs?: string[]

  // TODO remove below
  permissions?: string[]
  currentUser?: User
  idCurrentNode?: string
  idCurrentProfile?: string
}

export interface IPubSubContext {
  authManager: AuthManager
  loaderManager: DataLoaderManager
}

export const CustomHeaderField = {
  currentNode: 'current-node',
  currentProfile: 'current-profile',
}
