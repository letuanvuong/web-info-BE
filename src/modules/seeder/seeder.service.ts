/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger } from '@nestjs/common'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { Timeout } from '@nestjs/schedule'
import { Connection, Model } from 'mongoose'
import { DATABASE_COLLECTION_NAME } from 'src/constant'
import { removeVietnameseTones } from 'src/helper'

import { AuthService } from '../auth/auth.service'
// import { dataPermission } from './data/permission'
import { ServiceManager } from '../base-modules/service-manager/service-manager'

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name)
  constructor(
    @InjectConnection() private connection: Connection,
    private readonly serviceManager: ServiceManager,
  ) {}
  // @Timeout(1000)
  // async seedUser() {
  //   // SEED APPADMIN
  //   const appadminFound = await this.userService.findUser({
  //     username: 'appadmin'
  //   })
  //   if (!appadminFound) {
  //     this.logger.warn('App admin user is not found in database, appadmin is about to be seeded')
  //     const appAdmin = users.find(u => u.username === 'appadmin')
  //     if (!appAdmin) {
  //       this.logger.error('No user with username of "appadmin" specified in seed data')
  //       process.exit(1)
  //     }

  //     const createdAppadmin = await this.userService.createUser(appAdmin)
  //     if (createdAppadmin) this.logger.verbose('App admin seeded')
  //   }

  //   this.logger.log('User collection checked')

  //   const existedCollections = await this.connection.db
  //     .listCollections()
  //     .toArray()
  //   const collectionNames = existedCollections.map((c) => c.name)
  //   // SEED APP PERMISSIONS
  //   if (!collectionNames.includes(DATABASE_COLLECTION_NAME.PERMISSION)) {
  //     // if (this.authService.)
  //     this.logger.warn(
  //       'Permission collection did not exist, permissions is about to be seeded'
  //     )
  //     for (const permission of appPermissions) {
  //       this.logger.verbose(`Seeding ${permission._id}`)
  //       await this.authService.savePermission(permission)
  //     }
  //   }
  //   this.logger.log('Permission collection checked')

  //   if (!collectionNames.includes(DATABASE_COLLECTION_NAME.ROLE)) {
  //     this.logger.warn(
  //       'role collection not exist, role is about to be seeded'
  //     )
  //     for (const role of groupRoles) {
  //       this.logger.verbose(`Seeding ${role._id}`)
  //       await this.authService.saveRole(role)
  //     }

  //     for (const role of appRoles) {
  //       this.logger.verbose(`Seeding ${role._id}`)
  //       await this.authService.saveRole(role)
  //     }
  //   }

  //   this.logger.log('Role collection checked')
  // }
  // async seedPermission() {
  //   this.logger.verbose(
  //     `Checking ${DATABASE_COLLECTION_NAME.PERMISSION} table...`
  //   )
  //   const existedCollections = await this.connection.db
  //     .listCollections()
  //     .toArray()

  //   const collectionNames = existedCollections.map((ele) => ele.name)

  //   //TODO: dbseed user
  //   const dataPermissionFormatted = dataPermission.map((ele) => ({
  //     ...ele,
  //     isActive: true,
  //     nameUnsigned: removeVietnameseTones(ele.name),
  //     createdAt: +new Date()
  //   }))

  //   let failedPermissions = []
  //   const findPermissionsSeedingError = (seedResult) =>
  //     dataPermission
  //       .map((permission) => permission._id)
  //       .filter(
  //         (_id) => !seedResult?.map((seedPerm) => seedPerm._id).includes(_id)
  //       )

  //   if (!collectionNames.includes(DATABASE_COLLECTION_NAME.PERMISSION)) {
  //     this.logger.log(
  //       `Creating ${DATABASE_COLLECTION_NAME.PERMISSION} table...`
  //     )

  //     const seedPermissions = await this.serviceManager
  //       .get(AuthService)
  //       .savePermissions(dataPermissionFormatted)
  //     if (dataPermission.length !== seedPermissions?.length)
  //       failedPermissions = findPermissionsSeedingError(seedPermissions)
  //   } else {
  //     const existedPermissionsCount = (
  //       await this.serviceManager.get(AuthService).findAllPermissions()
  //     )?.length

  //     if (existedPermissionsCount !== dataPermission.length) {
  //       const removeOldPermissions = this.serviceManager
  //         .get(AuthService)
  //         .deleteAllPermissions()
  //       if (removeOldPermissions) {
  //         this.logger.log(
  //           `Renewing ${DATABASE_COLLECTION_NAME.PERMISSION} table...`
  //         )

  //         const seedPermissions = await this.serviceManager
  //           .get(AuthService)
  //           .savePermissions(dataPermissionFormatted)
  //         if (dataPermission.length !== seedPermissions?.length)
  //           failedPermissions = findPermissionsSeedingError(seedPermissions)
  //       }
  //     }
  //   }

  //   failedPermissions?.length
  //     ? this.logger.error(`Permissions seeding error: ${failedPermissions}`)
  //     : this.logger.verbose(
  //         `${DATABASE_COLLECTION_NAME.PERMISSION} collection checked!`
  //       )
  // }
}
