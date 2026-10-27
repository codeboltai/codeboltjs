import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parseMiniAppArchive } from "../packages/miniapp/src/bundle.mjs";

test("published Nitro output is one generic MiniApp bundle", async () => {
  const parsed = await parseMiniAppArchive(await readFile("dist/leads.miniapp"));
  assert.equal(parsed.manifest.id, "leads");
  assert.equal(parsed.manifest.runtime.protocol, "codebolt.fetch.v1");
  assert.equal(parsed.manifest.runtime.mainModule, "modules/__nitro_adapter.mjs");
  assert.equal(parsed.manifest.build.adapter, "nitro");
  assert.ok(parsed.manifest.tools.some((tool) => tool.name === "add-lead"));
  assert.ok(parsed.files.has("modules/nitro/index.mjs"));
  assert.ok(parsed.files.has("public/index.html"));
  const adapter = new TextDecoder().decode(parsed.files.get("modules/__nitro_adapter.mjs").data);
  assert.match(adapter, /CODEBOLT_MINIAPP_RUNTIME/);
  assert.doesNotMatch(adapter, /DurableObject|MiniAppFacet/);
});
