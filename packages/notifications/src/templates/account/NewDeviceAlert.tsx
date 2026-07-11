import { Body, Button, Container, Head, Html, Preview, Text } from '@react-email/components';

/**
 * `account.new-device-alert` — docs/33-notification-system.md §4.1.
 *
 * "New `auth_sessions` row from an unrecognized device fingerprint" (doc 33
 * §4.1). Email is mandatory; in-app is optional (doc 33 §4.1 Channels
 * column). This is the ONE fully vendored template in this package —
 * scaffolding-time demonstration of the doc 33 §6 pattern (one React Email
 * component per notification type, composing a shared `<NotificationLayout>`
 * shell in the real implementation). The remaining ~25 templates doc 33 §7
 * enumerates are built as each notification type is implemented in later
 * milestones, not here.
 */
export interface NewDeviceAlertData {
  /** Display name of the account owner, for the greeting. */
  recipientName: string;
  /** Best-effort device/browser description from the session's user agent. */
  deviceDescription: string;
  /** Approximate location derived from the session's IP, if resolvable. */
  approximateLocation?: string;
  /** ISO-8601 timestamp of the sign-in that triggered this alert. */
  signedInAt: string;
  /** Deep link to the account's active-sessions management page. */
  manageSessionsUrl: string;
}

export function NewDeviceAlert({
  recipientName,
  deviceDescription,
  approximateLocation,
  signedInAt,
  manageSessionsUrl,
}: NewDeviceAlertData) {
  return (
    <Html>
      <Head />
      <Preview>New sign-in to your Concourse account</Preview>
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f6f6f6' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '24px' }}>
          <Text style={{ fontSize: '16px', fontWeight: 'bold' }}>New sign-in detected</Text>
          <Text>Hi {recipientName},</Text>
          <Text>
            We noticed a sign-in to your Concourse account from a device we haven&apos;t seen before:
          </Text>
          <Text>
            Device: {deviceDescription}
            <br />
            {approximateLocation ? (
              <>
                Location: {approximateLocation}
                <br />
              </>
            ) : null}
            Time: {signedInAt}
          </Text>
          <Text>If this was you, no action is needed. If you don&apos;t recognize this activity, review your active sessions now.</Text>
          <Button href={manageSessionsUrl} style={{ backgroundColor: '#111111', color: '#ffffff', padding: '12px 20px', borderRadius: '6px' }}>
            Review active sessions
          </Button>
        </Container>
      </Body>
    </Html>
  );
}

export default NewDeviceAlert;
