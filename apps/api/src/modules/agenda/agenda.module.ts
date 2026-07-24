import { Module } from '@nestjs/common';

import { AgendaSessionsRepository } from './agenda-sessions.repository';
import { AgendaSessionsService } from './agenda-sessions.service';
import { SpeakersRepository } from './speakers.repository';
import { SpeakersService } from './speakers.service';

@Module({
  providers: [
    AgendaSessionsRepository,
    AgendaSessionsService,
    SpeakersRepository,
    SpeakersService,
  ],
  exports: [
    AgendaSessionsService,
    SpeakersService,
  ],
})
export class AgendaModule {}
