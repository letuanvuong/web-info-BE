/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { NodeService } from 'src/modules/node/node.service'
// import { RoleService } from 'src/modules/ChucDanh/role.service'
import { WebhookService } from 'src/modules/webhook/webhook.service'

import { AuthService } from '../../auth/auth.service'
import { UserService } from '../../user/User.service'
import { MyContext } from '../my-context/my-context'

@Injectable()
export class MyEventHandlerService {
  /**
   * Lưu ý: tên các service inject vào constructor cần khớp với tên class
   * để dùng trong hàm handler
   */
  constructor(
    private readonly AuthService: AuthService,
    private readonly NodeService: NodeService,
    // private readonly RoleService: RoleService,
    private readonly UserService: UserService,
    private readonly WebhookService: WebhookService,
  ) {}

  /**
   * @see https://docs.nestjs.com/techniques/events#events
   */
  @OnEvent('**')
  async myEventHandler(eventName: string, ...payload: any) {
    const [serviceName, methodName] = eventName.split('.')
    // validate
    if (!serviceName || !methodName)
      throw new Error('invalid event name for myEventHandler')
    if (!this[serviceName]) {
      throw new Error(
        `${serviceName} not available in ${MyEventHandlerService.name}`,
      )
    }
    if (!this[serviceName][methodName]) {
      throw new Error(`${methodName} not available in ${serviceName}`)
    }
    //
    const output = await this[serviceName][methodName](...payload)
    return output
  }
}
