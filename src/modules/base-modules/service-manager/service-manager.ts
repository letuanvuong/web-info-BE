import { Injectable } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'

@Injectable()
export class ServiceManager {
  constructor(private moduleRef: ModuleRef) {}

  /**
   * lấy ra instance của một service, truyền vào ServiceClass
   */
  getGlobal<ServiceClass>(
    serviceClass: new (...args: any) => ServiceClass,
  ): ServiceClass {
    return this.moduleRef.get(serviceClass, { strict: false })
  }

  /** alias of getGlobal */
  get = this.getGlobal
}
