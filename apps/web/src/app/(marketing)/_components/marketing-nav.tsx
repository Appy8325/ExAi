"use client";

import { useState } from "react";
import Link from "next/link";
import type { ReactNode } from "react";

const links = [
  { href: "/hackathon", label: "Hackathon" },
  { href: "/demo", label: "Demo" },
  { href: "/auth", label: "Sign in" },
];

export function MarketingNav({ logo }: { logo: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-default/50 bg-canvas/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 sm:px-10">
        {logo}
        <nav className="hidden items-center gap-6 sm:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-secondary transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/demo"
            className="inline-flex h-9 items-center rounded-lg bg-brand px-4 text-sm font-medium text-on-brand shadow-1 transition-colors hover:bg-brand-hover"
          >
            Try demo
          </Link>
        </nav>
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-default bg-surface text-secondary sm:hidden"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 5h10M3 8h10M3 11h10" />
            </svg>
          )}
        </button>
      </div>
      {mobileOpen && (
        <nav className="flex flex-col gap-1 border-t border-default px-4 pb-4 pt-3 sm:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-primary hover:bg-sunken"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/demo"
            className="mt-1 rounded-lg bg-brand px-3 py-2 text-center text-sm font-medium text-on-brand"
            onClick={() => setMobileOpen(false)}
          >
            Try demo
          </Link>
        </nav>
      )}
    </header>
  );
}