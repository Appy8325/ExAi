import Link from "next/link";
import Image from "next/image";

import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { Card } from "@concourse/ui";

import { getPublicDemoOverview } from "@concourse/api-client";

import { getApiBaseUrl } from "@/lib/api/config";
import {
  DemoMobileNav,
  DemoPageHeader,
  DemoUnavailable,
} from "@/components/demo/shell";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const sid = (id: string) => [
  { label: "Dashboard", href: `/demo/exhibitor/${id}` },
  { label: "Products", href: `/demo/exhibitor/${id}/products` },
  { label: "Visitors", href: `/demo/exhibitor/${id}/visitors` },
  { label: "Analytics", href: `/demo/exhibitor/${id}/analytics` },
  { label: "AI Insights", href: `/demo/exhibitor/${id}/ai-insights` },
  { label: "QR", href: `/demo/exhibitor/${id}/qr` },
  { label: "Booth Preview", href: `/demo/exhibitor/${id}/preview` },
];

export default async function ExhibitorQrPage({
  params,
}: {
  params: Promise<{ eventExhibitorId: string }>;
}) {
  const { eventExhibitorId } = await params;
  const apiBase = getApiBaseUrl();
  const overview = await getPublicDemoOverview({ baseUrl: apiBase }).catch(
    () => null,
  );
  if (!overview) return <DemoUnavailable />;

  const booth = overview.events
    .flatMap((e) => e.exhibitors)
    .find((b) => b.id === eventExhibitorId);
  if (!booth) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? `https://${process.env.VERCEL_URL ?? "exai.com"}`;
  const qrDataUrl = booth.publicQrToken
    ? await QRCode.toDataURL(`${baseUrl}/visit/${booth.publicQrToken}`, {
        width: 256,
        margin: 2,
        color: { dark: "#111111", light: "#ffffff" },
      })
    : null;

  return (
    <div className="space-y-8 px-6 py-8 sm:px-10 sm:py-10">
      <DemoMobileNav
        items={sid(eventExhibitorId)}
        currentHref={`/demo/exhibitor/${eventExhibitorId}/qr`}
      />

      <DemoPageHeader
        eyebrow="Exhibitor workspace"
        title="Booth QR"
        description="Each booth has a unique QR token that attendees scan to access the public booth — read-only demo."
        badge="QR"
      />

      {booth.publicQrToken ? (
        <div className="space-y-6">
          <Card>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Public QR token
            </p>
            <p className="mt-2 break-all font-mono text-base text-primary">
              {booth.publicQrToken}
            </p>
          </Card>

          <Card>
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="mx-auto flex h-44 w-44 max-w-full items-center justify-center rounded-xl bg-white p-3 shadow-1 overflow-hidden">
                {qrDataUrl ? (
                  <Image
                    src={qrDataUrl}
                    alt="Booth QR code"
                    width={256}
                    height={256}
                    className="h-full w-full object-contain"
                    unoptimized
                  />
                ) : (
                  <p className="text-xs text-muted">No QR available</p>
                )}
              </div>
              <p className="text-xs text-muted">
                Scan to open booth — {baseUrl}/visit/{booth.publicQrToken}
              </p>
            </div>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/visit/${booth.publicQrToken}`}
              className="inline-flex h-10 items-center rounded-lg bg-status-success-solid px-4 text-sm font-semibold text-on-brand"
            >
              Open public booth page
            </Link>
            <Link
              href={`/demo/exhibitor/${eventExhibitorId}/preview`}
              className="inline-flex h-10 items-center rounded-lg border border-default bg-surface px-4 text-sm font-semibold text-primary"
            >
              Booth Preview
            </Link>
          </div>
        </div>
      ) : (
        <Card>
          <div className="rounded-xl border border-dashed border-default bg-surface p-8 text-center">
            <p className="text-sm text-muted">
              No QR credential has been generated for this booth.
            </p>
            <p className="mt-1 text-xs text-secondary">
              In the real workspace, exhibitors generate, download, and print
              QR codes for their booths.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
