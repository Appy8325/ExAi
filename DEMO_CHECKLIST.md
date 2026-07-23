# Demo Checklist

**Application:** ExAi v1.0.0-rc1
**Prepared for:** Each demo session

---

## Before Demo Day

- [ ] Verify demo account credentials (organizer + exhibitor + attendee)
- [ ] Confirm demo event is populated (TechExpo 2027 or equivalent)
- [ ] Confirm demo event has at least 5 exhibitors with varied booth types
- [ ] Confirm demo event has at least 50 attendee profiles
- [ ] Confirm demo event has at least 200 lead submissions across exhibitors
- [ ] Confirm demo event has at least 1000 relationship connections/notes
- [ ] Confirm analytics data is generated (funnel, heatmap, trends)
- [ ] Confirm AI executive report is generated
- [ ] Confirm demo data is consistent (no placeholder text, lorem ipsum, or "TODO" labels)
- [ ] Confirm demo admin controls work (simulation start/stop/reset)
- [ ] Confirm download PDF works (Reports → Download)
- [ ] Pre-flight test: run through full demo script without stopping
- [ ] Time the demo — aim for 5-7 minutes

---

## 30 Minutes Before Demo

### Health Checks

- [ ] `GET https://ex-ai-api.vercel.app/healthz` → **200** `{"status":"ok"}`
- [ ] `GET https://ex-ai-api.vercel.app/readyz` → **200** `{"status":"ok"}`
- [ ] `GET https://ex-ai-web.vercel.app/healthz` → **200**
- [ ] `GET https://ex-ai-web.vercel.app/readyz` → **200**

### Account Verification

- [ ] Login with demo organizer account → redirects to `/org`
- [ ] Login with demo exhibitor account → redirects to `/exhibit`
- [ ] Login with demo attendee account → navigates to event page
- [ ] Magic link email arrives within 30 seconds (if using email auth)

### Data Verification

- [ ] `/org` page loads with KPI data (not zeros, not empty states)
- [ ] `/org/events/[eventId]` loads exhibitors with names and statuses
- [ ] `/org/analytics` shows funnel bars with meaningful values
- [ ] `/org/analytics` shows booth heatmap with multiple booths
- [ ] `/org/events/[eventId]/reports` shows AI report content (not "generating...")
- [ ] `/exhibit/[organizationId]/dashboard` shows metrics and AI insights
- [ ] `/exhibit/[organizationId]/attendees` shows leads with intent badges
- [ ] `/e/[eventSlug]` shows event page for attendees

### Technical Verification

- [ ] No console errors (Open DevTools → Console before starting)
- [ ] No 404s or API errors in Network tab
- [ ] All images load (company logos, booth images, UI icons)
- [ ] Page transitions are smooth (no janky loading, no layout shift)
- [ ] Browser zoom at 100% (not zoomed in/out)
- [ ] Screen resolution matches demo target (ideally 1920×1080 or 1440×900)
- [ ] Presenter display mode active (if using external monitor)

### Environment

- [ ] Internet connection stable (run speedtest or ping test)
- [ ] Browser: Chrome or Firefox (latest stable)
- [ ] No VPN active that could interfere with routing
- [ ] Notifications/OS popups disabled
- [ ] Microphone and camera tested (if presenting live)
- [ ] Screen recording software ready (if recording)
- [ ] Backup browser tab open with demo ready

---

## During Demo

- [ ] Follow DEMO_SCRIPT.md sequence (Intro → Organizer → Analytics → Reports → Exhibitor → Architecture → Closing)
- [ ] Speak to business value, not features
- [ ] Highlight AI enrichment (intent scoring, report generation, insight cards)
- [ ] Navigate deliberately — no frantic clicking
- [ ] If something breaks, skip gracefully and move to next section
- [ ] Keep to 7-minute hard stop

---

## After Demo

- [ ] Answer questions referencing specific screens shown
- [ ] Collect feedback: what resonated, what was confusing
- [ ] Log any issues discovered during demo (broken links, stale data, UI bugs)
- [ ] If issues found: file in issue tracker with screenshot and timestamp
- [ ] Reset demo state if simulation was used
- [ ] Update DEMO_SCRIPT.md if script was modified during presentation

---

## Quick Pre-Demo Health Command

```bash
# Run this 30 minutes before demo
echo "=== Health Check ==="
curl -s https://ex-ai-api.vercel.app/healthz
curl -s https://ex-ai-api.vercel.app/readyz

echo "=== Demo URLs ==="
echo "Web App:    https://ex-ai-web.vercel.app"
echo "API:        https://ex-ai-api.vercel.app"
echo "Healthz:    https://ex-ai-api.vercel.app/healthz"
echo "Readyz:     https://ex-ai-api.vercel.app/readyz"
```
