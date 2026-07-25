import assert from "node:assert/strict";
import { WorkerFetchClient } from "../../packages/host/src/worker-transport.mjs";

const handlerUrl = new URL("../mountable-output/.output/server/index.mjs", import.meta.url);
const client = new WorkerFetchClient(handlerUrl);

assert.equal(client.active, false);

const parts = ['{"value":', "42", "}"];
const body = new ReadableStream({
  pull(controller) {
    const part = parts.shift();
    if (part === undefined) {
      controller.close();
    } else {
      controller.enqueue(new TextEncoder().encode(part));
    }
  },
});

const response = await client.fetch(
  new Request("http://gate.localhost/echo?source=worker", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-gate": "worker",
    },
    body,
    duplex: "half",
  }),
);

assert.equal(client.active, true);
assert.equal(response.status, 200);
assert.deepEqual(await response.json(), {
  method: "POST",
  pathname: "/echo",
  query: { source: "worker" },
  header: "worker",
  body: { value: 42 },
});

const abortController = new AbortController();
const cancelled = client.fetch(
  new Request("http://gate.localhost/cancel?ms=500"),
  { signal: abortController.signal },
);
setTimeout(() => abortController.abort(), 20);
await assert.rejects(cancelled, /cancel|Abort|aborted/i);

await client.close();
assert.equal(client.active, false);

console.log("Gate 2 passed: chunked Request/Response transport through a Worker.");
