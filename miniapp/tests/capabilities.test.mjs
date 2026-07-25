import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import { createCapabilityService } from "../packages/host/src/capabilities.mjs";

const dataDir = await mkdtemp(resolve(tmpdir(), "codebolt-miniapp-cap-"));
const service = createCapabilityService({ dataDir });

test.after(async () => {
  await rm(dataDir, { recursive: true, force: true });
});

const leadsClaims = {
  workspaceId: "workspace-a",
  installId: "install-a",
  miniAppId: "leads",
};
const onboardingClaims = {
  workspaceId: "workspace-a",
  installId: "install-b",
  miniAppId: "onboarding",
};

test("batched document operations return documents and enforce host namespaces", async () => {
  await service.call(leadsClaims, "db.setMany", {
    collection: "leads",
    documents: [
      { id: "lead-1", document: { name: "Ari" } },
      { id: "lead-2", document: { name: "Morgan" } },
    ],
  });

  assert.deepEqual(await service.call(leadsClaims, "db.getMany", {
    collection: "leads",
    ids: ["lead-1", "lead-2"],
  }), [
    { id: "lead-1", name: "Ari" },
    { id: "lead-2", name: "Morgan" },
  ]);

  const page = await service.call(leadsClaims, "db.list", {
    collection: "leads",
    options: { limit: 10 },
  });
  assert.deepEqual(page.documents.map((document) => document.id), [
    "lead-1",
    "lead-2",
  ]);

  const isolated = await service.call(onboardingClaims, "db.list", {
    collection: "leads",
    options: {},
  });
  assert.deepEqual(isolated.documents, []);

  assert.equal(await service.call(leadsClaims, "db.deleteMany", {
    collection: "leads",
    ids: ["lead-1", "lead-2"],
  }), 2);
});

test("blob operations are namespaced by workspace, install, and MiniApp", async () => {
  await service.call(leadsClaims, "blob.put", {
    key: "lead-1-note",
    data: new TextEncoder().encode("private note"),
    options: { contentType: "text/plain" },
  });

  const blob = await service.call(leadsClaims, "blob.get", {
    key: "lead-1-note",
  });
  assert.equal(new TextDecoder().decode(blob.data), "private note");
  assert.equal(blob.contentType, "text/plain");

  assert.deepEqual(await service.call(onboardingClaims, "blob.list", {
    options: {},
  }), { keys: [] });
});
