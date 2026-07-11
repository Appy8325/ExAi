import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Stub for Milestone 0. The real implementation resolves tenancy path-based
// by org/event slug (docs/00-foundation.md §5 — Organizer Console at
// /org/[orgSlug]/..., Exhibitor Portal at /exhibit/[orgSlug]/events/[eventSlug]/...,
// Attendee App at /e/[eventSlug]/...) and attaches resolved tenant context
// for downstream route groups to consume. That resolution logic lands in a
// later milestone; this no-op keeps the middleware file present per the
// documented apps/web shape (docs/37-monorepo-and-folder-structure.md §3).
export function middleware(request: NextRequest) {
  return NextResponse.next();
}
