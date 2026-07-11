# AI Bootstrap Prompt

Paste the prompt below, verbatim, as the first message in a brand new Claude Code or Codex session opened against this repository. It gets a fresh AI agent oriented — architecture, current milestone, working conventions — without needing any prior conversation history. It intentionally stops short of implementation: it ends with the agent waiting for a ticket, not writing code.

---

## The prompt

```
You are joining the ExAi engineering team on an existing repository. Before doing
anything else, onboard yourself using only the files already in this repo — do not
ask me for context you can find on disk.

Read, in this exact order:

1. docs/PROJECT_STATE.md — current milestone, completed/pending tickets, current
   git commit hash, pending runtime validation, known risks, and the recommended
   next ticket. This is the fastest path to "what's actually true right now."
2. docs/BLUEPRINT_V1.md — one-page summary of the frozen architecture: stack,
   modules, roles, AI feature set, database/folder-structure versions.
3. docs/ENGINEERING_GUIDE.md — how to work in this repository: read order for the
   full docs/ blueprint, implementation philosophy, coding standards, git
   workflow, testing expectations, and how milestones are executed one at a time.
4. docs/IMPLEMENTATION_RULES.md — the permanent, non-negotiable engineering
   rules (the "Never" and "Always" lists). These bind every session, including
   this one.
5. docs/IMPLEMENTATION_PHASES.md — find the milestone docs/PROJECT_STATE.md
   named as current, and read that milestone's Goal, Dependencies, Deliverables,
   and Definition of Done in full.

Do not read the remaining 47 numbered architecture documents (docs/00 through
docs/46) yet. Per ENGINEERING_GUIDE.md's read order, you only read the specific
numbered document(s) a ticket's deliverables actually map to, once you know what
that ticket is — reading all 47 up front is explicitly discouraged.

Once you've read the five documents above, confirm your understanding by
summarizing back to me, briefly:

- Product purpose and current architecture status (frozen? which stack?)
- Current milestone and which deliverables/tickets are done vs. pending
- The specific next recommended ticket per docs/PROJECT_STATE.md
- Any open risks or unverified work flagged in docs/PROJECT_STATE.md that could
  affect the next ticket
- The non-negotiable rules from IMPLEMENTATION_RULES.md that are most relevant
  to the next ticket

Do not write, edit, or scaffold any code. Do not run install, build, or test
commands. Do not propose an implementation plan yet. When your summary is
ready, stop and wait — I will confirm the next ticket (or give you a different
one) before you do anything else.
```

---

## Why this prompt is shaped this way

- **PROJECT_STATE.md first, blueprint second.** The blueprint (docs 00–46) is frozen and doesn't change; what changes between sessions is *state* — which ticket is done, what's uncommitted, what's unverified. Reading state before architecture avoids an agent re-deriving stale conclusions from an old chat transcript.
- **Explicitly bounded reading.** Naming exactly five documents (not "read the docs") prevents an agent from either under-reading (skipping IMPLEMENTATION_RULES.md and violating a Never-rule on turn one) or over-reading (burning its first session ingesting all 47 architecture documents before doing anything useful).
- **A confirmation step, not a green light.** Asking the agent to summarize back what it learned surfaces misreadings before they become wasted implementation work — and catches drift if `PROJECT_STATE.md` has itself gone stale.
- **No implementation instructions, by design.** This prompt's only job is orientation. The actual ticket — what to build — is deliberately left for a follow-up message, per [ENGINEERING_GUIDE.md](ENGINEERING_GUIDE.md) §9's "one milestone deliverable at a time" discipline.

## Keeping this prompt current

This prompt references [docs/PROJECT_STATE.md](PROJECT_STATE.md), [docs/BLUEPRINT_V1.md](BLUEPRINT_V1.md), [docs/ENGINEERING_GUIDE.md](ENGINEERING_GUIDE.md), [docs/IMPLEMENTATION_RULES.md](IMPLEMENTATION_RULES.md), and [docs/IMPLEMENTATION_PHASES.md](IMPLEMENTATION_PHASES.md) by name and by read order. If any of those five documents is renamed, replaced, or reordered in importance, update the prompt above to match — it is not self-updating, and a stale reference here defeats its entire purpose.
