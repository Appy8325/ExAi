import { MetricCard } from "@concourse/ui";
import type { MetricCardProps } from "@concourse/ui";

export function KpiGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {children}
    </div>
  );
}

export function KpiCard(props: MetricCardProps) {
  return <MetricCard {...props} />;
}
