import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { createServer } from "node:http";
import { once } from "node:events";
import test from "node:test";

function base64url(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function makeDevToken() {
  return [
    base64url({ alg: "none", typ: "JWT" }),
    base64url({
      userId: "dev-user",
      workspaceId: "remote-workspace",
      installId: "remote-install",
      miniAppId: "leads",
      aud: "leads",
      exp: Math.floor(Date.now() / 1000) + 60,
    }),
    "dev",
  ].join(".");
}

function createMockCloud() {
  const documents = new Map();
  const calls = [];
  const server = createServer(async (request, response) => {
    const chunks = [];
    for await (const chunk of request) {
      chunks.push(chunk);
    }
    const body = chunks.length
      ? JSON.parse(Buffer.concat(chunks).toString("utf8"))
      : {};
    const capability = decodeURIComponent(
      new URL(request.url, "http://cloud.test").pathname.split("/").at(-1),
    );
    calls.push({
      capability,
      authorization: request.headers.authorization,
      body,
    });

    if (!request.headers.authorization?.startsWith("Bearer ")) {
      response.writeHead(401, { "content-type": "application/json" });
      response.end(JSON.stringify({ error: "missing bearer" }));
      return;
    }

    if (capability === "db.set") {
      const document = { ...body.document, id: body.id };
      documents.set(body.id, document);
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify(document));
      return;
    }
    if (capability === "db.list") {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ documents: [...documents.values()] }));
      return;
    }

    response.writeHead(500, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: `unexpected ${capability}` }));
  });

  return {
    server,
    calls,
    async listen() {
      server.listen(0, "127.0.0.1");
      await once(server, "listening");
      return `http://127.0.0.1:${server.address().port}`;
    },
    async close() {
      server.closeAllConnections?.();
      server.close();
      await once(server, "close");
    },
  };
}

async function waitForServer(url, child) {
  for (let index = 0; index < 80; index += 1) {
    if (child.exitCode !== null) {
      throw new Error(`Node preset server exited with ${child.exitCode}`);
    }
    try {
      const response = await fetch(url);
      if (response.status < 500) {
        return;
      }
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  throw new Error("Node preset server did not start");
}

test("Node preset build executes against mock CodeBolt Cloud capabilities", async () => {
  const cloud = createMockCloud();
  const cloudUrl = await cloud.listen();
  const port = 46000 + randomBytes(2).readUInt16BE(0) % 1000;
  const serverUrl = `http://127.0.0.1:${port}`;
  const child = spawn(
    process.execPath,
    ["examples/leads/.output-node/server/index.mjs"],
    {
      cwd: new URL("..", import.meta.url),
      env: {
        ...process.env,
        PORT: String(port),
        HOST: "127.0.0.1",
        CODEBOLT_CLOUD_URL: cloudUrl,
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  try {
    await waitForServer(`${serverUrl}/api/cookie`, child);
    const token = makeDevToken();
    const created = await fetch(`${serverUrl}/__codebolt/tools/add-lead`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-codebolt-execution-token": token,
      },
      body: JSON.stringify({
        id: "remote-lead-1",
        name: "Remote Lead",
        company: "Cloud Inc",
        email: "remote@example.test",
      }),
    });
    assert.equal(created.status, 200);

    const list = await fetch(`${serverUrl}/api/leads`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }).then((response) => response.json());
    assert.equal(list.documents.length, 1);
    assert.equal(list.documents[0].id, "remote-lead-1");
    assert.ok(cloud.calls.every((call) =>
      call.authorization?.startsWith("Bearer "),
    ));
  } finally {
    child.kill();
    await once(child, "exit").catch(() => {});
    await cloud.close();
  }
});
