import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("server config declares loader, supervisor, storage, and package bucket", async () => {
  const config = JSON.parse(await readFile("apps/miniapp-server/wrangler.jsonc", "utf8"));
  assert.equal(config.worker_loaders[0].binding, "MINIAPP_LOADER");
  assert.deepEqual(config.migrations[0].new_sqlite_classes, ["MiniAppSupervisor", "MiniAppStorage"]);
  assert.equal(config.r2_buckets[0].binding, "MINIAPP_PACKAGES");
  assert.ok(config.compatibility_date >= "2025-11-17", "ctx.exports must be enabled by the compatibility date");
});

test("runtime wrapper remains server-owned", async () => {
  const wrapper = await readFile("apps/miniapp-server/src/runtime-wrapper.ts", "utf8");
  const application = await readFile("apps/hello-miniapp/modules/main.mjs", "utf8");
  assert.match(wrapper, /class MiniAppFacet extends DurableObject/);
  assert.doesNotMatch(application, /DurableObject|cloudflare:workers/);
});

test("server owns the Nitro runtime capabilities and asset loopback", async () => {
  const wrapper = await readFile("apps/miniapp-server/src/runtime-wrapper.ts", "utf8");
  const assets = await readFile("apps/miniapp-server/src/assets.ts", "utf8");
  const nitroAdapter = await readFile("packages/nitro-adapter/src/index.mjs", "utf8");
  assert.match(wrapper, /db:|\bdb,/);
  assert.match(wrapper, /blob:/);
  assert.match(wrapper, /assets: this\.env\.ASSETS/);
  assert.match(assets, /class MiniAppAssets extends WorkerEntrypoint/);
  assert.doesNotMatch(nitroAdapter, /MiniAppSupervisor|DurableObject/);
});
