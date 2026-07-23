"use client";

import { Button, EmptyState } from "@concourse/ui";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl items-center px-gutter py-section">
      <EmptyState
        title="Unable to load this page"
        description="Please try again. Your changes have not been lost."
        action={<Button onClick={reset}>Try again</Button>}
      />
    </main>
  );
}
