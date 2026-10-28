import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parseMiniAppArchive } from "../packages/miniapp-format/src/index.mjs";

test("Nitro output is packaged behind the generic fetch ABI", async () => {
  const parsed = await parseMiniAppArchive(await readFile("dist/nitro-miniapp.miniapp"));
  assert.equal(parsed.manifest.id, "nitro-miniapp");
  assert.equal(parsed.manifest.runtime.protocol, "codebolt.fetch.v1");
  assert.equal(parsed.manifest.runtime.mainModule, "modules/__nitro_adapter.mjs");
  assert.equal(parsed.manifest.build.adapter, "nitro");
  assert.ok(parsed.files.has("modules/nitro/index.mjs"));
  assert.ok([...parsed.files.keys()].some((path) => /^modules\/nitro\/_/.test(path)));
  assert.ok(parsed.files.has("public/index.html"));
  const adapter = new TextDecoder().decode(parsed.files.get("modules/__nitro_adapter.mjs").data);
  assert.match(adapter, /CODEBOLT_MINIAPP_RUNTIME/);
  assert.match(adapter, /ASSETS: runtime\.assets/);
  assert.doesNotMatch(adapter, /DurableObject|MiniAppFacet/);
});

test("Nitro metadata rejects a non-module Cloudflare preset", async () => {
  const { buildNitroMiniAppArchive } = await import("../packages/nitro-adapter/src/index.mjs");
  await assert.rejects(() => buildNitroMiniAppArchive({ outputDir: "apps/hello-miniapp" }), /nitro\.json|ENOENT/);
});
