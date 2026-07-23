"use client";

import { AnimatedCounter as SharedAnimatedCounter } from "@concourse/ui";

export function AnimatedCounter({
  value,
  duration = 200,
  suffix = "",
}: {
  value: number;
  duration?: number;
  suffix?: string;
}) {
  return <><SharedAnimatedCounter value={value} duration={duration} format={false} />{suffix}</>;
}

export function AnimatedMetricCard({
  label,
  value,
  detail,
  suffix = "",
  className,
}: {
  label: string;
  value: number;
  detail?: string;
  suffix?: string;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border border-default bg-surface p-4 shadow-1 space-y-1.5 ${className ?? ""}`}>
      <p className="text-caption font-medium text-secondary">{label}</p>
      <p className="text-title-lg font-semibold tabular-nums text-primary">
        <AnimatedCounter value={value} suffix={suffix} />
      </p>
      {detail && <p className="text-body-sm text-muted">{detail}</p>}
    </div>
  );
}
