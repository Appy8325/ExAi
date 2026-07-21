"use client";

import { useEffect, useState } from "react";

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 5) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

export function RelativeTime({ timestamp }: { timestamp: string }) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    const date = new Date(timestamp);
    setLabel(formatRelativeTime(date));
    const interval = setInterval(() => {
      setLabel(formatRelativeTime(new Date(timestamp)));
    }, 30000);
    return () => clearInterval(interval);
  }, [timestamp]);

  return <span title={new Date(timestamp).toLocaleString()}>{label || formatRelativeTime(new Date(timestamp))}</span>;
}
