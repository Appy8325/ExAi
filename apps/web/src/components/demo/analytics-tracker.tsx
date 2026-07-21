"use client";

import { useEffect, useRef } from "react";
import { trackDemoEvent } from "@concourse/api-client";
import { getApiBaseUrl } from "@/lib/api/config";

export function TrackVisit({ boothId }: { boothId: string }) {
  const tracked = useRef(false);
  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    const apiBase = getApiBaseUrl();
    trackDemoEvent({ baseUrl: apiBase }, { type: "booth_visit", boothId }).catch(() => {});
  }, [boothId]);
  return null;
}

export function TrackEvent({
  event,
}: {
  event: Parameters<typeof trackDemoEvent>[1];
}) {
  const tracked = useRef(false);
  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    const apiBase = getApiBaseUrl();
    trackDemoEvent({ baseUrl: apiBase }, event).catch(() => {});
  }, [event]);
  return null;
}
