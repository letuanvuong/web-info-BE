import { Module } from '@nestjs/common'

import { FileUploaderController } from './fileUploader.controller'

@Module({
  controllers: [FileUploaderController],
})
export class FileUploaderModule {}
