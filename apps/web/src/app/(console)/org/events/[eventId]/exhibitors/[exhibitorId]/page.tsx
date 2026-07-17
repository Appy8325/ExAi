import Link from "next/link";
import { Card, StatusBadge, Input } from "@concourse/ui";

export default async function ExhibitorProfilePage({
  params,
}: {
  params: Promise<{ eventId: string; exhibitorId: string }>;
}) {
  const { eventId } = await params;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/org/events/${eventId}/exhibitors`}
          className="text-sm text-secondary hover:text-primary"
        >
          &larr; Back to exhibitors
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-strong bg-surface">
        <div className="h-32 bg-gradient-to-r from-brand/20 to-brand/5" />
        <div className="relative px-6 pb-6">
          <div className="-mt-8 flex h-16 w-16 items-center justify-center rounded-xl border-4 border-surface bg-sunken text-xl font-bold text-primary shadow-sm">
            AC
          </div>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-primary">Acme Corp</h1>
              <p className="mt-1 text-secondary">Booth 42</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="inline-flex h-9 items-center justify-center gap-2 rounded-sm border border-strong bg-surface px-3 text-sm font-medium text-primary hover:bg-sunken">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-primary">
            Company Details
          </h2>
          <div className="mt-4 grid gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-secondary">
                Company Name
              </label>
              <Input defaultValue="Acme Corp" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-secondary">
                Booth Number
              </label>
              <Input defaultValue="42" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-secondary">
                Website
              </label>
              <Input defaultValue="https://acme.com" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-secondary">
                Contact Email
              </label>
              <Input defaultValue="contact@acme.com" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-secondary">
                Description
              </label>
              <textarea
                className="min-h-20 w-full rounded-sm border border-strong bg-surface px-(--spacing-control-px) py-2 text-body text-primary outline-none placeholder:text-muted"
                defaultValue="Leading provider of innovative solutions for modern businesses."
              />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-primary">Branding</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-secondary">
                Logo
              </label>
              <div className="flex items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-strong bg-sunken text-sm text-muted">
                  Logo
                </div>
                <button type="button" className="inline-flex h-9 items-center justify-center gap-2 rounded-sm border border-strong bg-surface px-3 text-sm font-medium text-primary hover:bg-sunken">
                  Upload Logo
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-secondary">
                Banner Image
              </label>
              <div className="flex items-center gap-3">
                <div className="flex h-16 w-32 items-center justify-center rounded-lg border border-strong bg-sunken text-sm text-muted">
                  Banner
                </div>
                <button type="button" className="inline-flex h-9 items-center justify-center gap-2 rounded-sm border border-strong bg-surface px-3 text-sm font-medium text-primary hover:bg-sunken">
                  Upload Banner
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-secondary">
                Brand Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  className="h-9 w-9 cursor-pointer rounded border border-strong"
                  defaultValue="#6366f1"
                />
                <Input defaultValue="#6366f1" className="flex-1" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-primary">
            Marketing Assets
          </h2>
          <p className="mt-4 text-sm text-secondary">
            No collateral uploaded yet.
          </p>
          <button type="button" className="mt-3 inline-flex h-9 items-center justify-center gap-2 rounded-sm border border-strong bg-surface px-3 text-sm font-medium text-primary hover:bg-sunken">
            Upload Collateral
          </button>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-primary">Documents</h2>
          <p className="mt-4 text-sm text-secondary">
            No documents uploaded yet.
          </p>
          <button type="button" className="mt-3 inline-flex h-9 items-center justify-center gap-2 rounded-sm border border-strong bg-surface px-3 text-sm font-medium text-primary hover:bg-sunken">
            Upload Documents
          </button>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-primary">AI Memory Dump</h2>
          <p className="mt-4 text-sm text-secondary">
            Store notes, context, and reference information the AI should
            remember about this exhibitor.
          </p>
          <textarea
            className="mt-3 min-h-32 w-full rounded-sm border border-strong bg-surface px-(--spacing-control-px) py-2 text-body text-primary outline-none placeholder:text-muted"
            placeholder="Add notes for AI memory..."
            defaultValue="Key contacts: Jane Smith (CEO), John Doe (CTO). Previous event feedback: Excellent booth visitors. Preferred meeting times: Mornings."
          />
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-primary">Team Members</h2>
          <p className="mt-4 text-sm text-secondary">
            No team members assigned yet.
          </p>
          <button type="button" className="mt-3 inline-flex h-9 items-center justify-center gap-2 rounded-sm border border-strong bg-surface px-3 text-sm font-medium text-primary hover:bg-sunken">
            Manage Team
          </button>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-primary">Settings</h2>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary">
                Exhibitor Status
              </p>
              <p className="text-sm text-secondary">
                Current status of this exhibitor
              </p>
            </div>
            <StatusBadge tone="success">accepted</StatusBadge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary">Visibility</p>
              <p className="text-sm text-secondary">
                Show in exhibitor directory
              </p>
            </div>
            <label className="relative inline-flex h-6 w-11 cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                defaultChecked
                aria-label="Toggle exhibitor directory visibility"
              />
              <span className="absolute inset-0 rounded-full bg-strong transition-colors peer-checked:bg-brand" />
              <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
            </label>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <button type="button" className="inline-flex h-9 items-center justify-center gap-2 rounded-sm border border-status-danger-border bg-status-danger-subtle px-3 text-sm font-medium text-status-danger-text hover:bg-status-danger-subtle/80">
            Archive Exhibitor
          </button>
        </div>
      </Card>
    </div>
  );
}
