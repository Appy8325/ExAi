/**
 * Notification category allowlist — the taxonomy fixed in
 * docs/33-notification-system.md §4. "Every category is a validated string in
 * packages/notifications/src/categories.ts (an allowlist enum in code, stored
 * as free `text` in the DB per doc 16 §8.2's explicit 'grows without a
 * migration' rationale)." — doc 33 §4.
 *
 * Each identifier below is the literal `Category` / `Category / template`
 * value from doc 33 §4's per-group tables (§4.1–§4.7) — none invented here.
 * Groups mirror the document's own subsection structure; `(bypass)` marks
 * categories sent via the §2.3 bypass path (no `users` row / no
 * `notification_preferences` check — see doc 33 §2.3, §4.1, §4.6).
 *
 * `meeting.lifecycle` covers four status-suffixed template variants
 * (requested/confirmed/declined/cancelled per doc 33 §4.4) sharing one
 * category; the per-status template ids are a `templates/` concern, not a
 * category concern.
 */

/** §4.1 — Account & Security (identity-flow bypass sends + one notification-object category) */
export type AccountSecurityCategory =
  | 'auth.invite-org' // bypass
  | 'auth.invite-exhibitor' // bypass
  | 'auth.invite-exhibitor-staff' // bypass
  | 'auth.magic-link' // bypass
  | 'auth.password-reset' // bypass
  | 'auth.verify-email' // bypass
  | 'account.new-device-alert';

/** §4.2 — Organizer Operations (Priya, Marcus) */
export type OrganizerOperationsCategory =
  | 'organizer.exhibitor-nudge'
  | 'organizer.event-date-changed'
  | 'organizer.booth-reassigned'
  | 'organizer.agenda-changed'
  | 'organizer.broadcast-announcement'
  | 'organizer.pulse-digest'
  | 'webhook-endpoint-disabled';

/** §4.3 — Exhibitor Operations (Elena, Jamal) */
export type ExhibitorOperationsCategory = 'exhibitor.hot-lead-alert' | 'exhibitor.followup-outbound';

/** §4.4 — Attendee Engagement (Sofia) */
export type AttendeeEngagementCategory =
  | 'registration.confirmed'
  | 'attendee.pre-event-digest'
  | 'attendee.post-event-recap'
  | 'meeting.lifecycle' // requested / confirmed / declined / cancelled — one template per status
  | 'meeting.reminder';

/** §4.5 — AI & Platform Notices */
export type AiPlatformNoticeCategory = 'ai.budget-threshold' | 'file.quarantined' | 'legal.reconsent-required';

/** §4.6 — Support (notification-object send to Alex + bypass auto-reply to the submitter) */
export type SupportCategory =
  | 'support.help-escalation'
  | 'support.contact-form-routed'
  | 'support.contact-form-autoreply'; // bypass

/** §4.7 — Billing (Priya, Elena, Alex) */
export type BillingCategory =
  | 'billing.subscription_started'
  | 'billing.payment_failed'
  | 'billing.payment_recovered'
  | 'billing.trial_ending_soon'
  | 'billing.subscription_canceled'
  | 'billing.dispute_opened';

/** The full taxonomy — every valid `notifications.category` value (doc 33 §4). */
export type NotificationCategory =
  | AccountSecurityCategory
  | OrganizerOperationsCategory
  | ExhibitorOperationsCategory
  | AttendeeEngagementCategory
  | AiPlatformNoticeCategory
  | SupportCategory
  | BillingCategory;

/** Runtime allowlist mirroring `NotificationCategory`, for validation at the module boundary. */
export const NOTIFICATION_CATEGORIES = [
  // §4.1 Account & Security
  'auth.invite-org',
  'auth.invite-exhibitor',
  'auth.invite-exhibitor-staff',
  'auth.magic-link',
  'auth.password-reset',
  'auth.verify-email',
  'account.new-device-alert',
  // §4.2 Organizer Operations
  'organizer.exhibitor-nudge',
  'organizer.event-date-changed',
  'organizer.booth-reassigned',
  'organizer.agenda-changed',
  'organizer.broadcast-announcement',
  'organizer.pulse-digest',
  'webhook-endpoint-disabled',
  // §4.3 Exhibitor Operations
  'exhibitor.hot-lead-alert',
  'exhibitor.followup-outbound',
  // §4.4 Attendee Engagement
  'registration.confirmed',
  'attendee.pre-event-digest',
  'attendee.post-event-recap',
  'meeting.lifecycle',
  'meeting.reminder',
  // §4.5 AI & Platform Notices
  'ai.budget-threshold',
  'file.quarantined',
  'legal.reconsent-required',
  // §4.6 Support
  'support.help-escalation',
  'support.contact-form-routed',
  'support.contact-form-autoreply',
  // §4.7 Billing
  'billing.subscription_started',
  'billing.payment_failed',
  'billing.payment_recovered',
  'billing.trial_ending_soon',
  'billing.subscription_canceled',
  'billing.dispute_opened',
] as const satisfies readonly NotificationCategory[];

export function isNotificationCategory(value: string): value is NotificationCategory {
  return (NOTIFICATION_CATEGORIES as readonly string[]).includes(value);
}
