import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
// import { Authenticated } from '../auth/authenticated.decorator'
import { v1 } from 'uuid'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const FfmpegCommand = require('fluent-ffmpeg')

FfmpegCommand.setFfmpegPath(ffmpegInstaller.path)

const editFileName = (_, file, callback) => {
  callback(null, v1() + '--' + file.originalname)
}

export const fileFilter = (_, file, callback) => {
  if (
    !file.originalname.match(
      /\.(xls|XLS|xlsx|XLSX|doc|DOC|docx|DOCX|pdf|PDF|ppt|PPT|pptx|PPTX|jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|svg|SVG|bmp|BMP|dcm|DCM|avi|AVI|flv|FLV|wmv|WMV|mov|MOV|mp4|MP4|webm|WEBM|mkv|MKV|m4v|M4V|mpg|MPG|mpeg|MPEG|vob|VOB)$/,
    )
  ) {
    return callback(new Error('Only file are allowed!'), false)
  }
  callback(null, true)
}

export const imageFilter = (_, file, callback) => {
  if (
    !file.originalname.match(
      /\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|svg|SVG|bmp|BMP)$/,
    )
  ) {
    return callback(new Error('Only image are allowed!'), false)
  }
  callback(null, true)
}

export const videoFilter = (_, file, callback) => {
  if (
    !file.originalname.match(/\.(mp4|MP4|webm|WEBM|avi|AVI|m4v|M4V|vob|VOB)$/)
  ) {
    return callback(new Error('Only video are allowed!'), false)
  }
  callback(null, true)
}

export const documentFilter = (_, file, callback) => {
  if (
    !file.originalname.match(/\.(doc|DOC|docx|DOCX|pdf|PDF|ppt|PPT|pptx|PPTX)$/)
  ) {
    return callback(new Error('Only powerpoint are allowed!'), false)
  }
  callback(null, true)
}

@Controller()
export class FileUploaderController {
  // images
  @Post('webinfoImageUpload')
  // @Authenticated()
  @UseInterceptors(
    FilesInterceptor('file', 10, {
      storage: diskStorage({
        destination: `${process.env.FILE_PATH || 'files'}/images`,
        filename: editFileName,
      }),
      fileFilter: imageFilter,
    }),
  )
  async uploadImage(@UploadedFiles() files: Express.Multer.File[]) {
    const response = []
    files.forEach((file) => {
      const fileResponse = {
        originalname: file.originalname,
        filename: file.filename,
      }
      response.push(fileResponse)
    })
    return response
  }
  // videos
  @Post('webinfoVideoUpload')
  @UseInterceptors(
    FilesInterceptor('file', 10, {
      storage: diskStorage({
        destination: `${process.env.FILE_PATH || 'files'}/videos`,
        filename: editFileName,
      }),
      fileFilter: videoFilter,
    }),
  )
  async uploadVideo(@UploadedFiles() files: Express.Multer.File[]) {
    const response = []
    files.forEach((file) => {
      const fileResponse = {
        originalname: file.originalname,
        filename: file.filename,
      }
      response.push(fileResponse)
      // const infs = FfmpegCommand()
      // const fileName = file.filename?.split('.')?.shift()
      // infs
      //   .addInput(
      //     `${process.env.FILE_PATH || 'files'}/documents/${file.filename}`,
      //   )
      //   .outputOptions([
      //     // '-map 0:0',
      //     // '-map 0:1',
      //     // '-map 0:0',
      //     // '-map 0:1',
      //     // '-s:v:0 2160x3840',
      //     // '-c:v:0 libx264',
      //     // '-b:v:0 2000k',
      //     // '-s:v:1 960x540',
      //     // '-c:v:1 libx264',
      //     // '-b:v:1 365k',
      //     // '-var_stream_map', '"v:0,a:0 v:1,a:1"',
      //     '-master_pl_name master.m3u8',
      //     '-f hls',
      //     '-max_muxing_queue_size 1024',
      //     '-hls_time 1',
      //     '-hls_list_size 0',
      //     '-hls_segment_filename',
      //     `${
      //       process.env.FILE_PATH || 'files'
      //     }/documents/${fileName}/v%v/fileSequence%d.ts`,
      //   ])
      //   .output(
      //     `${
      //       process.env.FILE_PATH || 'files'
      //     }/documents/${fileName}/v%v/${fileName}.m3u8`,
      //   )
      //   .on('start', function (commandLine) {
      //     console.log('Spawned Ffmpeg with command: ' + commandLine)
      //   })
      //   .on('error', function (err, stdout, stderr) {
      //     console.log('An error occurred: ' + err.message, err, stderr)
      //   })
      //   .on('progress', function (progress) {
      //     console.log('Processing: ' + progress.percent + '% done')
      //   })
      //   .on('end', function (err, stdout, stderr) {
      //     console.log('Finished processing!' /*, err, stdout, stderr*/)
      //   })
      //   .run()
      // const fileResponse = {
      //   originalname: file.originalname,
      //   filename: `${fileName}/v0/${fileName}.m3u8`,
      // }
    })
    return response
  }

  // documents
  @Post('webinfoDocumentUpload')
  @UseInterceptors(
    FilesInterceptor('file', 10, {
      storage: diskStorage({
        destination: `${process.env.FILE_PATH || 'files'}/documents`,
        filename: editFileName,
      }),
      fileFilter: fileFilter,
    }),
  )
  async uploadDocument(@UploadedFiles() files: Express.Multer.File[]) {
    const response = []
    files.forEach((file) => {
      const fileResponse = {
        originalname: file.originalname,
        filename: file.filename,
      }
      response.push(fileResponse)
    })
    return response
  }
}
