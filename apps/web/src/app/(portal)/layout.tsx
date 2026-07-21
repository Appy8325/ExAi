import type { ReactNode } from "react";
import { GlobalNav } from "@/components/navigation/global-nav";

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <GlobalNav variant="compact" />
      <div className="flex-1">{children}</div>
    </div>
  );
}
