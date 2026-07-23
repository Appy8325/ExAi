"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Input, PageHeader } from "@concourse/ui";
import { getApiBaseUrl } from "@/lib/api/config";
import { createClient } from "@/lib/supabase/client";

type Exhibitor = { boothName: string; boothNumber: string | null; description: string | null; logoUrl: string | null; contactEmail: string | null; contactPhone: string | null };

export default function ExhibitorDetailClient({ eventId, exhibitorId, organizationId }: { eventId: string; exhibitorId: string; organizationId: string }) {
  const [exhibitor, setExhibitor] = useState<Exhibitor | null>();
  useEffect(() => { createClient().auth.getSession().then(async ({ data }) => { const response = await fetch(`${getApiBaseUrl()}/v1/organizations/${organizationId}/events/${eventId}/exhibitors/${exhibitorId}`, { headers: { authorization: `Bearer ${data.session?.access_token ?? ""}` } }); setExhibitor(response.ok ? await response.json() : null); }); }, [eventId, exhibitorId, organizationId]);
  if (exhibitor === undefined) return <p className="text-secondary">Loading exhibitorâ€¦</p>;
  if (!exhibitor) return <p className="text-secondary">Exhibitor not found.</p>;
  async function save(formData: FormData) { const { data } = await createClient().auth.getSession(); await fetch(`${getApiBaseUrl()}/v1/organizations/${organizationId}/events/${eventId}/exhibitors/${exhibitorId}`, { method: "PATCH", headers: { authorization: `Bearer ${data.session?.access_token ?? ""}`, "content-type": "application/json" }, body: JSON.stringify({ boothName: formData.get("boothName"), boothNumber: formData.get("boothNumber") || null, logoUrl: formData.get("logoUrl") || null, description: formData.get("description") || null, contactEmail: formData.get("contactEmail") || null }) }); location.reload(); }
  async function archive() { const { data } = await createClient().auth.getSession(); await fetch(`${getApiBaseUrl()}/v1/organizations/${organizationId}/events/${eventId}/exhibitors/${exhibitorId}/archive`, { method: "POST", headers: { authorization: `Bearer ${data.session?.access_token ?? ""}` } }); location.href = "../"; }
  const initials = exhibitor.boothName.slice(0, 2).toUpperCase();
  return <div className="space-y-6"><Link href="../" className="text-body-sm text-secondary hover:text-primary">â† Exhibitors</Link><div className="flex items-center gap-4">{exhibitor.logoUrl ? <Image alt={`${exhibitor.boothName} logo`} className="size-16 rounded-xl border border-default bg-surface object-contain" height={64} src={exhibitor.logoUrl} unoptimized width={64}/> : <div aria-label={`${exhibitor.boothName} logo placeholder`} className="flex size-16 items-center justify-center rounded-xl bg-brand-subtle text-title font-semibold text-brand">{initials}</div>}<PageHeader title={exhibitor.boothName} description="Exhibitor company profile."/></div><form action={save} className="space-y-3 rounded-xl border border-default bg-surface p-6"><Input name="boothName" defaultValue={exhibitor.boothName}/><Input name="boothNumber" defaultValue={exhibitor.boothNumber ?? ""}/><Input name="logoUrl" type="url" defaultValue={exhibitor.logoUrl ?? ""}/><Input name="contactEmail" defaultValue={exhibitor.contactEmail ?? ""}/><Input name="description" defaultValue={exhibitor.description ?? ""}/><div className="flex gap-2"><Button type="submit">Save exhibitor</Button><Button type="button" variant="secondary" onClick={archive}>Archive</Button></div></form></div>;
}
