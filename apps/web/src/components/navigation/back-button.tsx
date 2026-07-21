"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
}

export function BackButton({
  href,
  label = "Back",
  className = "",
}: BackButtonProps) {
  const router = useRouter();
  const [canGoBack, setCanGoBack] = React.useState(false);

  React.useEffect(() => {
    setCanGoBack(window.history.length > 1);
  }, []);

  if (href) {
    return (
      <Link
        href={href}
        className={`inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-primary ${className}`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
          className="transition-transform group-hover:-translate-x-0.5"
        >
          <path d="M10 12L6 8l4-4" />
        </svg>
        {label}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => router.back()}
      disabled={!canGoBack}
      className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${
        canGoBack
          ? "text-muted hover:text-primary"
          : "cursor-default text-muted/50"
      } ${className}`}
      aria-label={canGoBack ? `Go back to ${label}` : "Cannot go back"}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <path d="M10 12L6 8l4-4" />
      </svg>
      {label}
    </button>
  );
}

interface NextActionProps {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
  className?: string;
}

export function NextAction({
  href,
  label,
  variant = "primary",
  className = "",
}: NextActionProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all hover:scale-[1.02] ${
        variant === "primary"
          ? "bg-brand text-on-brand"
          : "border border-default bg-surface text-primary hover:bg-sunken"
      } ${className}`}
    >
      {label}
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
        className="transition-transform group-hover:translate-x-0.5"
      >
        <path d="M6 4l4 4-4 4" />
      </svg>
    </Link>
  );
}