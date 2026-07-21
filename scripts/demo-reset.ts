import { execFileSync } from "node:child_process";

const isWindows = process.platform === "win32";
const pnpmCommand = isWindows ? "pnpm.cmd" : "pnpm";
const run = (args: string[]) =>
  execFileSync(pnpmCommand, args, { cwd: process.cwd(), stdio: "inherit" });

function resetDemo() {
  // Step 1: Generate deterministic seed data
  console.log("\n[1/5] Generating deterministic demo seed data...");
  execFileSync("npx", ["tsx", "scripts/generate-demo-seed.ts"], {
    cwd: process.cwd(),
    stdio: "inherit",
  });

  // Step 2: Reset local Supabase
  console.log("\n[2/5] Resetting local Supabase...");
  try {
    execFileSync("supabase", ["db", "reset", "--local"], {
      cwd: process.cwd(),
      stdio: "inherit",
    });
  } catch {
    execFileSync("npx", ["supabase", "db", "reset", "--local"], {
      cwd: process.cwd(),
      stdio: "inherit",
    });
  }

  // Step 3: Run migrations
  console.log("\n[3/5] Running database migrations...");
  run(["db:migrate"]);

  // Step 4: Seed the database
  console.log("\n[4/5] Seeding database...");
  run(["db:seed:demo"]);

  // Step 5: Generate embeddings (trigger knowledge base ingestion)
  console.log("\n[5/5] Triggering knowledge base ingestion...");
  try {
    const apiUrl = process.env.API_SUPABASE_URL ?? "http://127.0.0.1:54321";
    fetch(`${apiUrl}/v1/public/demo/ingest`, { method: "POST" }).catch(() => {});
  } catch {
    // Non-critical: ingestion can happen lazily
  }

  console.log("\n✓ Demo reset complete. TechExpo 2027 is ready.");
  console.log("  Start the API server with: pnpm --filter api dev");
  console.log("  Start the web app with:    pnpm --filter web dev");
}

resetDemo();
