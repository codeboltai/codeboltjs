import assert from "node:assert/strict";
import { setDefaultResultOrder } from "node:dns";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createMiniAppHost } from "../packages/host/src/index.mjs";

const rootDir = fileURLToPath(new URL("..", import.meta.url));
const examplesDir = resolve(rootDir, "examples");
setDefaultResultOrder("ipv4first");
const dataDir = await mkdtemp(resolve(tmpdir(), "codebolt-miniapp-"));
const warnings = [];
const host = await createMiniAppHost({
  miniappDir: examplesDir,
  dataDir,
  port: 0,
  idleMs: 80,
  logger: {
    warn: (message) => warnings.push(message),
    error: console.error,
  },
});
const urls = await host.listen();
const origin = `http://127.0.0.1:${urls.port}`;

function appFetch(appId, path, options = {}) {
  return fetch(`http://${appId}.localhost:${urls.port}${path}`, options);
}

async function status() {
  return fetch(`${origin}/__codebolt/status`).then((response) => response.json());
}

async function callTool(name, input) {
  return fetch(`${origin}/__codebolt/tools/${encodeURIComponent(name)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

test.after(async () => {
  await host.close();
  await rm(dataDir, { recursive: true, force: true });
});

test("one port serves static UIs without workers", async () => {
  assert.equal(
    new URL(urls.appUrls.leads).port,
    new URL(urls.appUrls.onboarding).port,
  );
  assert.deepEqual(host.apps.get("leads").manifest.ui, {
    title: "Lead Depository",
    route: "/",
  });
  assert.equal("views" in host.apps.get("leads").manifest, false);
  const response = await appFetch("leads", "/");
  assert.equal(response.status, 200);
  assert.match(await response.text(), /Lead Depository/);
  const reactResponse = await appFetch("lead-react", "/");
  assert.equal(reactResponse.status, 200);
  assert.match(await reactResponse.text(), /React Leads/);
  assert.deepEqual((await status()).apps.map((app) => app.active), [
    false,
    false,
    false,
  ]);
});

test("explicit app roots mount selected MiniApps", async () => {
  const selected = await createMiniAppHost({
    appRoots: [resolve(examplesDir, "lead-react")],
    port: 0,
  });
  try {
    assert.deepEqual([...selected.apps.keys()], ["lead-react"]);
    const selectedUrls = await selected.listen();
    assert.deepEqual(Object.keys(selectedUrls.appUrls), ["lead-react"]);
  } finally {
    await selected.close();
  }
});

test("empty MiniApp directories fail clearly", async () => {
  const emptyDir = await mkdtemp(resolve(tmpdir(), "codebolt-empty-miniapps-"));
  try {
    await assert.rejects(
      () => createMiniAppHost({ miniappDir: emptyDir }),
      /No built MiniApp manifests found/,
    );
  } finally {
    await rm(emptyDir, { recursive: true, force: true });
  }
});

test("cached discovery lists tools without starting workers", async () => {
  const response = await fetch(`${origin}/__codebolt/tools`);
  const payload = await response.json();
  assert.deepEqual(
    payload.tools.map((tool) => tool.qualifiedName).sort(),
    [
      "lead-react.add-lead",
      "leads.add-lead",
      "leads.create-task-for-lead",
      "onboarding.add-employee",
      "onboarding.complete-step",
    ],
  );
  assert.deepEqual((await status()).apps.map((app) => app.active), [
    false,
    false,
    false,
  ]);
});

test("tool validation and lazy routing target one worker", async () => {
  const invalid = await callTool("leads.add-lead", { name: "Missing fields" });
  assert.equal(invalid.status, 400);

  const valid = await callTool("leads.add-lead", {
    id: "lead-1",
    name: "Ari Patel",
    company: "Northstar",
    email: "ari@example.test",
  });
  assert.equal(valid.status, 200);
  const apps = (await status()).apps;
  assert.equal(apps.find((app) => app.id === "leads").active, true);
  assert.equal(apps.find((app) => app.id === "lead-react").active, false);
  assert.equal(apps.find((app) => app.id === "onboarding").active, false);
});

test("storage and tools remain isolated between MiniApps", async () => {
  const leads = await appFetch("leads", "/api/leads").then((response) =>
    response.json(),
  );
  assert.equal(leads.documents.length, 1);

  const employeesBefore = await appFetch(
    "onboarding",
    "/api/employees",
  ).then((response) => response.json());
  assert.deepEqual(employeesBefore.documents, []);

  const employee = await callTool("onboarding.add-employee", {
    id: "employee-1",
    name: "Morgan Lee",
    role: "Engineer",
  });
  assert.equal(employee.status, 200);

  const employeesAfter = await appFetch(
    "onboarding",
    "/api/employees",
  ).then((response) => response.json());
  assert.equal(employeesAfter.documents.length, 1);
  assert.equal((await appFetch("leads", "/api/leads").then((r) => r.json())).documents.length, 1);
});

test("app-local tool routes accept unqualified tool names", async () => {
  const created = await appFetch("lead-react", "/__codebolt/tools/add-lead", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      id: "react-lead-1",
      name: "Riley Chen",
      company: "Atlas",
      email: "riley@example.test",
    }),
  });
  assert.equal(created.status, 200);

  const leads = await appFetch("lead-react", "/api/leads").then((response) =>
    response.json(),
  );
  assert.equal(leads.documents.length, 1);
  assert.equal(leads.documents[0].name, "Riley Chen");
});

test("task capability supports filtered count without N+1 calls", async () => {
  const created = await callTool("leads.create-task-for-lead", {
    leadId: "lead-1",
    title: "Qualify Northstar",
  });
  assert.equal(created.status, 200);
  const count = await appFetch("leads", "/api/tasks?leadId=lead-1").then(
    (response) => response.json(),
  );
  assert.equal(count.count, 1);
});

test("blob data survives worker eviction and restart", async () => {
  const stored = await appFetch("leads", "/api/attachment", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      key: "lead-1-note",
      content: "Signed NDA on file",
      contentType: "text/plain",
    }),
  });
  assert.equal(stored.status, 200);

  await new Promise((resolvePromise) => setTimeout(resolvePromise, 120));
  assert.equal(
    (await status()).apps.find((app) => app.id === "leads").active,
    false,
  );

  const fetched = await appFetch(
    "leads",
    "/api/attachment?key=lead-1-note",
  ).then((response) => response.json());
  assert.deepEqual(fetched, {
    key: "lead-1-note",
    found: true,
    contentType: "text/plain",
    content: "Signed NDA on file",
  });
});

test("cookie domains are stripped and multiple cookies survive", async () => {
  const response = await appFetch("leads", "/api/cookie");
  const cookies =
    response.headers.getSetCookie?.() ??
    response.headers.get("set-cookie").split(/,(?=\s*[^;,\s]+=)/g);
  assert.equal(cookies.length, 2);
  assert.ok(cookies.every((cookie) => !/domain=/i.test(cookie)));
  assert.equal(warnings.length, 2);
});

test("in-flight work prevents eviction and idle workers stop", async () => {
  const slow = appFetch("leads", "/api/slow?ms=180");
  await new Promise((resolvePromise) => setTimeout(resolvePromise, 110));
  const during = (await status()).apps.find((app) => app.id === "leads");
  assert.equal(during.active, true);
  assert.equal(during.inFlight, 1);
  assert.equal((await slow).status, 200);
  await new Promise((resolvePromise) => setTimeout(resolvePromise, 120));
  assert.equal(
    (await status()).apps.find((app) => app.id === "leads").active,
    false,
  );
});

test("worker crashes fail fast, open the breaker, and reload clears it", async () => {
  for (let index = 0; index < 3; index += 1) {
    const response = await appFetch("leads", "/api/crash");
    assert.equal(response.status, 503);
    assert.equal((await response.json()).error, "MINIAPP_WORKER_EXITED");
  }
  assert.equal(
    (await status()).apps.find((app) => app.id === "leads").unhealthy,
    true,
  );
  assert.equal((await appFetch("leads", "/api/leads")).status, 503);

  const reloaded = await fetch(`${origin}/__codebolt/reload/leads`, {
    method: "POST",
  });
  assert.equal(reloaded.status, 200);
  const leads = await appFetch("leads", "/api/leads").then((response) =>
    response.json(),
  );
  assert.equal(leads.documents.length, 1);
});
