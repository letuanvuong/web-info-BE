import { Global, Module } from '@nestjs/common'

import { MyContext } from './my-context'

@Global()
@Module({
  providers: [MyContext],
  exports: [MyContext],
})
export class MyContextModule {}
