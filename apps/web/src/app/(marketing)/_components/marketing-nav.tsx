"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { ReactNode } from "react";

const links = [
  { href: "/hackathon", label: "Hackathon" },
  { href: "/demo", label: "Demo" },
  { href: "/auth", label: "Sign in" },
];

export function MarketingNav({ logo }: { logo: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-(--mq-z-sticky) border-b border-default/50 bg-canvas/80 backdrop-blur-xl">
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
            className="inline-flex h-9 items-center rounded-lg bg-brand px-4 text-sm font-medium text-on-brand shadow-1 transition-all duration-[var(--mq-duration-fast)] ease-[var(--mq-ease-standard)] will-change-transform hover:bg-brand-hover hover:scale-[1.02]"
          >
            Try demo
          </Link>
        </nav>
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-default bg-surface text-secondary transition-colors hover:bg-sunken sm:hidden"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <path d="M3 5h10M3 8h10M3 11h10" />
            </svg>
          )}
        </button>
      </div>
      <div
        id="mobile-menu"
        ref={menuRef}
        role="region"
        aria-label="Mobile navigation"
        className={`overflow-hidden transition-all duration-[var(--mq-duration-moderate)] ease-[var(--mq-ease-standard)] sm:hidden ${
          mobileOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-1 border-t border-default px-4 pb-4 pt-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-sunken"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/demo"
            className="mt-1 rounded-lg bg-brand px-3 py-2 text-center text-sm font-medium text-on-brand transition-colors hover:bg-brand-hover"
            onClick={() => setMobileOpen(false)}
          >
            Try demo
          </Link>
        </nav>
      </div>
    </header>
  );
}