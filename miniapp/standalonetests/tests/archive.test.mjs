import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
import { buildMiniAppArchive, parseMiniAppArchive } from "../packages/miniapp-format/src/index.mjs";

const manifest = {
  format: "codebolt.miniapp.v1",
  id: "test-app",
  title: "Test App",
  version: "1.0.0",
  runtime: { protocol: "codebolt.fetch.v1", mainModule: "modules/main.mjs", compatibilityDate: "2026-07-29" },
  ui: { entry: "public/index.html" },
};

const files = [
  { path: "modules/main.mjs", kind: "module", mediaType: "text/javascript", data: "export default { fetch(){ return new Response('ok') } }" },
  { path: "public/index.html", kind: "asset", mediaType: "text/html", data: "<h1>OK</h1>" },
];

test("archive build is deterministic and round-trips", async () => {
  const first = await buildMiniAppArchive({ manifest, files });
  const second = await buildMiniAppArchive({ manifest, files: [...files].reverse() });
  assert.deepEqual(first, second);
  const parsed = await parseMiniAppArchive(first);
  assert.equal(parsed.manifest.id, "test-app");
  assert.equal(parsed.files.size, 2);
  assert.equal(new TextDecoder().decode(parsed.files.get("public/index.html").data), "<h1>OK</h1>");
});

test("archive rejects traversal and corruption", async () => {
  await assert.rejects(() => buildMiniAppArchive({ manifest, files: [...files, { path: "../secret", data: "x" }] }), /Unsafe MiniApp path/);
  const archive = await buildMiniAppArchive({ manifest, files });
  archive[archive.length - 1] ^= 0xff;
  await assert.rejects(() => parseMiniAppArchive(archive), /Checksum mismatch/);
});

test("pack script output parses", async () => {
  const path = resolve("dist/hello-miniapp.miniapp");
  try {
    const parsed = await parseMiniAppArchive(await readFile(path));
    assert.equal(parsed.manifest.id, "hello-miniapp");
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
});
