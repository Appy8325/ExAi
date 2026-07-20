import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import QRCode from "qrcode";

async function main() {
  const outputRoot = resolve(process.cwd(), "../..");
  const folder = resolve(outputRoot, "apps/web/public/qr");
  await mkdir(folder, { recursive: true });

  const url = process.env.EVENT_QR_URL ?? "http://localhost:3000/hackathon";

  await QRCode.toFile(
    resolve(folder, "hackathon-event.png"),
    url,
    { width: 640, margin: 2 },
  );

  console.warn("Event QR generated at apps/web/public/qr/hackathon-event.png");
  console.warn(`URL: ${url}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
