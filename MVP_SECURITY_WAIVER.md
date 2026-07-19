# MVP security waiver: malware scanning

## Scope

For customer demonstrations and controlled pilot deployments hosted entirely on Vercel, ExAi temporarily bypasses ClamAV scanning when `MVP_VERCEL_MODE=true`. The waiver is selected through the existing `MalwareScanner` boundary. ClamAV integration and the worker path remain intact and are the default outside MVP mode.

## Why scanning is temporarily disabled

ClamAV requires a reachable, continuously running daemon. The approved MVP architecture permits only Vercel, Supabase, and NVIDIA Build, so there is no service on which to run that daemon. Vercel Functions cannot provide an always-on ClamAV socket.

## Compensating upload controls

Before a signed upload URL is issued, the API enforces a 25 MB maximum, a source-specific MIME allowlist, and an extension/MIME match. Before uploaded content is indexed, the function downloads the object and repeats size, MIME, and extension checks, validates PDF/PPTX/text magic signatures, and rejects malformed or binary text. These controls reduce accidental and disguised-file uploads; they do not detect malware.

## Accepted risks

- A valid-looking PDF, PPTX, or text file may still contain malicious content.
- Infected files can remain in private Supabase Storage until removed.
- Anyone downloading an unscanned file could be exposed to client-side parser or viewer vulnerabilities.
- Signature validation is not a substitute for antivirus scanning or content disarm and reconstruction.

Use this mode only for trusted demo/pilot participants, keep the uploads bucket private, limit access, and remove pilot uploads after each engagement. Do not use this waiver for a public production release.

## Re-enable ClamAV

1. Unset `MVP_VERCEL_MODE`.
2. Restore the dedicated API/worker deployment described in `MVP_DEPLOYMENT.md`.
3. Start Redis/BullMQ and a network-reachable ClamAV daemon.
4. Set `WORKER_CLAMAV_HOST` and `WORKER_CLAMAV_PORT` on the worker.
5. Run clean-file, EICAR/infected-file, timeout, and unavailable-scanner verification before public release.

Without the MVP flag, `ClamAvMalwareScanner` remains the default and rejects uploaded documents if ClamAV is missing or does not return a clean verdict.
