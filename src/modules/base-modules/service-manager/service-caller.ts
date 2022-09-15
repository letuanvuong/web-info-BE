import { Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { SubType } from 'src/helper'

/** có thể inject mà ko cần import module vì đã là global */
@Injectable()
export class ServiceCaller {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  /**
   * @note can return undefined
   * @summary dùng gọi gián tiếp function trong các service
   * @summary customed on EventEmitter2.emitAsync
   * @see https://github.com/EventEmitter2/EventEmitter2#emitteremitasyncevent--eventns-arg1-arg2-
   */
  async call<
    ServiceClass,
    /**
     * SubType bên dưới nhằm giữ lại các field loại function trong ServiceClass
     * từ đó dùng keyof lấy dc list tên fuction trong ServiceClass
     */
    MethodName extends keyof SubType<ServiceClass, (...args: any) => any>,
  >(
    serviceClass: new (...args: any) => ServiceClass,
    methodName: MethodName | any,
    ...methodArgs: Parameters<ServiceClass[MethodName] | any>
  ): Promise<ReturnType<ServiceClass[MethodName] | any>> {
    const eventName = `${serviceClass.name}.${methodName}`
    const results = await this.eventEmitter.emitAsync(
      eventName,
      eventName,
      ...methodArgs,
    )

    if (results?.length > 1) {
      throw new Error('Only allow one listener to listen on MyEventEmitter')
    }
    if (!results || results?.length < 1) {
      throw new Error(`Not found event handler for ${eventName}`)
    }
    return results?.[0]
  }
}
