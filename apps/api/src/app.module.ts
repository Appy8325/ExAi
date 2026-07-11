import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { EventsModule } from './modules/events/events.module';
import { FloorModule } from './modules/floor/floor.module';
import { ExhibitorsModule } from './modules/exhibitors/exhibitors.module';
import { ProductsModule } from './modules/products/products.module';
import { RegistrationsModule } from './modules/registrations/registrations.module';
import { AgendaModule } from './modules/agenda/agenda.module';
import { EngagementModule } from './modules/engagement/engagement.module';
import { MatchmakingModule } from './modules/matchmaking/matchmaking.module';
import { KnowledgeBaseModule } from './modules/knowledge-base/knowledge-base.module';
import { AiModule } from './modules/ai/ai.module';
import { FilesModule } from './modules/files/files.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { BillingModule } from './modules/billing/billing.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { ApiKeysModule } from './modules/api-keys/api-keys.module';
import { SearchModule } from './modules/search/search.module';
import { AdminModule } from './modules/admin/admin.module';
import { HealthModule } from './modules/health/health.module';

import supabaseConfig from './config/supabase.config';

/**
 * Root AppModule — Milestone 0 scaffolding. Wires every one of the 20 module
 * stubs from docs/18-api-architecture.md §1 (each still an empty shell, see
 * its own file) plus global config. No cross-module providers/guards are
 * wired yet; that lands per-domain in the milestone that implements it.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [supabaseConfig],
    }),
    AuthModule,
    UsersModule,
    OrganizationsModule,
    EventsModule,
    FloorModule,
    ExhibitorsModule,
    ProductsModule,
    RegistrationsModule,
    AgendaModule,
    EngagementModule,
    MatchmakingModule,
    KnowledgeBaseModule,
    AiModule,
    FilesModule,
    NotificationsModule,
    BillingModule,
    WebhooksModule,
    ApiKeysModule,
    SearchModule,
    AdminModule,
    HealthModule,
  ],
})
export class AppModule {}
