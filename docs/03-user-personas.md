# User Personas

This document expands the six canonical personas from [00-foundation.md](00-foundation.md) §3 into build-ready detail: their context, goals, frustrations with the status quo, jobs-to-be-done, technical comfort, devices, definition of success, and the Concourse features (canonical names per foundation §10) that serve them. It closes with the anti-personas we explicitly do not design for. Every design doc, user story, and test scenario in this blueprint must reference these personas by name — no new personas may be introduced without amending foundation §3 first. Feature entitlements referenced below are governed by the tier definitions in [02-business-goals.md](02-business-goals.md).

---

## Persona Summary

| Persona | Role | Surface (routes per foundation §5) | Primary features | Contribution to Qualified Connections per Event |
|---|---|---|---|---|
| Priya Sharma | Event Director (organizer admin) | Organizer Console `/org/[orgSlug]/…` | Event setup, floor plans, exhibitor management, Organizer Pulse | Curates a floor worth connecting on; proves the metric to renew the event |
| Marcus Webb | Event Operations Manager (organizer staff) | Organizer Console | Check-in, live ops dashboards, registration management | Gets attendees onto the floor fast enough to interact |
| Elena Rodriguez | Marketing Director (exhibitor admin) | Exhibitor Portal `/exhibit/[orgSlug]/events/[eventSlug]/…` | Lead Intelligence, Follow-up Studio, Smart Matchmaking, CRM sync | Qualifies leads and closes the loop post-event (exhibitor side of QCE) |
| Jamal Carter | Booth Sales Rep (exhibitor rep) | Exhibitor Portal, mobile PWA | Offline lead capture, voice notes, Lead Intelligence summaries, meetings | Captures and enriches the raw interactions QCE derives from |
| Sofia Lindqvist | Procurement lead (attendee) | Attendee App `/e/[eventSlug]/…` | Expo Copilot, Smart Matchmaking, agenda, meetings, badge | Provides the reciprocity signals (attendee side of QCE) |
| Alex Kim | Concourse Platform Admin (internal) | Platform Admin `/admin/…` | Tenant ops, audit, health, feature flags, billing support | Keeps the platform trustworthy and alive during live events |

---

## 1. Priya Sharma — Event Director (Organizer Admin)

**Context.** Priya runs the flagship event at a mid-market trade show producer: 12,000 attendees, 420 exhibitors, three halls, one edition a year, plus two smaller regional events. Her company's revenue is booth sales; her personal scorecard is exhibitor rebook rate and attendee growth. She manages a team of eight, including Marcus.

**Day in the life.** Most of her year is the planning arc: selling floor space, confirming the agenda, chasing exhibitor marketing assets, reconciling the registration list across three tools. Six weeks out, her calendar collapses into vendor coordination and exhibitor escalations. During live days she walks the floor with a phone and a radio, triaging. The six weeks *after* the event are the part she dreads: assembling a post-event report from scan counts and survey anecdotes to convince 420 exhibitors to rebook — with no real evidence.

**Goals.**
- Exhibitor rebook rate above 85% for the next edition.
- A post-event story per exhibitor: "your booth produced X qualified connections and Y meetings."
- Grow attendee registration without growing her tooling sprawl.
- Sell more `professional`-plan-style capability up the chain: matchmaking and analytics as reasons her events beat competing shows.

**Frustrations with the status quo.**
- Six tools, six attendee lists, zero agreement between them.
- The post-event report takes six weeks and persuades no one.
- Exhibitors churn silently: they don't complain, they just don't rebook, and she learns why too late.
- Incumbent suites are slow, training-heavy, and priced for corporate enterprise.

**Jobs-to-be-done.**
1. When I set up a new event edition, I want floor plan, booths, exhibitors, agenda, and registration in one place, so the event has one source of truth from day one.
2. When an exhibitor asks "was it worth it?", I want per-exhibitor connection and meeting evidence, so rebooking is a data conversation.
3. When the event is live, I want to see the floor's pulse in real time, so I can intervene (dead aisles, overloaded check-in) while it still matters.
4. When planning the next edition, I want to know which exhibitor categories were under-served relative to attendee demand, so I sell the right floor mix.

**Tech comfort.** High as a SaaS operator (CRMs, registration tools, spreadsheets); non-technical otherwise. Will not read documentation; the Console must be self-evident.

**Devices.** Laptop (Chrome) for the planning arc; phone constantly during live days.

**Definition of success.** She renews the Concourse license and moves her other two events onto it. Internally: rebook rate up, report ready the week after the event, one tool where there were six.

**Concourse features that serve her.**
- **Organizer Pulse** — natural-language analytics and AI event insights ("which categories are under-served on the floor?"), plus the post-event evidence pack per exhibitor.
- Event lifecycle management (`events` draft → published → live → completed → archived), floor plans and booth assignment, `event_exhibitors` and tier oversight, `event_staff` management.
- **Smart Matchmaking** (event-wide, `professional` plan) as an attendee-experience and exhibitor-value amplifier she can market.
- Live dashboards via realtime rooms per event (foundation §9).

---

## 2. Marcus Webb — Event Operations Manager (Organizer Staff)

**Context.** Marcus reports to Priya and owns everything physical-operational: registration desk, check-in flow, badge logistics, booth build coordination, floor staffing, and the daily run-of-show. During live days he is the platform's most latency-sensitive organizer user.

**Day in the life (show day).** On the floor at 5:30. Verifies check-in stations, prints contingency badge stock, briefs temp staff who have never seen the software. Doors at 9:00: his world is queue length. A registration vendor import mismatch, a Wi-Fi drop in Hall B, an exhibitor who can't find their booth assignment — all before 9:20. He solves problems standing up, phone in one hand.

**Goals.**
- Peak check-in throughput without queues; no attendee's first event experience is a line.
- Every temp staffer productive in under ten minutes of training.
- Zero single-points-of-failure: when the network drops, check-in keeps working.

**Frustrations with the status quo.**
- Check-in software that assumes perfect connectivity and dies with the venue Wi-Fi.
- Ops state scattered across radio calls, a shared spreadsheet, and three vendors' dashboards.
- Badge reprints and edge cases (transfers, on-site registration) requiring vendor support tickets mid-event.

**Jobs-to-be-done.**
1. When doors open, I want scan-to-admit check-in that keeps working offline, so throughput never depends on the venue network.
2. When something breaks on the floor, I want one live ops view (check-in rates, station status, incident notes), so I direct staff instead of discovering problems by radio.
3. When an attendee's registration is wrong, I want to fix it at the desk in seconds (reissue `badge_code`, correct details), so the queue keeps moving.
4. When the day ends, I want an ops summary (throughput, incidents, no-shows) without assembling it myself.

**Tech comfort.** Medium-high operationally; learns any tool fast but has zero patience for configuration. Judges software entirely on how it behaves at 9:05 with a queue.

**Devices.** Android phone and a tablet on the floor; laptop at the ops desk. Frequently on venue networks at their worst.

**Definition of success.** Doors-open morning with no queue photo on social media, no vendor support call, and temp staff who needed no help after the briefing.

**Concourse features that serve him.**
- Check-in and registration management (`registrations` registered → checked_in, badge issue/rotation — badge codes are opaque and rotatable per foundation §12).
- Offline-tolerant floor operations (product principle P4, [01-product-vision.md](01-product-vision.md) §6).
- Live event dashboards (Supabase Realtime channels per event) and `session_checkins` monitoring for agenda sessions.
- **Organizer Pulse** as a secondary user: quick natural-language questions ("check-in rate vs last year by hour") without building reports.

---

## 3. Elena Rodriguez — Marketing Director (Exhibitor Admin)

**Context.** Elena runs demand generation at a 200-person industrial-equipment manufacturer that exhibits at nine events a year. Trade shows are 40% of her budget and the line item her CFO questions hardest. She decides which events to attend, buys the booth, picks the Concourse tier, and owns the pipeline number the events must produce. Jamal is one of her six reps.

**Day in the life (event cycle).** Pre-event: negotiates booth placement, uploads the product catalog, assigns rep seats, briefs the team on target accounts. During: she works the booth's biggest conversations herself while watching capture volume. Post-event — the part that decides her year: exports whatever the event's system produced, deduplicates it against the CRM, guesses at quality, and tries to get follow-up out before the leads go cold. It usually takes two weeks. She knows the first 48 hours matter most.

**Goals.**
- Attributable pipeline per event she can defend to the CFO.
- Follow-up in market within 48 hours of the event closing, personalized enough to get replies.
- One reusable setup: catalog and team once, reused across all nine events.
- Rank the nine events by actual return and cut the bottom two.

**Frustrations with the status quo.**
- Leads arrive as an undifferentiated CSV days after the event; the intern sorts them.
- No context per lead: a scan says nothing about what the person cared about.
- Every event has a different portal, different export format, different login.
- Follow-up is a generic blast because personalization at volume is impossible manually.

**Jobs-to-be-done.**
1. When the event ends (and during it), I want leads scored and summarized, so my team works the top of the list first instead of alphabetically.
2. When I plan follow-up, I want drafts grounded in what actually happened at the booth per lead, so outreach lands while intent is warm.
3. When the CFO asks for ROI, I want per-event pipeline evidence (qualified connections, meetings, CRM outcomes), so budget survives.
4. When I commit to next year's events, I want cross-event comparison of my results, so I spend where we win.
5. When I onboard a new event, I want my org's catalog and team to carry over, so setup is minutes.

**Tech comfort.** High for marketing SaaS (CRM, marketing automation, analytics). Expects CRM sync to be table stakes.

**Devices.** Laptop primarily; phone during events.

**Definition of success.** The `growth`-or-`intelligence` tier fee is the easiest line in her event budget to justify: follow-up out in 48 hours, pipeline attributed per event, CFO conversation won with Concourse's numbers.

**Concourse features that serve her.**
- **Lead Intelligence** — scoring, AI-written interaction summaries, firmographic enrichment (`growth` tier+).
- **Follow-up Studio** — AI-drafted, personalized post-event sequences grounded in booth interactions (`intelligence` tier).
- **Smart Matchmaking** — inbound: high-fit attendees recommended to her booth; priority placement on `intelligence`.
- Exhibitor org tenancy: `products` catalog reusable across events, `event_product_listings` per event, `exhibitor_staff` seat management, exports/CRM sync, real-time booth analytics and competitive benchmarks (`intelligence`).

---

## 4. Jamal Carter — Booth Sales Rep (Exhibitor Rep)

**Context.** Jamal is a field sales rep who works six events a year for Elena's company. On the floor he is the company: ten hours on his feet, hundreds of conversations, quota on meetings booked. He has never read a manual for any tool he uses and never will.

**Day in the life (show day).** Booth at 8:30, coffee, badge on. From 9:00 it is a stream of conversations from 90 seconds to 20 minutes. Between conversations he has, at most, 20 seconds to record what happened before the next person is in front of him. The old way: scan the badge, hope he remembers the context that evening. He never does — by 6pm, forty scans, and he can reconstruct maybe five conversations. Hall connectivity dies every day after lunch.

**Goals.**
- Capture every real conversation with enough context to act on later — in seconds, not minutes.
- Know which of his captures are hot before end of day, not after the event.
- Book the meeting on the spot when a conversation is good.
- Hit his post-event meetings quota without a memory exercise.

**Frustrations with the status quo.**
- Scanner apps that need connectivity exactly when the hall has none.
- Typing notes on a phone while the next prospect waits — so notes don't happen.
- No feedback loop: he captures all day and never learns which leads went anywhere.
- Clunky rented scan hardware that's worse than his own phone.

**Jobs-to-be-done.**
1. When a conversation ends, I want to scan the badge and dictate a 15-second voice note, so context is preserved without stopping the booth.
2. When the hall network dies, I want capture to work exactly the same, so I never think about connectivity.
3. When a conversation is strong, I want to book the meeting there and then, so intent converts before it cools.
4. When there's a lull, I want my day's leads ranked with summaries, so I use dead time to plan follow-ups.

**Tech comfort.** Consumer-grade: excellent with phone apps that behave like consumer apps, hostile to anything that behaves like enterprise software. The mobile PWA must survive one-handed, gloves, glare, and a 20-second attention budget.

**Devices.** Personal iPhone (installed PWA per foundation D3). Nothing else.

**Definition of success.** End of show day: every real conversation exists as a lead with context, the hot ones are flagged, three meetings are booked, and he never once waited on a spinner (principle P1).

**Concourse features that serve him.**
- Offline-first lead capture: badge scan → `booth_visits` → `leads`, with `lead_notes` including voice-transcribed notes — all functional offline (P4).
- **Lead Intelligence** — scores and AI summaries surfacing his hottest captures in-day (`growth` tier+).
- `meetings` — slot-based scheduling at the booth.
- Lead pipeline flow (`captured → qualified → contacted → meeting_booked → closed`), designed for thumb-speed triage.

---

## 5. Sofia Lindqvist — Procurement Lead (Attendee)

**Context.** Sofia leads procurement for manufacturing technology at a mid-size European industrial firm. She attends four to six trade shows a year specifically to shortlist vendors for upcoming purchasing decisions — she is exactly the attendee every exhibitor hopes stops by, and the status quo wastes her time comprehensively.

**Day in the life (show day).** Two days for a floor of 400+ booths. She lands with a vendor problem in her head ("condition-monitoring sensors compatible with our PLC stack"), a PDF floor plan, and an exhibitor list organized alphabetically. She walks aisles. Half her stops are dead ends discoverable as dead ends in ten seconds. Meanwhile the three vendors that would have made her trip are in a hall she never reaches. After the event, her scanned badge yields six weeks of irrelevant email blasts — so she has learned to decline scans, which destroys value for everyone.

**Goals.**
- Leave with a defensible vendor shortlist for her live purchasing needs.
- Spend floor time only on high-probability booths; book meetings with the serious ones.
- Control what happens to her data — share context with vendors she chooses, nothing with the rest.
- Catch the two or three agenda sessions relevant to her purchase decisions.

**Frustrations with the status quo.**
- Event apps are brochureware: a searchable list is not discovery.
- No way to ask the event a question ("who here does X?") and get a real answer.
- Badge scans feel like signing up for spam, so she opts out — and misses legitimate follow-up she wanted.
- Serendipity is the only matchmaking on offer, and it doesn't scale to 400 booths.

**Jobs-to-be-done.**
1. When I plan my visit, I want to describe my actual problem and get cited recommendations of exhibitors, products, and agenda sessions, so my two days are routed before I arrive.
2. When I'm on the floor, I want a live personal guide ("I'm near Hall B with 40 minutes — what should I see?"), so gaps become discoveries.
3. When a vendor interests me, I want to save them, share my context deliberately, and book a meeting, so follow-up happens on my terms.
4. When the event ends, I want my saved exhibitors, meeting outcomes, and notes in one place, so the shortlist writes itself.

**Tech comfort.** High consumer bar: expects the Attendee App to behave like a top-tier consumer product. Privacy-literate — reads consent prompts, punishes dark patterns by disengaging.

**Devices.** Personal phone (PWA at `/e/[eventSlug]`, installable); laptop pre-event for planning.

**Definition of success.** She leaves with a shortlist of five vendors, three meetings held, zero spam afterward — and registers for next year's edition because the event itself was measurably more useful on Concourse.

**Concourse features that serve her.**
- **Expo Copilot** — conversational, RAG-grounded event guide with cited, bookable answers.
- **Smart Matchmaking** — scored exhibitor recommendations with reasons always shown; acceptance is her explicit choice.
- Agenda (`agenda_sessions`, `session_checkins`), `meetings`, saved exhibitors, and `attendee_interests` (declared + inferred) driving personalization.
- Consent-first badge (`badge_code` contains no PII; sharing is per-interaction opt-in) — her reciprocity actions are the attendee side of Qualified Connections ([01-product-vision.md](01-product-vision.md) §5).

---

## 6. Alex Kim — Concourse Platform Admin (Internal)

**Context.** Alex is on the Concourse platform team, responsible for keeping production trustworthy: tenant provisioning and support escalations, live-event readiness, incident response, feature-flag rollouts, billing corrections, and abuse/content moderation. Alex is the only persona who sees across tenants — which is exactly why Alex's surface is the most audited one.

**Day in the life.** Normal weeks: support escalations that page past organizer self-service (a stuck Stripe subscription, a mis-merged exhibitor org), reviewing flag rollouts, tuning AI cost dashboards. Live-event weeks: heightened on-call — watching the event's traffic, queue depths, sync-conflict rates, and AI spend in real time, ready to flip degradation flags (e.g., `ai-followup-studio`) before users feel a failure.

**Goals.**
- Zero cross-tenant data incidents, ever (the standing goal in [02-business-goals.md](02-business-goals.md) §4).
- Resolve tenant-level escalations without ad-hoc database access.
- Land risky changes behind flags with per-tenant rollout and instant rollback.
- Keep per-event AI cost inside budget without degrading the experience.

**Frustrations with the status quo (what Platform Admin must prevent).**
- Support-via-SQL: production queries as the escalation tool, unauditable and dangerous.
- Impersonation without trails.
- Discovering live-event overload from customer tweets instead of dashboards.

**Jobs-to-be-done.**
1. When an escalation needs tenant context, I want scoped, audited admin views (and audited impersonation where unavoidable), so support never means raw database access.
2. When a live event approaches, I want a readiness view per event (scale, flags, budgets, on-call), so launches are boring.
3. When AI spend or error rates spike, I want per-event budgets and kill-switch flags, so degradation is controlled and graceful (AI features are additive per foundation §10).
4. When anything privileged happens, I want it in `audit_logs` automatically, so trust is verifiable (principle P5).

**Tech comfort.** Engineer. The Platform Admin surface can assume expertise — it optimizes for correctness, auditability, and speed under incident pressure, not approachability.

**Devices.** Laptop; phone for on-call.

**Definition of success.** Live events pass without customer-visible incidents; every escalation resolves through the admin surface; the `platform:admin` audit trail is complete and boring.

**Concourse features that serve them.**
- Platform Admin surface (`/admin/…`): tenant/org management, `subscriptions` and billing support, `audit_logs`, feature flags (PostHog per foundation §6), health and cost dashboards (docs 21–23 for AI cost controls; observability stack per foundation §6).
- Role `platform:admin` with the strictest audit requirements in [28-permission-model.md](28-permission-model.md).

---

## 7. Anti-Personas

People we consciously do **not** design for. Their needs are legitimate; serving them would distort the product (see non-goals, [01-product-vision.md](01-product-vision.md) §7). When a feature request maps to an anti-persona, the default answer is no.

| Anti-persona | Who they are | Why we don't design for them | What exists instead |
|---|---|---|---|
| **The festival producer** | Runs consumer festivals, fan conventions, expos-for-fun | Value is ticket volume and sponsorship impressions, not B2B pipeline; no exhibitor-qualification economics for our model to serve | Nothing — out of segment ([02-business-goals.md](02-business-goals.md) §2.3) |
| **The conference chair** | Runs agenda-first conferences (academic, single-track corporate) with no expo floor | The agenda is their product; ours is the floor. Bizzabo-class tools serve them | `agenda_sessions` exist only as signal for floor intelligence |
| **The virtual-event host** | Runs webinars and online summits | Our differentiators (offline ops, physical presence signals, booth capture) are meaningless online | Non-goal; see [44-future-expansion-plan.md](44-future-expansion-plan.md) for hybrid notes |
| **The badge-hardware buyer** | Wants turnkey scanners, printers, kiosks from their software vendor | Hardware is a different business; lock-in contradicts our positioning | Vendor-neutral `badge_code` QR scannable by commodity devices |
| **The list buyer** | Wants the full attendee list as a purchasable asset | Selling unconsented attendee data destroys the trust model (P5) and Sofia's participation | Leads flow only from consented interactions; cross-tenant reads are explicitly modeled (foundation §8) |
| **The full-suite corporate event team** | Wants venue sourcing, budgeting, travel, and internal-meeting management in one contract | That is Cvent's suite; competing there consumes the roadmap without touching our wedge | Registration import; Concourse starts at the badge |
| **The casual attendee** | Wanders the floor with no buying intent, wants entertainment/gamification | Optimizing for engagement-as-entertainment (points, badges-for-badges) pollutes the intent signals QCE depends on | The Attendee App optimizes for buyer outcomes; game mechanics are rejected by default |

---

## 8. Related Documents

- [01-product-vision.md](01-product-vision.md) — the problem each persona experiences; product principles binding their UX
- [02-business-goals.md](02-business-goals.md) — which personas buy, which tiers unlock which features, per-persona KPIs
- [16-database-schema.md](16-database-schema.md) — entities named throughout (`leads`, `booth_visits`, `registrations`, …)
- [28-permission-model.md](28-permission-model.md) — role strings per persona (`org:owner` … `attendee`, `platform:admin`) and the permission matrix
- [44-future-expansion-plan.md](44-future-expansion-plan.md) — deferred audiences and surfaces (native apps, hybrid events)
