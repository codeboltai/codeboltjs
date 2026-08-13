import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const nodeExecutable = process.env.MINIAPP_NODE_EXECUTABLE || process.execPath;
const wrangler = resolve("node_modules/wrangler/bin/wrangler.js");
const port = Number(process.env.MINIAPP_TEST_PORT || 8792);
const server = `http://127.0.0.1:${port}`;
const child = spawn(nodeExecutable, [wrangler, "dev", "--local", "--ip", "127.0.0.1", "--port", String(port), "--show-interactive-dev-session", "false", "--config", "apps/miniapp-server/wrangler.jsonc"], { stdio: ["ignore", "pipe", "pipe"] });
const logs = [];
child.stdout.on("data", (data) => logs.push(data.toString()));
child.stderr.on("data", (data) => logs.push(data.toString()));

async function waitForServer() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (child.exitCode !== null) throw new Error(`Wrangler exited early.\n${logs.join("")}`);
    try {
      if ((await fetch(`${server}/health`)).ok) return;
    } catch {}
    await delay(250);
  }
  throw new Error(`Wrangler did not start.\n${logs.join("")}`);
}

async function request(path, options) {
  const response = await fetch(`${server}${path}`, options);
  const body = await response.json();
  if (!response.ok) throw new Error(`${response.status} ${JSON.stringify(body)}`);
  return body;
}

try {
  await waitForServer();
  const archive = await readFile("dist/hello-miniapp.miniapp");
  const installed = await request("/api/packages", { method: "POST", headers: { "content-type": "application/vnd.codebolt.miniapp" }, body: archive });
  for (const id of ["integration-one", "integration-two"]) {
    await request("/api/scopes/integration-thread/instances", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ packageId: installed.packageId, instanceId: id }) });
  }
  assert.equal((await request("/run/integration-thread/integration-one/api/counter/increment", { method: "POST" })).value, 1);
  assert.equal((await request("/run/integration-thread/integration-two/api/counter")).value, 0);
  await request("/api/scopes/integration-thread/instances/integration-one/stop", { method: "POST" });
  assert.equal((await request("/run/integration-thread/integration-one/api/counter")).value, 1);
  const html = await fetch(`${server}/run/integration-thread/integration-one/`).then((response) => response.text());
  assert.match(html, /Hello MiniApp/);
  await request("/api/scopes/integration-thread/instances/integration-two", { method: "DELETE" });
  const missing = await fetch(`${server}/run/integration-thread/integration-two/api/counter`);
  assert.equal(missing.status, 404);
  console.log(JSON.stringify({ success: true, packageId: installed.packageId, tested: ["upload", "create", "facet", "storage-isolation", "stop-resume", "assets", "delete"] }, null, 2));
} finally {
  child.kill();
  await Promise.race([once(child, "exit").catch(() => {}), delay(2000)]);
}
