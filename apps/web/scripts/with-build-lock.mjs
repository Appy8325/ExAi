import { open, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const lockPath = resolve(appDir, ".next-build.lock");

let lock;
try {
  lock = await open(lockPath, "wx");
  await lock.writeFile(`${process.pid}\n`);
} catch (error) {
  if (error?.code === "EEXIST") {
    console.error("A web production build is already running; wait for it to finish.");
    process.exit(1);
  }
  throw error;
}

const nextBin = resolve(appDir, "node_modules", "next", "dist", "bin", "next");
const child = spawn(process.execPath, [nextBin, "build"], { cwd: appDir, stdio: "inherit" });
const cleanup = async () => {
  await lock?.close();
  await rm(lockPath, { force: true });
};

for (const signal of ["SIGINT", "SIGTERM"]) process.once(signal, () => child.kill(signal));
child.once("exit", async (code) => {
  await cleanup();
  process.exit(code ?? 1);
});
child.once("error", async (error) => {
  console.error(error);
  await cleanup();
  process.exit(1);
});
