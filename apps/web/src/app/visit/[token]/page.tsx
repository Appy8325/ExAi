import Link from "next/link";
import { notFound } from "next/navigation";

import { getPublicBooth } from "@concourse/api-client";
import { getApiBaseUrl } from "@/lib/api/config";
import { BoothLeadForm } from "./booth-lead-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function VisitBoothPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const apiBase = getApiBaseUrl();
  const booth = await getPublicBooth({ baseUrl: apiBase }, token).catch(() => null);

  if (!booth) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 sm:px-10">
      <Link href="/demo#exhibitors" className="mb-6 inline-flex items-center gap-1 text-sm text-link hover:underline">
        <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 12l-4-4 4-4" />
        </svg>
        Back to demo
      </Link>

      {booth.logoUrl ? (
        <img src={booth.logoUrl} alt={booth.companyName} className="mb-4 max-h-16 object-contain" />
      ) : null}

      <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">{booth.companyName}</h1>
      <p className="mt-1 text-sm text-secondary">
        {booth.boothName} &middot; Booth {booth.boothNumber ?? "\u2014"}
      </p>
      {booth.eventSlug ? (
        <p className="mt-1 text-xs text-muted">{booth.eventSlug}</p>
      ) : null}

      {booth.description ? (
        <p className="mt-4 text-sm text-secondary leading-relaxed">{booth.description}</p>
      ) : null}

      {booth.website ? (
        <a
          href={booth.website}
          className="mt-3 inline-block text-sm text-link hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {booth.website}
        </a>
      ) : null}

      {booth.privacyPolicyUrl ? (
        <a
          href={booth.privacyPolicyUrl}
          className="mt-1 block text-sm text-link hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Privacy policy
        </a>
      ) : null}

      {booth.resources.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-primary">Resources</h2>
          <ul className="mt-2 space-y-1">
            {booth.resources.map((r) => (
              <li key={r.id}>
                <a
                  href={r.href}
                  className="text-sm text-link hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {r.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {booth.leadForm ? (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-primary">{booth.leadForm.name}</h2>
          {booth.leadForm.description ? (
            <p className="mt-1 text-sm text-secondary">{booth.leadForm.description}</p>
          ) : null}
          {booth.leadForm.consentText ? (
            <p className="mt-3 text-xs text-muted italic">
              {booth.leadForm.consentText}
            </p>
          ) : null}
          <BoothLeadForm fields={booth.leadForm.fields} token={token} />
        </section>
      ) : null}
    </div>
  );
}