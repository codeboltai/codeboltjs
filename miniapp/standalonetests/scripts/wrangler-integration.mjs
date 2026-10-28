import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const nodeExecutable = process.env.MINIAPP_NODE_EXECUTABLE || process.execPath;
const wrangler = resolve("node_modules/wrangler/bin/wrangler.js");
const port = Number(process.env.MINIAPP_TEST_PORT || 8792);
const server = `http://127.0.0.1:${port}`;
const stateDirectory = await mkdtemp(join(tmpdir(), "codebolt-miniapp-test-"));
const child = spawn(nodeExecutable, [wrangler, "dev", "--local", "--ip", "127.0.0.1", "--port", String(port), "--persist-to", stateDirectory, "--show-interactive-dev-session", "false", "--config", "apps/miniapp-server/wrangler.jsonc"], { stdio: ["ignore", "pipe", "pipe"] });
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
  let response;
  try {
    response = await fetch(`${server}${path}`, { ...options, signal: AbortSignal.timeout(15000) });
  } catch (error) {
    throw new Error(`Request timed out or failed: ${path}`, { cause: error });
  }
  const body = await response.json();
  if (!response.ok) throw new Error(`${response.status} ${JSON.stringify(body)}`);
  return body;
}

try {
  await waitForServer();
  console.log("Wrangler ready; testing plain MiniApp runtime.");
  const archive = await readFile("dist/hello-miniapp.miniapp");
  const installed = await request("/api/packages", { method: "POST", headers: { "content-type": "application/vnd.codebolt.miniapp" }, body: archive });
  for (const id of ["integration-one", "integration-two"]) {
    await request("/api/scopes/integration-thread/instances", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ packageId: installed.packageId, instanceId: id }) });
  }
  assert.equal((await request("/run/integration-thread/integration-one/api/counter/increment", { method: "POST" })).value, 1);
  assert.equal((await request("/run/integration-thread/integration-two/api/counter")).value, 0);
  await request("/api/scopes/integration-thread/instances/integration-one/stop", { method: "POST" });
  assert.equal((await request("/run/integration-thread/integration-one/api/counter")).value, 1);
  const html = await fetch(`${server}/run/integration-thread/integration-one/`, { signal: AbortSignal.timeout(15000) }).then((response) => response.text());
  assert.match(html, /Hello MiniApp/);
  await request("/api/scopes/integration-thread/instances/integration-two", { method: "DELETE" });
  const missing = await fetch(`${server}/run/integration-thread/integration-two/api/counter`, { signal: AbortSignal.timeout(15000) });
  assert.equal(missing.status, 404);

  const nitroArchive = await readFile("dist/nitro-miniapp.miniapp");
  console.log("Plain MiniApp passed; testing Nitro MiniApp runtime.");
  const nitroInstalled = await request("/api/packages", { method: "POST", headers: { "content-type": "application/vnd.codebolt.miniapp" }, body: nitroArchive });
  await request("/api/scopes/nitro-thread/instances", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ packageId: nitroInstalled.packageId, instanceId: "nitro-one" }) });
  assert.equal((await request("/run/nitro-thread/nitro-one/api/counter")).value, 0);
  assert.equal((await request("/run/nitro-thread/nitro-one/api/counter/increment", { method: "POST" })).value, 1);
  assert.deepEqual(await request("/run/nitro-thread/nitro-one/api/blob", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key: "note.txt", value: "persisted by Nitro" }) }), { stored: true, key: "note.txt" });
  assert.equal((await request("/run/nitro-thread/nitro-one/api/blob?key=note.txt")).value, "persisted by Nitro");
  const nitroHtml = await fetch(`${server}/run/nitro-thread/nitro-one/`, { signal: AbortSignal.timeout(15000) }).then((response) => response.text());
  assert.match(nitroHtml, /Nitro MiniApp/);
  console.log(JSON.stringify({ success: true, packageIds: [installed.packageId, nitroInstalled.packageId], tested: ["upload", "create", "server-owned-facet", "storage-isolation", "stop-resume", "assets", "delete", "nitro-module-graph", "nitro-runtime-bridge", "document-storage", "blob-storage"] }, null, 2));
} catch (error) {
  console.error(logs.join(""));
  throw error;
} finally {
  if (process.platform === "win32" && child.pid) spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore" });
  else child.kill();
  child.stdout.destroy();
  child.stderr.destroy();
  await Promise.race([once(child, "exit").catch(() => {}), delay(2000)]);
  await delay(250);
  await rm(stateDirectory, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }).catch(() => {});
}
