import { Module } from '@nestjs/common';
import { OrganizationsModule } from '../organizations/organizations.module';
import { SupabaseRequestContextGuard } from './supabase-request-context.guard';
import { RequestContextInterceptor } from './request-context.interceptor';
import { SupabaseAuthService } from './supabase-auth.service';

/**
 * AuthModule — owns /v1/auth/* (docs/18-api-architecture.md §1).
 *
 * Milestone 0 scaffolding only: empty shell module, no providers/controllers wired,
 * and NO authentication implementation of any kind (no argon2id, no OAuth, no
 * passkeys, no session issuance).
 *
 * Per docs/00-foundation.md §14 Amendment A5, Supabase Auth now supersedes the
 * in-house NestJS auth design described in docs/19-authentication-strategy.md
 * (that document is flagged pending detailed revision and is not implemented as
 * written). The eventual shape of this module is a guard/strategy that verifies
 * Supabase-issued JWTs (access/refresh tokens, see apps/api/src/config/supabase.config.ts
 * for the env namespace) rather than an in-house credential/session flow.
 *
 * Authentication is explicitly out of scope for Milestone 0; real content here
 * lands only once docs 19-20 are substantively rewritten against Supabase Auth,
 * per a later milestone in docs/45-implementation-roadmap.md.
 */
@Module({ imports: [OrganizationsModule], providers: [SupabaseRequestContextGuard, RequestContextInterceptor, SupabaseAuthService], exports: [SupabaseRequestContextGuard, RequestContextInterceptor, SupabaseAuthService] })
export class AuthModule {}
