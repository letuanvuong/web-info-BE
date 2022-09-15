import { getCookie } from 'src/helper'
import { AuthService } from 'src/modules/auth/auth.service'
import { StaffService } from 'src/modules/Staff/Staff.service'
import { UserDocument } from 'src/modules/user/schemas/User.schema'
import { UserSlimEntity } from 'src/modules/user/schemas/UserSlim.schema'
import { UserService } from 'src/modules/user/User.service'

import { ConfigurationService } from '../configuration/config.service'
import { ServiceManager } from '../service-manager/service-manager'

export class AuthManager {
  private token: string
  private currentUserId: string
  /** TODO use lean() */
  private currentUser: UserDocument

  constructor(
    private serviceManager: ServiceManager,
    private readonly cookieStr: string,
    private readonly currentPath: string,
  ) {
    this.token = isUseAdminProfile(this.currentPath)
      ? getCookie(
          this.cookieStr,
          this.serviceManager.get(ConfigurationService).getAdminTokenKey(),
        )
      : getCookie(
          this.cookieStr,
          this.serviceManager.get(ConfigurationService).getHeaderTokenKey(),
        )
  }

  getToken = async () => {
    return this.token
  }

  getCurrentUserId = async () => {
    const isAuthen = await this.isAuthenticated()
    if (isAuthen) return this.currentUserId
    return ''
  }

  getCurrentUser = async () => {
    const isAuthen = await this.isAuthenticated()
    if (isAuthen) return this.currentUser
    return null
  }

  getCurrentStaff = async () => {
    const idUser = this.currentUser?._id
    if (idUser) {
      const staff = await this.serviceManager
        .get(StaffService)
        .findOneStaffByFilter({ TaiKhoan_Id: idUser || '' })

      if (!staff) {
        return {
          TenNhanVien: this.currentUser?.username,
        }
      }
      return staff
    }
    return null
  }

  getCurrentUserSlim = async (): Promise<UserSlimEntity> => {
    const user = await this.getCurrentUser()
    const output: UserSlimEntity = {
      _id: user?._id || '',
      username: user?.username || '',
    }
    return output
  }

  /** init currentUser then return output */
  isAuthenticated = async () => {
    try {
      // if have saved data, not compute again
      if (this.currentUser) return true

      // has token
      if (!this.token) return false
      // token is valid
      const payload = await this.serviceManager
        .get(AuthService)
        .verifyToken(this.token)
      if (!payload?.userId) return false
      // user in token is valid (not deleted, not locked)
      const foundUser = await this.serviceManager
        .get(UserService)
        .findUserMatchAny([{ _id: payload.userId }])

      if (
        !foundUser ||
        foundUser.isDeleted ||
        foundUser.isLocked ||
        !foundUser.isActive
      )
        return false

      // save data for later use
      this.currentUserId = payload.userId
      this.currentUser = foundUser

      return true
    } catch (error) {
      console.error('🚀 ~ isAuthenticated ~ error', error)
      return false
    }
  }
}

const isUseAdminProfile = (currentPath: string = '') => {
  const regex = /^\/?(vi|en)?(\/[\w-]+).*/
  const matchRes = currentPath.match(regex)
  const mainPath = matchRes?.[2]

  if (mainPath === '/web-admin') return true

  return false
}
