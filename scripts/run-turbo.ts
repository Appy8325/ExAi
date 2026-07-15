import { spawnSync } from "node:child_process";

const { COREPACK_ROOT: _corepackRoot, ...env } = process.env;
const result = spawnSync("turbo", process.argv.slice(2), { env, shell: process.platform === "win32", stdio: "inherit" });
process.exitCode = result.status ?? 1;
