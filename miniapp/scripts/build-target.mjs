import { spawn } from "node:child_process";

const target = process.argv[2];
if (!target) {
  throw new Error("Usage: node scripts/build-target.mjs <target>");
}

const pnpmCli = process.env.npm_execpath;
if (!pnpmCli) {
  throw new Error("npm_execpath is required to locate pnpm.");
}

const child = spawn(
  process.execPath,
  [pnpmCli, "exec", "nitro", "build", "examples/leads"],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      MINIAPP_TARGET: target,
    },
  },
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
