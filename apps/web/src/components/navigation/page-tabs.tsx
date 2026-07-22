"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface PageTab {
  id: string;
  label: string;
  href: string;
  count?: number;
}

export interface PageTabsProps {
  tabs: PageTab[];
  className?: string;
}

export function PageTabs({ tabs, className }: PageTabsProps) {
  const pathname = usePathname();
  const firstHref = tabs[0]?.href;

  return (
    <nav className={className}>
      <div className="flex gap-1 border-b border-default">
        {tabs.map((tab) => {
          const isActive =
            firstHref && tab.href === firstHref
              ? pathname === tab.href
              : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.id}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex items-center gap-1.5 px-4 py-2.5 text-body font-medium transition-colors ${
                isActive
                  ? "text-brand"
                  : "text-secondary hover:text-primary"
              }`}
            >
              {isActive && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand" />
              )}
              {tab.label}
              {tab.count !== undefined && (
                <span className={`inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-medium tabular-nums ${
                  isActive
                    ? "bg-brand text-on-brand"
                    : "bg-sunken text-muted"
                }`}>
                  {tab.count}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
