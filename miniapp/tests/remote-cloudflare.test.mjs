import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { createServer } from "node:http";
import { once } from "node:events";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";

function base64url(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function makeDevToken() {
  return [
    base64url({ alg: "none", typ: "JWT" }),
    base64url({
      userId: "dev-user",
      roles: ["developer"],
      workspaceId: "cloudflare-workspace",
      installId: "cloudflare-install",
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

async function waitForWrangler(url, child) {
  for (let index = 0; index < 120; index += 1) {
    if (child.exitCode !== null) {
      throw new Error(`Wrangler exited with ${child.exitCode}`);
    }
    try {
      const response = await fetch(url);
      if (response.status < 500) {
        return;
      }
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  throw new Error("Wrangler dev server did not start");
}

async function stopChild(child) {
  if (!child) return;
  if (process.platform === "win32") {
    spawnSync("taskkill.exe", ["/pid", String(child.pid), "/t", "/f"], {
      stdio: "ignore",
    });
  } else {
    child.kill();
  }
  await Promise.race([
    once(child, "exit").catch(() => {}),
    new Promise((resolve) => setTimeout(resolve, 2000)),
  ]);
}

test("Cloudflare output runs through Wrangler and reaches mock CodeBolt Cloud", async () => {
  const cloud = createMockCloud();
  const cloudUrl = await cloud.listen();
  const varsDir = await mkdtemp(resolve(tmpdir(), "codebolt-miniapp-cf-"));
  const varsFile = resolve(varsDir, ".dev.vars");
  await writeFile(varsFile, `CODEBOLT_CLOUD_URL=${cloudUrl}\n`);
  const port = 47000 + randomBytes(2).readUInt16BE(0) % 1000;
  const serverUrl = `http://127.0.0.1:${port}`;
  let child;
  const logs = [];

  try {
    const pnpmCli = process.env.npm_execpath;
    if (!pnpmCli) {
      throw new Error("npm_execpath is required to locate pnpm.");
    }
    child = spawn(
      process.execPath,
      [
        pnpmCli,
        "exec",
      "wrangler",
      "dev",
      "--local",
      "--ip",
      "127.0.0.1",
      "--port",
      String(port),
      "--show-interactive-dev-session",
      "false",
      "--env-file",
      varsFile,
      ],
      {
        cwd: new URL("../examples/leads/.output-cloudflare/server", import.meta.url),
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    child.stdout.on("data", (chunk) => logs.push(chunk.toString("utf8")));
    child.stderr.on("data", (chunk) => logs.push(chunk.toString("utf8")));

    await waitForWrangler(`${serverUrl}/api/cookie`, child);
    const token = makeDevToken();
    const toolUrl = `${serverUrl}/__codebolt/tools/add-lead`;
    const invalid = await fetch(toolUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-codebolt-execution-token": token,
      },
      body: JSON.stringify({}),
    });
    if (invalid.status !== 400) {
      throw new Error(
        [
          `Expected invalid tool input to return 400, got ${invalid.status}.`,
          `Body: ${await invalid.text()}`,
          `Wrangler logs: ${logs.join("").slice(-4000)}`,
        ].join("\n"),
      );
    }

    const created = await fetch(toolUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-codebolt-execution-token": token,
      },
      body: JSON.stringify({
        id: "cloudflare-lead-1",
        name: "Cloudflare Lead",
        company: "Edge Inc",
        email: "edge@example.test",
      }),
    });
    if (created.status !== 200) {
      throw new Error(
        [
          `Expected tool call to return 200, got ${created.status}.`,
          `Body: ${await created.text()}`,
          `Wrangler logs: ${logs.join("").slice(-4000)}`,
          `Cloud calls: ${JSON.stringify(cloud.calls)}`,
        ].join("\n"),
      );
    }

    const list = await fetch(`${serverUrl}/api/leads`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }).then((response) => response.json());
    assert.equal(list.documents.length, 1);
    assert.equal(list.documents[0].id, "cloudflare-lead-1");
    assert.ok(cloud.calls.every((call) =>
      call.authorization?.startsWith("Bearer "),
    ));
  } finally {
    await stopChild(child);
    await rm(varsDir, { recursive: true, force: true });
    await cloud.close();
  }
});
