# Dark Mode Re-enabling Guide

**Status:** Locked to Light Theme for Hackathon (per design decision)

This document explains how to re-enable dark mode after the hackathon submission.

---

## What was locked

For the hackathon, the application is **hard-locked to the Light Theme** to ensure visual consistency across all devices, including Android Chrome and iPhone Safari in Dark Mode. This prevents dark-mode OS settings from rendering the marketing site and workspaces in an unstyled dark palette.

### Changes made

#### 1. `viewport.colorScheme` — `apps/web/src/app/layout.tsx`

```tsx
// REMOVED (supported dark mode):
colorScheme: "light dark",

// ADDED (locks to light):
colorScheme: "light",
themeColor: "#ffffff",
```

**To re-enable dark mode:** restore the `colorScheme: "light dark"` array and remove `themeColor`.

#### 2. `data-theme="light"` attribute — `apps/web/src/app/layout.tsx`

```tsx
// ADDED: forces the light theme attribute on the <html> element
// before any render, preventing flash of dark-themed content.
<html lang="en" data-theme="light" ...>
```

An inline `<script>` also sets this immediately on page load.

**To re-enable dark mode:** remove `data-theme="light"` from `<html>` and the inline script block.

#### 3. No `ThemeProvider` or `next-themes` in use

The codebase does **not** have a `ThemeProvider`. All pages use CSS variable tokens (`--mq-bg-canvas`, `--mq-text-primary`, etc.) from `@concourse/ui/styles.css`. These tokens do **not** switch based on `prefers-color-scheme` — they are static. The only `[data-theme="dark"]` selectors are in `globals.css:126,207` for scrollbar and skeleton shimmer overrides.

**To re-enable dark mode:** introduce `next-themes` `ThemeProvider`, set `attribute="data-theme"`, and add `dark:` Tailwind variant overrides in shared components.

#### 4. Inline script block — `apps/web/src/app/layout.tsx`

```tsx
// ADDED: Immediately sets data-theme="light" before paint
<script dangerouslySetInnerHTML={{
  __html: `(function() {
    try {
      var d = document.documentElement;
      if (d.getAttribute('data-theme') !== 'light')
        d.setAttribute('data-theme', 'light');
    } catch(e) {}
  })()`
}} />
```

**To re-enable dark mode:** remove this script block.

#### 5. CSS `prefers-color-scheme` — `globals.css:279–288`

The `prefers-reduced-motion` override in `globals.css` does NOT contain any `prefers-color-scheme` logic. No CSS changes were needed for the lock.

---

## How to re-enable dark mode (post-hackathon)

### Step 1 — Install next-themes

```bash
pnpm add next-themes
```

### Step 2 — Create a ThemeProvider

Create `apps/web/src/components/providers/theme-provider.tsx`:

```tsx
"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}
```

### Step 3 — Add ThemeProvider to root layout

In `apps/web/src/app/layout.tsx`:

```tsx
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

// Remove:
// - data-theme="light" from <html>
// - the force-light inline script block

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthSessionProvider>
            <SkipLink />
            {children}
          </AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Step 4 — Restore viewport colorScheme

In `apps/web/src/app/layout.tsx`:

```tsx
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  colorScheme: "light dark",
};
```

### Step 5 — Add a theme toggle button

Add a Sun/Moon toggle to any nav component:

```tsx
import { useTheme } from "next-themes";
const { theme, setTheme } = useTheme();

<button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
  {theme === "dark" ? "☀" : "☾"}
</button>
```

### Step 6 — Add dark mode CSS tokens (if needed)

The `@concourse/ui` design tokens already support dark mode through CSS variables. Add overrides to `globals.css` for any custom component that uses hard-coded colors:

```css
[data-theme="dark"] {
  /* override custom color tokens here */
  --my-custom-bg: #0f172a;
  --my-custom-text: #e2e8f0;
}
```

---

## Verification checklist

After re-enabling, verify:

- [ ] `document.documentElement.getAttribute('data-theme')` returns `"dark"` when OS is in dark mode
- [ ] Marketing site renders correctly in dark mode on Android Chrome
- [ ] Marketing site renders correctly in dark mode on iPhone Safari
- [ ] All workspace sidebars are readable in dark mode
- [ ] Attendee mobile UI is readable in dark mode
- [ ] Booth experience (`/visit/*`) is readable in dark mode
- [ ] No flash of unstyled content on navigation
- [ ] `prefers-color-scheme` respected for `themeColor` viewport meta