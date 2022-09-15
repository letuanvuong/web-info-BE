import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

// import { AuthController } from './auth.controller'
import { AuthResolver } from './auth.resolver'
import { AuthService } from './auth.service'

// import { PermissionSchema } from './schemas/permission.schema'
// import { RoleEntity, RoleSchema } from './schemas/role.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      // { name: 'PermissionEntity', schema: PermissionSchema },
      // { name: RoleEntity.name, schema: RoleSchema }
    ]),
  ],
  providers: [AuthService, AuthResolver],
  exports: [AuthService],
  // controllers: [AuthController]
})
export class AuthModule {}
