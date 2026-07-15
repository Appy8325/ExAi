import type { ReactNode } from "react";
import { Sidebar } from "./_components/sidebar";

export default function ExhibitorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
