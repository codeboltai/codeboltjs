import assert from "node:assert/strict";
import test from "node:test";
import { createSampleCloudServer } from "../packages/sample-cloud/src/index.mjs";

test("sample cloud mints tokens and handles document capabilities", async () => {
  const cloud = createSampleCloudServer();
  const url = await cloud.listen({ port: 0 });

  try {
    const tokenResponse = await fetch(`${url}/token`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        miniAppId: "lead-react",
        workspaceId: "workspace-a",
        installId: "install-a",
      }),
    });
    assert.equal(tokenResponse.status, 200);
    const { token } = await tokenResponse.json();

    const setResponse = await fetch(`${url}/capabilities/db.set`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        collection: "leads",
        id: "lead-1",
        document: { name: "Lead One", company: "Acme" },
      }),
    });
    assert.equal(setResponse.status, 200);

    const listResponse = await fetch(`${url}/capabilities/db.list`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ collection: "leads", options: {} }),
    });
    assert.equal(listResponse.status, 200);
    const list = await listResponse.json();
    assert.deepEqual(list.documents, [
      { id: "lead-1", name: "Lead One", company: "Acme" },
    ]);
  } finally {
    await cloud.close();
  }
});
