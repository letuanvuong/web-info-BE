import { Global, Module } from '@nestjs/common'

import { MyEventEmitter } from './my-event-emitter'

@Global()
@Module({
  providers: [MyEventEmitter],
  exports: [MyEventEmitter],
})
export class MyEventEmitterModule {}
