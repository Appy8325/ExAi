import type { ReactNode } from "react";

export function KpiGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">{children}</div>;
}

export function KpiCard({ label, value, trend }: { label: string; value: string | number; trend?: { direction: "up" | "down"; label: string } }) {
  return (
    <div className="rounded-xl border border-default bg-surface p-4">
      <p className="text-caption font-medium text-secondary">{label}</p>
      <p className="mt-1 text-title font-semibold tabular-nums text-primary">{value}</p>
      {trend && (
        <p className={`mt-1 flex items-center gap-1 text-caption ${trend.direction === "up" ? "text-status-success-text" : "text-status-danger-text"}`}>
          <span>{trend.direction === "up" ? "↑" : "↓"}</span>
          <span>{trend.label}</span>
        </p>
      )}
    </div>
  );
}
