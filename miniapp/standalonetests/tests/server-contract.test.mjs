import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("server config declares loader, supervisor, storage, and package bucket", async () => {
  const config = JSON.parse(await readFile("apps/miniapp-server/wrangler.jsonc", "utf8"));
  assert.equal(config.worker_loaders[0].binding, "MINIAPP_LOADER");
  assert.deepEqual(config.migrations[0].new_sqlite_classes, ["MiniAppSupervisor", "MiniAppStorage"]);
  assert.equal(config.r2_buckets[0].binding, "MINIAPP_PACKAGES");
});

test("runtime wrapper remains server-owned", async () => {
  const wrapper = await readFile("apps/miniapp-server/src/runtime-wrapper.ts", "utf8");
  const application = await readFile("apps/hello-miniapp/modules/main.mjs", "utf8");
  assert.match(wrapper, /class MiniAppFacet extends DurableObject/);
  assert.doesNotMatch(application, /DurableObject|cloudflare:workers/);
});
