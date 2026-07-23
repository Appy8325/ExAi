import Link from "next/link";
import { Button } from "@concourse/ui";

export function QuickActions({
  organizationId,
  eventExhibitorId,
}: {
  organizationId?: string;
  eventExhibitorId?: string;
}) {
  const basePath = organizationId ? `/exhibit/${organizationId}` : "/exhibit";
  const context = eventExhibitorId ? `?eeId=${eventExhibitorId}` : "";

  return (
    <div className="flex flex-wrap gap-3">
      <Button asChild>
        <Link href={`${basePath}/qr${context}`}>Share QR Code</Link>
      </Button>
      <Button variant="secondary" asChild>
        <Link href={`${basePath}/attendees${context}`}>View Visitors</Link>
      </Button>
      <Button variant="secondary" asChild>
        <Link href={`${basePath}/settings`}>Booth Settings</Link>
      </Button>
    </div>
  );
}
