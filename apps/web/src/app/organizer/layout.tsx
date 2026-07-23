import type { ReactNode } from "react";
import Link from "next/link";
import { OrganizerNavigation } from "./organizer-navigation";

export default function OrganizerLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-canvas"><header className="border-b border-default bg-surface"><div className="mx-auto flex max-w-(--mq-content-max) items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8"><Link href="/organizer" className="flex items-center gap-2.5 text-body font-semibold text-primary"><span className="flex size-7 items-center justify-center rounded-lg bg-brand text-on-brand">E</span>ExAi</Link><p className="hidden text-body-sm text-secondary sm:block">ExAi Organization</p></div></header><div className="mx-auto flex max-w-(--mq-content-max) flex-col lg:flex-row"><aside className="border-b border-default bg-surface lg:min-h-[calc(100vh-57px)] lg:w-56 lg:border-b-0 lg:border-r"><OrganizerNavigation /></aside><main id="main" className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main></div></div>;
}
