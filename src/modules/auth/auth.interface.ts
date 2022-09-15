import { EnumStatusAccount } from 'src/schema'

export interface JWTTokenPayload {
  userId: string
  User_Id?: string
  Status?: EnumStatusAccount
}
