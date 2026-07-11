// Cross-cutting constants (doc 37 §6.3): permission strings, entitlement
// keys, domain-event names, queue names, as typed consts per foundation
// §11's naming grammar.
//
// Only the canonical role strings already locked in
// docs/00-foundation.md §8 are populated here. Permission strings
// (`resource:action`) and entitlement keys are NOT invented in this
// scaffolding pass — the role→permission matrix is owned by
// docs/28-permission-model.md; add them here once that doc's matrix is
// implemented, not before.

export const ROLES = [
  'platform:admin',
  'org:owner',
  'org:admin',
  'org:member',
  'event:admin',
  'event:staff',
  'exhibitor:admin',
  'exhibitor:rep',
  'attendee',
] as const;

export type Role = (typeof ROLES)[number];
