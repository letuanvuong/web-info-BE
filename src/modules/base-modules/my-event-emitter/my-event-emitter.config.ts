import { EventEmitterModuleOptions } from '@nestjs/event-emitter/dist/interfaces'

/** @see https://docs.nestjs.com/techniques/events#events */
export const EventEmitterConfig: EventEmitterModuleOptions = {
  delimiter: '.',
  wildcard: true,
}
