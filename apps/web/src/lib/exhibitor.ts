import {
  getExhibitorOverview,
  getExhibitorWorkspace,
} from "@concourse/api-client";

import { getApiBaseUrl } from "@/lib/api/config";
import { createClient } from "@/lib/supabase/server";

async function client() {
  const {
    data: { session },
  } = await (await createClient()).auth.getSession();
  if (!session) return undefined;
  return {
    baseUrl: getApiBaseUrl(),
    accessToken: session.access_token,
    fetch: (input: RequestInfo | URL, init?: RequestInit) =>
      fetch(input, { ...init, cache: "no-store" }),
  };
}

export async function loadExhibitorOverview() {
  const api = await client();
  if (!api) return undefined;
  try {
    return await getExhibitorOverview(api);
  } catch {
    return undefined;
  }
}

export async function loadExhibitorWorkspace(
  organizationId: string,
  eventExhibitorId: string,
) {
  const api = await client();
  if (!api) return undefined;
  try {
    return await getExhibitorWorkspace(api, organizationId, eventExhibitorId);
  } catch {
    return undefined;
  }
}
