"use client";

import { useEffect, useState, useRef } from "react";

export function AnimatedCounter({
  value,
  duration = 200,
  suffix = "",
}: {
  value: number;
  duration?: number;
  suffix?: string;
}) {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    if (start === end) { setDisplay(end); return; }
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    prevRef.current = end;
    requestAnimationFrame(animate);
  }, [value, duration]);

  return <>{display}{suffix}</>;
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
