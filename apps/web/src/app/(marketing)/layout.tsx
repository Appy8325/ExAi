import type { ReactNode } from "react";

import { GlobalNav } from "@/components/navigation";
import { MarketingFooter } from "./_components/marketing-footer";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-primary">
      <GlobalNav variant="marketing" active="experience" />
      <main id="main" className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
