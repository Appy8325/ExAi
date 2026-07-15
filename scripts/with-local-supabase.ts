import { execFileSync } from "node:child_process";

const [command, ...args] = process.argv.slice(2);

if (!command) throw new Error("Provide a command to run.");

const isWindows = process.platform === "win32";
const executable = isWindows ? `${command}.cmd` : command;

let output: string;
try {
  output = execFileSync(
    isWindows ? "cmd.exe" : "npx",
    isWindows
      ? ["/c", "npx", "supabase", "status", "-o", "env"]
      : ["supabase", "status", "-o", "env"],
    {
      encoding: "utf8",
    },
  );
} catch (error) {
  throw new Error(
    "Unable to read local Supabase status. Run 'npx supabase start' before continuing.",
  );
}

const values = Object.fromEntries(
  output
    .split(/\r?\n/)
    .map((line) => line.match(/^([A-Z_]+)=(?:\"([^\"]*)\"|(.*))$/))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .map((match) => [match[1]!, match[2] ?? match[3] ?? ""]),
);

const dbUrl = values.DB_URL ?? process.env.API_DATABASE_URL;
if (!dbUrl) {
  throw new Error("Local Supabase is not running and did not expose a DB URL.");
}

if (isWindows) {
  execFileSync(
    "cmd.exe",
    ["/c", executable, ...args],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        API_DATABASE_URL: process.env.API_DATABASE_URL ?? dbUrl,
        WORKER_DATABASE_URL: process.env.WORKER_DATABASE_URL ?? dbUrl,
      },
      stdio: "inherit",
    },
  );
} else {
  execFileSync(executable, args, {
    cwd: process.cwd(),
    env: {
      ...process.env,
      API_DATABASE_URL: process.env.API_DATABASE_URL ?? dbUrl,
      WORKER_DATABASE_URL: process.env.WORKER_DATABASE_URL ?? dbUrl,
    },
    stdio: "inherit",
  });
}
