import { Module } from '@nestjs/common'
import { NodeModule } from 'src/modules/node/node.module'
// import { RoleModule } from 'src/modules/ChucDanh/role.module'
import { WebhookModule } from 'src/modules/webhook/webhook.module'

import { AuthModule } from '../../auth/auth.module'
import { UserModule } from '../../user/User.module'
import { MyEventHandlerService } from './my-event-handler.service'

@Module({
  imports: [AuthModule, NodeModule, UserModule, WebhookModule],
  providers: [MyEventHandlerService],
})
export class MyEventHandlerModule {}
