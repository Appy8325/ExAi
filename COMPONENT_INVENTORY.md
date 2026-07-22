# Component Inventory — ExAi

**Date:** July 22, 2026
**Status:** Reference Document

---

## Overview

This document catalogs every UI component in ExAi's design system, its correct usage, and anti-patterns to avoid.

---

## Navigation Components

### GlobalNav

**File:** `components/navigation/global-nav.tsx`

**Purpose:** Top-level navigation between product perspectives

**Variants:**
- `marketing` — For public pages, no user menu
- `authenticated` — For workspace pages, shows user menu
- `compact` — For attendee pages, minimal

**Usage:**
```tsx
<GlobalNav variant="authenticated" active="organizer" />
```

**Anti-patterns:**
- Don't render multiple GlobalNav instances on one page
- Don't use `active` prop to override auto-detection unless necessary
- Don't add navigation links to GlobalNav — use workspace sidebar

---

### WorkspaceNav

**File:** `components/navigation/workspace-nav.tsx`

**Purpose:** Left sidebar navigation within workspace

**Structure:**
```tsx
<WorkspaceNav
  sections={[
    {
      title: "Main",
      items: [
        { id: "dashboard", label: "Dashboard", href: "/org", icon: LayoutDashboard },
        { id: "events", label: "Events", href: "/org/events", icon: Calendar },
      ]
    },
    {
      title: "Settings",
      items: [
        { id: "settings", label: "Settings", href: "/org/settings", icon: Settings },
      ]
    }
  ]}
  activeId="dashboard"
/>
```

**Anti-patterns:**
- Don't use this for top-level navigation (use GlobalNav)
- Don't duplicate items in sidebar and elsewhere
- Don't show more than 7 items without grouping

---

### Breadcrumbs

**File:** `components/navigation/breadcrumbs.tsx`

**Purpose:** Orient user within navigation hierarchy

**Format:** `Perspective > Section > Page`

**Usage:**
```tsx
<Breadcrumbs
  items={[
    { label: "Organizer", href: "/org" },
    { label: "Events", href: "/org/events" },
    { label: "TechExpo 2027" }
  ]}
/>
```

**Anti-patterns:**
- Don't include the page title (it's in the h1)
- Don't include action links
- Don't show more than 4 levels

---

### PageTabs

**File:** `components/navigation/page-tabs.tsx`

**Purpose:** Navigate between sibling pages at same level

**Usage:**
```tsx
<PageTabs
  tabs={[
    { id: "overview", label: "Overview", href: "/org/events/123" },
    { id: "exhibitors", label: "Exhibitors", href: "/org/events/123/exhibitors", count: 45 },
    { id: "reports", label: "Reports", href: "/org/events/123/reports" },
  ]}
  activeId="overview"
/>
```

**Anti-patterns:**
- Don't use for parent-child navigation (use breadcrumbs)
- Don't use for more than 6 tabs
- Don't use without an active indicator

---

### BackLink

**File:** `components/navigation/back-link.tsx`

**Purpose:** Navigate back to previous context

**Usage:**
```tsx
<BackLink label="Events" href="/org/events" />
```

**Anti-patterns:**
- Don't use for top-level pages
- Don't use text like "← Back" — use "← Back to [destination]"
- Don't use multiple back links on one page

---

## Layout Components

### Card

**File:** `@concourse/ui` — `Card`

**Purpose:** Container for related content

**Variants:**
- `default` — Standard card with subtle shadow
- `premium` — Featured/highlighted content
- `elevated` — Modal-like, heavy shadow

**Usage:**
```tsx
<Card className="p-6">
  {content}
</Card>
```

**Anti-patterns:**
- Don't use `border border-default bg-surface` directly — use Card
- Don't use different card styles for similar content
- Don't add borders to cards — shadow is enough

---

### PageHeader

**File:** `@concourse/ui` — `PageHeader`

**Purpose:** Header for a page with title and optional actions

**Usage:**
```tsx
<PageHeader
  title="Events"
  description="Manage your trade shows"
  action={<Button>Create Event</Button>}
/>
```

**Anti-patterns:**
- Don't use `text-title` styled div instead — use PageHeader
- Don't put actions in the title area unless necessary
- Don't use for sub-page headers (use SectionHeader)

---

### SectionHeader

**File:** `@concourse/ui` — `SectionHeader`

**Purpose:** Header for a section within a page

**Usage:**
```tsx
<SectionHeader
  title="Recent Activity"
  action={<Link href="/activity">View all</Link>}
/>
```

**Anti-patterns:**
- Don't use for page-level headers (use PageHeader)
- Don't skip this for important sections

---

## Button Components

### Button

**File:** `@concourse/ui` — `Button`

**Variants:** `primary` | `secondary` | `ghost` | `danger`

**Sizes:** `sm` | `md` | `lg`

**Usage:**
```tsx
<Button variant="primary" size="md">
  Save changes
</Button>

<Button variant="secondary" size="sm">
  Cancel
</Button>

<Button variant="ghost" size="sm">
  Learn more
</Button>

<Button variant="danger" size="md">
  Delete event
</Button>
```

**Icon buttons:**
```tsx
<Button variant="ghost" size="icon-sm">
  <SettingsIcon className="size-4" />
</Button>
```

**Loading state:**
```tsx
<Button loading>
  Saving...
</Button>
```

**Anti-patterns:**
- Don't use two primary buttons on one page
- Don't use `bg-brand` directly — use Button
- Don't use raw `<button>` — use Button component
- Don't disable buttons without tooltip explaining why

---

## Form Components

### Field

**File:** `@concourse/ui` — `Field`

**Purpose:** Wrapper for form inputs with label and hint

**Usage:**
```tsx
<Field label="Email address" hint="We'll send a magic link">
  <Input type="email" placeholder="you@company.com" />
</Field>

<Field label="Company" error="Company name is required">
  <Input placeholder="Acme Corp" />
</Field>
```

**Anti-patterns:**
- Don't use raw `<label>` + `<input>` — use Field + Input
- Don't show validation errors without using Field's error prop

---

### Input

**File:** `@concourse/ui` — `Input`

**Purpose:** Text input field

**Variants:** `default` | `error`

**Usage:**
```tsx
<Input type="text" placeholder="Enter name" />
<Input type="email" error />
```

**Anti-patterns:**
- Don't use native `<input>` — use Input component
- Don't style input borders directly

---

### Textarea

**File:** `@concourse/ui` — `Textarea`

**Usage:**
```tsx
<Textarea placeholder="Describe your event..." rows={4} />
```

---

### Select

**File:** `@concourse/ui` — `Select`

**Usage:**
```tsx
<Select>
  <option value="draft">Draft</option>
  <option value="published">Published</option>
</Select>
```

**Anti-patterns:**
- Don't use raw `<select>` — use Select component
- Consider if a radio group or toggle would be clearer for 2-3 options

---

## Data Display Components

### MetricCard

**File:** `@concourse/ui` — `MetricCard`

**Purpose:** Display a single KPI with optional trend

**Usage:**
```tsx
<MetricCard
  label="Relationships"
  value="1,247"
  trend={{ direction: "up", value: "+12%", context: "vs last event" }}
/>
```

**Anti-patterns:**
- Don't show more than 4 on one page without hierarchy
- Don't use for primary headline metric (create custom prominent layout)

---

### KPICard

**File:** `@concourse/ui` — `KPICard`

**Purpose:** Display a KPI with accent color

**Usage:**
```tsx
<KPICard
  label="Total Visitors"
  value="5,234"
  accent="brand"
/>
```

**Anti-patterns:**
- Don't mix MetricCard and KPICard on same page — pick one
- Don't use accent color without meaning

---

### Badge

**File:** `@concourse/ui` — `Badge`

**Variants:** `subtle` | `solid` | `outline`

**Usage:**
```tsx
<Badge variant="subtle">Draft</Badge>
<Badge variant="solid">Live</Badge>
<Badge variant="outline">Pending</Badge>
```

---

### StatusBadge

**File:** `@concourse/ui` — `StatusBadge`

**Purpose:** Show status with semantic colors

**Usage:**
```tsx
<StatusBadge status="success">Active</StatusBadge>
<StatusBadge status="warning">Pending</StatusBadge>
<StatusBadge status="danger">Failed</StatusBadge>
<StatusBadge status="info">New</StatusBadge>
<StatusBadge status="ai">AI Analyzed</StatusBadge>
```

**Anti-patterns:**
- Don't use Badge for dynamic status — use StatusBadge
- Don't invent new status colors

---

### Table

**File:** `@concourse/ui` — `Table`, `TableHead`, `TableBody`, `TableRow`, `TableCell`

**Usage:**
```tsx
<Table>
  <TableHead>
    <TableRow>
      <TableCell>Name</TableCell>
      <TableCell>Status</TableCell>
      <TableCell>Actions</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {data.map(item => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
        <TableCell><StatusBadge status={item.status} /></TableCell>
        <TableCell><Button size="sm">View</Button></TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

**Anti-patterns:**
- Don't use tables for fewer than 5 rows — use a card list
- Don't use tables for complex layouts — use cards
- Don't use inline styles on cells

---

### EmptyState

**File:** `@concourse/ui` — `EmptyState`

**Purpose:** Show when a list/view has no content

**Usage:**
```tsx
<EmptyState
  icon={BookmarkIcon}
  title="No saved exhibitors"
  description="Bookmark exhibitors you're interested in to see them here."
  action={{ label: "Browse exhibitors", href: "/e/techexpo-2027" }}
/>
```

**Anti-patterns:**
- Don't show blank space — always use EmptyState
- Don't use inline text instead of EmptyState component
- EmptyState must include an action if content can be created

---

## Feedback Components

### Skeleton

**File:** `@concourse/ui` — `Skeleton`, `SkeletonCard`, `SkeletonTable`

**Usage:**
```tsx
// Card skeleton
<SkeletonCard />

// Table skeleton
<SkeletonTable rows={5} />

// Custom skeleton
<div className="space-y-3">
  <Skeleton className="h-5 w-48" />
  <Skeleton className="h-4 w-72" />
</div>
```

**Anti-patterns:**
- Use Skeleton for content loading, not spinners
- Match skeleton size to actual content size

---

### Toast

**File:** `@concourse/ui` — `Toast` (via Toaster provider)

**Usage:**
```tsx
// In component
toast.success("Event created successfully");

// Provider in layout
<Toaster />
```

**Variants:**
- `toast.success("Message")`
- `toast.error("Message")`
- `toast.warning("Message")`
- `toast.info("Message")`

---

### Dialog

**File:** `@concourse/ui` — `Dialog`

**Usage:**
```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogTitle>Confirm Action</DialogTitle>
    <DialogDescription>Are you sure you want to continue?</DialogDescription>
    <div className="flex gap-4 justify-end">
      <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
      <Button variant="danger" onClick={confirm}>Delete</Button>
    </div>
  </DialogContent>
</Dialog>
```

**Anti-patterns:**
- Don't use for confirmations that could be inline
- Don't show Dialog for errors — use Toast or inline error

---

### Drawer

**File:** `@concourse/ui` — `Drawer`

**Usage:**
```tsx
<Drawer open={open} onOpenChange={setOpen}>
  <DrawerTrigger asChild>
    <Button>Open Drawer</Button>
  </DrawerTrigger>
  <DrawerContent>
    <DrawerTitle>Filters</DrawerTitle>
    {filterContent}
  </DrawerContent>
</Drawer>
```

**Anti-patterns:**
- Use Drawer for filters/settings, not primary content
- Don't open Drawer from within another Drawer

---

## AI Components

### AiChat

**File:** `@concourse/ui` — `AiChat`

**Purpose:** Chat interface for AI interactions

**Usage:**
```tsx
<AiChat
  messages={messages}
  onSend={handleSend}
  suggestions={suggestions}
/>
```

---

### AISummaryCard

**New component** for displaying AI insights

**Usage:**
```tsx
<AISummaryCard
  insight="Your conversion drops 40% after 5pm."
  recommendation="Consider closing early or adding entertainment."
  action={{ label: "View Analysis", href: "/analytics" }}
/>
```

---

## Utility Components

### CommandPalette

**File:** `components/navigation/command-palette.tsx`

**Purpose:** Global search and navigation (Ctrl+K)

**Usage:** Already implemented globally via layout

---

### Tooltip

**File:** `@concourse/ui` — `Tooltip`

**Usage:**
```tsx
<Tooltip content="This is helpful information">
  <button>Hover me</button>
</Tooltip>
```

---

## Anti-Patterns to Never Repeat

| Anti-Pattern | Instead Use |
|--------------|-------------|
| `border border-default bg-surface rounded-lg` | `<Card>` |
| `text-xl font-semibold` | `text-title` |
| `<button className="bg-brand">` | `<Button variant="primary">` |
| Raw `<input type="color">` | Custom color picker |
| Inline error text | `Field` error prop |
| Multiple primary buttons | One primary + secondary |
| `p-5 gap-10 mt-[18px]` | Spacing scale values |
| `bg-white text-gray-900` | Semantic tokens |

---

## Component Usage Audit Checklist

Before shipping any UI, verify:

- [ ] Using Card component for all card containers
- [ ] Using Button component with correct variant
- [ ] Using Field + Input for all form fields
- [ ] Using Badge or StatusBadge (not inline styled badges)
- [ ] Using EmptyState for empty lists
- [ ] Using Skeleton for loading states
- [ ] Using Semantic tokens (not raw color values)
- [ ] Using Type scale (not arbitrary font sizes)
- [ ] Using Spacing scale (not arbitrary values)
- [ ] No inline styles except dynamic values