import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import Link from "next/link";

export const dynamic = "force-dynamic";

type DemoBooth = {
  id: string;
  name: string;
  number: string;
  organizationId: string;
  relationshipId?: string;
};

export default async function DemoPage() {
  const exhibitors = await readDemoBooths();
  return (
    <main className="min-h-screen bg-canvas px-8 py-12 text-primary">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 rounded-2xl border border-strong bg-surface p-8 shadow-sm">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-secondary">ExAi local demo</p>
          <h1 className="text-3xl font-semibold">Demo launcher</h1>
          <p className="text-secondary">This page surfaces the main flows for the hackathon demo without requiring UUIDs.</p>
        </div>
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-strong bg-sunken p-5">
            <h2 className="text-lg font-semibold">Organizations and exhibitors</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {exhibitors.length ? exhibitors.map((booth) => (
                <li className="space-x-3" key={booth.id}>
                  <span>{booth.name} organization · Booth {booth.number}</span>
                  <Link className="text-primary underline" href={`/exhibit/${booth.organizationId}/dashboard/${booth.id}`}>Dashboard</Link>
                  <Link className="text-primary underline" href={`/visit/${booth.id}`}>Booth</Link>
                  <Link className="text-primary underline" href={`/visit/${booth.id}`}>QR link</Link>
                  {booth.relationshipId ? <Link className="text-primary underline" href={`/exhibit/${booth.organizationId}/relationships/${booth.relationshipId}`}>Workspace</Link> : null}
                </li>
              )) : <li>Run <code>pnpm db:seed:demo</code> to load the local demo.</li>}
            </ul>
          </div>
        </section>
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-strong bg-sunken p-5">
            <h2 className="text-lg font-semibold">Relationship workspaces</h2>
            <p className="mt-2 text-sm text-secondary">Open a seeded workspace directly from the exhibitor list above.</p>
          </div>
          <div className="rounded-xl border border-strong bg-sunken p-5">
            <h2 className="text-lg font-semibold">Dashboard links</h2>
            <p className="mt-2 text-sm text-secondary">Dashboard and booth links use the current local seed, not hard-coded UUIDs.</p>
          </div>
          <div className="rounded-xl border border-strong bg-sunken p-5">
            <h2 className="text-lg font-semibold">QR codes</h2>
            <p className="mt-2 text-sm text-secondary">Open the attendee booth experience from the generated QR landing page.</p>
          </div>
        </section>
      </div>
    </main>
  );
}

async function readDemoBooths(): Promise<DemoBooth[]> {
  try {
    return JSON.parse(await readFile(resolve(process.cwd(), "../../demo/qr/manifest.json"), "utf8")) as DemoBooth[];
  } catch {
    return [];
  }
}
