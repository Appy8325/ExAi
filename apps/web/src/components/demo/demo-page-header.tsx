"use client";

import { SimulationStatusBadge } from "@/components/demo/shell";

export function DemoPageHeader() {
  return (
    <div className="flex items-center justify-center gap-3">
      <SimulationStatusBadge />
    </div>
  );
}