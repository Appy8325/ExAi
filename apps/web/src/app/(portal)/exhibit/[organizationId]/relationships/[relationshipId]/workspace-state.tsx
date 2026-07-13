export function WorkspaceLoading() {
  return <main aria-label="Loading relationship workspace" className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6"><div className="h-40 animate-pulse rounded-xl bg-sunken" /><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div className="h-24 animate-pulse rounded-xl bg-sunken" key={index} />)}</div><div className="h-80 animate-pulse rounded-xl bg-sunken" /></main>;
}

export function WorkspaceMessage({ title, detail }: { title: string; detail: string }) {
  return <main className="mx-auto flex min-h-screen max-w-2xl items-center p-6"><section aria-live="polite" className="w-full rounded-xl border border-strong bg-surface p-6"><h1 className="text-xl font-semibold text-primary">{title}</h1><p className="mt-2 text-secondary">{detail}</p></section></main>;
}
