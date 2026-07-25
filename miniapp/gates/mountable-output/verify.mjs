import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const outputUrl = new URL("./.output/server/index.mjs", import.meta.url);
const manifestUrl = new URL("./.output/codebolt/static-assets.json", import.meta.url);
const beforeHandles = process._getActiveHandles().filter(
  (handle) => handle?.constructor?.name === "Server",
).length;

const module = await import(outputUrl.href);
const fetch = module.fetch ?? module.default?.fetch;
assert.equal(typeof fetch, "function");

const response = await fetch(
  new Request("http://gate.localhost/echo?source=gate", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-gate": "mountable",
    },
    body: JSON.stringify({ value: 42 }),
  }),
);

assert.equal(response.status, 200);
assert.deepEqual(await response.json(), {
  method: "POST",
  pathname: "/echo",
  query: { source: "gate" },
  header: "mountable",
  body: { value: 42 },
});

const assets = JSON.parse(await readFile(manifestUrl, "utf8"));
assert.deepEqual(assets, [{ path: "gate.txt", size: 13 }]);

const afterHandles = process._getActiveHandles().filter(
  (handle) => handle?.constructor?.name === "Server",
).length;
assert.equal(afterHandles, beforeHandles);

console.log("Gate 1 passed: mountable fetch output with no listening server.");
