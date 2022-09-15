import { Injectable } from '@nestjs/common'
import { PubSub } from 'graphql-subscriptions'

@Injectable()
export class CommonService {
  private pubSub = null

  formatNumber(number: any) {
    return `${number || number === 0 ? number : ''}`.replace(
      /\B(?=(\d{3})+(?!\d))/g,
      ',',
    )
  }

  getPubSub(): PubSub {
    if (!this.pubSub) {
      this.pubSub = new PubSub()
      return this.pubSub
    } else {
      return this.pubSub
    }
  }
}
