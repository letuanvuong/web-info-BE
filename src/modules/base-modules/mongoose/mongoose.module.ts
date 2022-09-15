import { MongooseModule as MGModule } from '@nestjs/mongoose'

import { ConfigurationService } from '../configuration/config.service'

const MongooseModule = MGModule.forRootAsync({
  useFactory: async (configService: ConfigurationService) => {
    return {
      uri: configService.getMongoURI(),
      /**
       * I add this opt because of DeprecationWarning
       * @See: https://mongoosejs.com/docs/deprecations.html#findandmodify
       */
      useFindAndModify: false,
    }
  },
  inject: [ConfigurationService],
})

export { MongooseModule }
