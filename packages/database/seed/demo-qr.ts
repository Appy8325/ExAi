import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import QRCode from "qrcode";

export type DemoBooth = {
  id: string;
  publicToken: string;
  name: string;
  number: string;
  organizationId: string;
  relationshipId?: string;
};

export async function generateDemoQrCodes(
  booths: DemoBooth[],
  outputRoot = resolve(process.cwd(), "../.."),
) {
  const folder = resolve(outputRoot, "demo/qr");
  await mkdir(folder, { recursive: true });
  await Promise.all(
    booths.map((booth) =>
      QRCode.toFile(
        resolve(
          folder,
          `booth-${booth.number.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.png`,
        ),
        `http://localhost:3000/visit/${booth.publicToken}`,
        { width: 640, margin: 2 },
      ),
    ),
  );
  await writeFile(
    resolve(folder, "manifest.json"),
    `${JSON.stringify(booths, null, 2)}\n`,
  );
}
