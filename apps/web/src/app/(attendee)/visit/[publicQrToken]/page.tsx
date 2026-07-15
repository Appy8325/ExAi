import { Suspense } from "react";
import { ApiError, getPublicBooth } from "@concourse/api-client";
import { EmptyState } from "@concourse/ui";

import { getApiBaseUrl } from "@/lib/api/config";

import { BoothExperience } from "./booth-experience";
import BoothLoading from "./loading";

export default function BoothPage({ params, searchParams }: { params: Promise<{ publicQrToken: string }>; searchParams: Promise<{ connected?: string }> }) {
  return <Suspense fallback={<BoothLoading />}><Booth params={params} searchParams={searchParams} /></Suspense>;
}

async function Booth({ params, searchParams }: { params: Promise<{ publicQrToken: string }>; searchParams: Promise<{ connected?: string }> }) {
  const [{ publicQrToken }, { connected }] = await Promise.all([params, searchParams]);
  try {
    const booth = await getPublicBooth({ baseUrl: getApiBaseUrl() }, publicQrToken);
    return <BoothExperience booth={booth} connected={connected === "1"} />;
  } catch (error) {
    const unavailable = error instanceof ApiError && error.status === 404;
    return <main className="mx-auto min-h-screen max-w-(--mq-attendee-content-max) bg-canvas px-gutter py-section"><EmptyState description={unavailable ? "This QR code is no longer active." : "Check your connection and try again."} title={unavailable ? "Booth unavailable" : "Unable to load this booth"} /></main>;
  }
}
