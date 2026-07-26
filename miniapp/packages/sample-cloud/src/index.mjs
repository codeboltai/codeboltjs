import { createServer } from "node:http";
import {
  createCapabilityStore,
  createMemoryStore,
  createDevToken,
  handleSampleCloudRequest,
} from "./core.mjs";

export { createDevToken, handleSampleCloudRequest } from "./core.mjs";

function requestUrl(request) {
  const host = request.headers.host || "sample-cloud.local";
  const proto = request.socket.encrypted ? "https" : "http";
  return `${proto}://${host}${request.url ?? "/"}`;
}

function readNodeBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("error", reject);
    request.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

async function toFetchRequest(request) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(request.headers)) {
    if (Array.isArray(value)) {
      for (const entry of value) headers.append(name, entry);
    } else if (value !== undefined) {
      headers.set(name, String(value));
    }
  }
  const method = request.method || "GET";
  return new Request(requestUrl(request), {
    method,
    headers,
    body: ["GET", "HEAD"].includes(method) ? undefined : await readNodeBody(request),
  });
}

async function writeNodeResponse(response, fetchResponse) {
  response.writeHead(fetchResponse.status, Object.fromEntries(fetchResponse.headers.entries()));
  response.end(Buffer.from(await fetchResponse.arrayBuffer()));
}

export function createSampleCloudServer() {
  const capabilities = createCapabilityStore(createMemoryStore());

  const server = createServer(async (request, response) => {
    const fetchRequest = await toFetchRequest(request);
    await writeNodeResponse(
      response,
      await handleSampleCloudRequest(fetchRequest, { capabilities }),
    );
  });

  return {
    server,
    calls: capabilities.calls,
    listen({ port = 4590, host = "127.0.0.1" } = {}) {
      return new Promise((resolveListen) => {
        server.listen(port, host, () => {
          const address = server.address();
          resolveListen(`http://${address.address}:${address.port}`);
        });
      });
    },
    close() {
      return new Promise((resolveClose) => {
        server.closeAllConnections?.();
        server.close(() => resolveClose());
      });
    },
  };
}
