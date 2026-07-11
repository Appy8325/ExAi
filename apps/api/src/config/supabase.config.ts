import { registerAs } from '@nestjs/config';

/**
 * Supabase env namespace (docs/00-foundation.md §14 Amendment A5). Reads the
 * env vars apps/api needs to eventually verify Supabase-issued JWTs; this is
 * config/tooling wiring only, not the auth verification logic itself (that
 * lands with the AuthModule rewrite noted in modules/auth/auth.module.ts).
 */
export default registerAs('supabase', () => ({
  url: process.env.API_SUPABASE_URL,
  serviceRoleKey: process.env.API_SUPABASE_SERVICE_ROLE_KEY,
  jwtSecret: process.env.API_SUPABASE_JWT_SECRET,
}));
