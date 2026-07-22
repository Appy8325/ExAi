"use client";

import Link from "next/link";

export interface BackLinkProps {
  label: string;
  href?: string;
}

export function BackLink({ label, href }: BackLinkProps) {
  return (
    <Link
      href={href ?? "/"}
      className="inline-flex min-h-10 items-center gap-1 rounded-md px-2.5 py-1 text-caption font-medium text-secondary transition-colors hover:bg-sunken hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <path d="M10 12l-4-4 4-4" />
      </svg>
      Back to {label}
    </Link>
  );
}
