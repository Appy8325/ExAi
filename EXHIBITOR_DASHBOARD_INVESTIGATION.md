# Exhibitor Dashboard Investigation

## Problem

The demo exhibitor dashboard returned a seed/database error before rendering its live KPIs.

## Request flow and root cause

`demo exhibitor page` → `getPublicDemoExhibitorDashboard` → `GET /v1/public/demo/exhibitor/:id/dashboard` → `PublicExhibitorsService.demoExhibitorDashboard` → PostgreSQL.

The service still queried the pre-migration model: `relationship_notes`, `lead_submissions.submitted_by`, `lead_submissions.created_at`, relationship-level `interaction_source`/`notes`, and `last_interaction_at`. The current seed writes `exhibitor_relationship_notes`, `attendee_user_id`, `submitted_at`, `lead_submissions.interaction_source`, and `latest_interaction_at`. PostgreSQL therefore rejected the query before the loader received data.

## Fix

Updated the existing aggregation to the current schema and corrected the related demo visitor query. Profile completion now evaluates the three fields actually present in `attendee_profiles` (company, job title, industry). Invalid legacy “blocked” and free-text relationship flags were removed; the schema only supports active/archived relationships, with duplicate/high-interaction-no-lead signals retained.

## Verification

- Regenerated the deterministic demo seed successfully.
- Ran API typecheck successfully.
- Full workspace typecheck, lint, and build are recorded in the final validation run.
