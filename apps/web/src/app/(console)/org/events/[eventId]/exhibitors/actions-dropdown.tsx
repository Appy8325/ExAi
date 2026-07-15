"use client";

import Link from "next/link";
import { useState, useCallback } from "react";

interface DropdownAction {
  label: string;
  href?: string;
  separator?: boolean;
}

export function ActionsDropdown({
  eventId,
  exhibitorId,
}: {
  eventId: string;
  exhibitorId: string;
}) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  const actions: DropdownAction[] = [
    {
      label: "Open Exhibitor",
      href: `/org/events/${eventId}/exhibitors/${exhibitorId}`,
    },
    { label: "separator-1", separator: true },
    { label: "Invite Users" },
    { label: "Manage Team" },
    { label: "separator-2", separator: true },
    { label: "Upload Branding" },
    { label: "Upload Collateral" },
    { label: "Upload Documents" },
    { label: "separator-3", separator: true },
    { label: "Configure AI Memory" },
    { label: "View QR" },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-sm text-secondary hover:bg-sunken hover:text-primary"
        aria-label="Exhibitor actions"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={close} aria-hidden="true" />
          <div
            className="absolute right-0 z-40 mt-1 w-56 rounded-lg border border-default bg-raised py-1 shadow-4"
            role="menu"
          >
            {actions.map((item) =>
              item.separator ? (
                <div key={item.label} className="my-1 border-t border-default" />
              ) : item.href ? (
                <Link
                  key={item.label}
                  href={item.href}
                  role="menuitem"
                  className="block px-3 py-1.5 text-sm text-primary hover:bg-sunken"
                  onClick={close}
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  className="block w-full px-3 py-1.5 text-left text-sm text-primary hover:bg-sunken"
                  onClick={close}
                >
                  {item.label}
                </button>
              ),
            )}
          </div>
        </>
      )}
    </div>
  );
}
