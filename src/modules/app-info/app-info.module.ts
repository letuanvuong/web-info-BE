import { Module } from '@nestjs/common'

import { AppInfoResolver } from './app-info.resolver'

@Module({
  providers: [AppInfoResolver],
})
export class AppInfoModule {}
