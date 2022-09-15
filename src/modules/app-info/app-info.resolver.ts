import { Query, Resolver } from '@nestjs/graphql'
import * as AppInfoJson from 'src/appInfo.json'
import { AppInfo } from 'src/schema'

@Resolver('AppInfo')
export class AppInfoResolver {
  @Query()
  appInfo(): AppInfo {
    return {
      version: AppInfoJson.version,
    }
  }
}
