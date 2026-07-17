"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuthSession } from "./session-provider";

export function UserMenu() {
  const { user, signOut, state } = useAuthSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handle = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", handle);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("mousedown", handle);
      window.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  if (state === "loading") {
    return <div className="h-9 w-20 animate-pulse rounded-md bg-sunken" aria-hidden />;
  }

  if (!user) {
    return (
      <Link
        href="/auth"
        className="inline-flex h-9 items-center justify-center rounded-md border border-strong bg-surface px-4 text-sm font-medium text-primary transition-colors hover:bg-sunken"
      >
        Sign in
      </Link>
    );
  }

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex h-9 items-center gap-2 rounded-md border border-default bg-surface px-2 pr-3 text-sm font-medium text-primary transition-colors hover:bg-sunken"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-[11px] font-semibold text-on-brand">
          {user.initials}
        </span>
        <span className="hidden max-w-[120px] truncate text-left sm:inline">
          {user.displayName}
        </span>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-56 rounded-xl border border-default bg-raised p-1 shadow-3"
        >
          <div className="border-b border-default px-3 py-2">
            <p className="truncate text-sm font-medium text-primary">{user.displayName}</p>
            {user.email && <p className="truncate text-xs text-muted">{user.email}</p>}
          </div>
          <Link
            href="/demo"
            className="block rounded-lg px-3 py-2 text-sm text-primary hover:bg-sunken"
            onClick={() => setOpen(false)}
            role="menuitem"
          >
            Demo launcher
          </Link>
          <Link
            href="/account/profile"
            className="block rounded-lg px-3 py-2 text-sm text-primary hover:bg-sunken"
            onClick={() => setOpen(false)}
            role="menuitem"
          >
            Profile
          </Link>
          <button
            type="button"
            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-primary hover:bg-sunken"
            onClick={handleSignOut}
            role="menuitem"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
