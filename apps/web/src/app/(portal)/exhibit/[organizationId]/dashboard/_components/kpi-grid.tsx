import type { ReactNode } from "react";

interface KpiCardProps {
  label: string;
  value: string;
  detail?: string;
  trend?: { value: string; positive: boolean };
}

export function KpiCard({ label, value, detail, trend }: KpiCardProps) {
  return (
    <li className="rounded-lg border border-default bg-surface p-4">
      <p className="text-caption font-medium text-secondary">{label}</p>
      <p className="mt-1 text-title font-semibold tabular-nums text-primary">{value}</p>
      {detail && <p className="mt-0.5 text-caption text-muted">{detail}</p>}
      {trend && (
        <p className={`mt-1 text-caption font-medium ${trend.positive ? "text-status-success-text" : "text-status-danger-text"}`}>
          {trend.value}
        </p>
      )}
    </li>
  );
}

interface KpiGridProps {
  children: ReactNode;
}

export function KpiGrid({ children }: KpiGridProps) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" role="list">
      {children}
    </ul>
  );
}