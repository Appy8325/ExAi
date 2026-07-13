"use client";

import { createBrowserClient } from "@supabase/ssr";

import { getSupabasePublicConfig } from "./config";

/** Creates the cookie-backed Supabase client for Client Components. */
export function createClient() {
  const { url, publishableKey } = getSupabasePublicConfig();

  return createBrowserClient(url, publishableKey);
}
