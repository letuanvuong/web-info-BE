import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { firstValueFrom, timeout } from 'rxjs'
import { TELE_API_PREFIX } from 'src/constant'

import { ConfigurationService } from '../base-modules/configuration/config.service'

@Injectable()
export class WebhookService {
  constructor(
    private httpService: HttpService,
    private configurationService: ConfigurationService,
  ) {}

  async sendMessageTelegram(content: string = '') {
    try {
      const teleBotToken = this.configurationService.getTeleBotToken()
      const teleChannelId = this.configurationService.getTeleChannelId()
      // disable when not found env
      if (!teleBotToken || !teleChannelId) return

      const apiUrl = `${TELE_API_PREFIX}${teleBotToken}/sendMessage`

      const observable = this.httpService
        .post(
          apiUrl,
          {
            chat_id: teleChannelId,
            text: content,
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
          },
          { headers: { 'Content-Type': 'application/json' } },
        )
        .pipe(timeout(5000))
      await firstValueFrom(observable)
    } catch (error) {
      console.error(
        '❌ Error while call sendMessageTelegram:',
        error?.response?.data || error,
      )
    }
  }
}
