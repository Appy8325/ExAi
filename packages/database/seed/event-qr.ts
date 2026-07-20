import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import QRCode from "qrcode";

async function main() {
  const outputRoot = resolve(process.cwd(), "../..");
  const folder = resolve(outputRoot, "demo/qr");
  await mkdir(folder, { recursive: true });

  const url = "http://localhost:3000/hackathon";

  await QRCode.toFile(
    resolve(folder, "event-entrance.png"),
    url,
    { width: 640, margin: 2 },
  );

  console.log("Event entrance QR generated at demo/qr/event-entrance.png");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
