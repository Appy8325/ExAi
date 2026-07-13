import "server-only";

import type { Session, User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

/**
 * Returns the raw session for token forwarding only. Do not use its user object
 * for authorization; use getAuthenticatedUser instead.
 */
export async function getSession(): Promise<Session | null> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
}

/** Returns a user confirmed by Supabase Auth for server-side use. */
export async function getAuthenticatedUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return error ? null : user;
}
