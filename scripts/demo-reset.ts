import { execFileSync } from "node:child_process";

const isWindows = process.platform === "win32";
const pnpmCommand = isWindows ? "pnpm.cmd" : "pnpm";
const run = (args: string[]) =>
  execFileSync(pnpmCommand, args, { cwd: process.cwd(), stdio: "inherit" });

export const demoResetSteps = [
  "npx supabase db reset --local",
  "pnpm db:migrate",
  "pnpm db:seed:demo",
] as const;

export function resetDemo() {
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

  run(["db:migrate"]);
  run(["db:seed:demo"]);
}

if (process.argv[1]?.endsWith("demo-reset.ts")) resetDemo();
