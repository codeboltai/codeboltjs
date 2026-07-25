import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { Readable } from "node:stream";
import { pathToFileURL } from "node:url";
import { createCapabilityService } from "./capabilities.mjs";
import { createIdentityAuthority } from "./identity.mjs";
import { MiniAppRuntime } from "./miniapp-runtime.mjs";

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

function json(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function appIdFromHost(host) {
  const hostname = host.split(":")[0].toLowerCase();
  return hostname.endsWith(".localhost") ? hostname.slice(0, -10) : "";
}

function splitSetCookie(value) {
  return value ? value.split(/,(?=\s*[^;,\s]+=)/g) : [];
}

export function sanitizeSetCookie(value) {
  const parts = value
    .split(";")
    .map((part) => part.trim())
    .filter((part) => !/^domain=/i.test(part));
  return parts.join("; ");
}

function toWebRequest(request, origin) {
  const method = request.method ?? "GET";
  const body =
    method === "GET" || method === "HEAD" ? undefined : Readable.toWeb(request);
  return new Request(new URL(request.url ?? "/", origin), {
    method,
    headers: request.headers,
    body,
    ...(body ? { duplex: "half" } : {}),
  });
}

async function writeWebResponse(response, nodeResponse, onCookieRewrite) {
  nodeResponse.statusCode = response.status;
  nodeResponse.statusMessage = response.statusText;
  for (const [name, value] of response.headers) {
    if (name.toLowerCase() !== "set-cookie") {
      nodeResponse.setHeader(name, value);
    }
  }

  const rawCookies =
    typeof response.headers.getSetCookie === "function"
      ? response.headers.getSetCookie()
      : splitSetCookie(response.headers.get("set-cookie"));
  if (rawCookies.length) {
    const cookies = rawCookies.map((cookie) => {
      const sanitized = sanitizeSetCookie(cookie);
      if (sanitized !== cookie) onCookieRewrite(cookie, sanitized);
      return sanitized;
    });
    nodeResponse.setHeader("set-cookie", cookies);
  }

  if (!response.body) {
    nodeResponse.end();
    return;
  }
  await new Promise((resolvePromise, reject) => {
    const stream = Readable.fromWeb(response.body);
    stream.on("error", reject);
    nodeResponse.on("finish", resolvePromise);
    stream.pipe(nodeResponse);
  });
}

async function loadApp(rootDir, id) {
  const outputDir = resolve(rootDir, "examples", id, ".output");
  const manifest = JSON.parse(
    await readFile(resolve(outputDir, "codebolt", "miniapp.manifest.json"), "utf8"),
  );
  return {
    manifest,
    outputDir,
    handlerUrl: pathToFileURL(resolve(outputDir, manifest.runtime.handler)),
    publicDir: resolve(outputDir, manifest.runtime.publicDir),
    installId: `${id}-local`,
    workspaceId: "local-workspace",
  };
}

async function staticResponse(app, pathname) {
  const requested = pathname === "/" ? "index.html" : pathname.slice(1);
  const path = resolve(app.publicDir, requested);
  const root = `${resolve(app.publicDir)}${sep}`;
  if (path !== resolve(app.publicDir) && !path.startsWith(root)) {
    return new Response("Not found", { status: 404 });
  }
  try {
    const info = await stat(path);
    if (!info.isFile()) return new Response("Not found", { status: 404 });
    return new Response(Readable.toWeb(createReadStream(path)), {
      headers: {
        "content-type": contentTypes[extname(path)] ?? "application/octet-stream",
        "content-length": String(info.size),
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

export async function createMiniAppHost({
  rootDir,
  dataDir = resolve(rootDir, ".data"),
  port = 4310,
  idleMs = 300_000,
  logger = console,
} = {}) {
  const apps = new Map();
  for (const id of ["leads", "onboarding"]) {
    const app = await loadApp(rootDir, id);
    apps.set(id, app);
  }

  const authority = createIdentityAuthority();
  const capabilityService = createCapabilityService({ dataDir });
  const runtimes = new Map(
    [...apps].map(([id, app]) => [
      id,
      new MiniAppRuntime({ app, authority, capabilityService, idleMs }),
    ]),
  );
  const tools = [...apps.values()].flatMap((app) => app.manifest.tools);

  const server = createServer(async (request, nodeResponse) => {
    try {
      const host = request.headers.host ?? "localhost";
      const url = new URL(request.url ?? "/", `http://${host}`);

      if (request.method === "GET" && url.pathname === "/__codebolt/tools") {
        await writeWebResponse(json({ tools }), nodeResponse, () => {});
        return;
      }
      if (request.method === "GET" && url.pathname === "/__codebolt/status") {
        await writeWebResponse(
          json({ apps: [...runtimes.values()].map((runtime) => runtime.status) }),
          nodeResponse,
          () => {},
        );
        return;
      }

      const toolMatch = url.pathname.match(/^\/__codebolt\/tools\/(.+)$/);
      if (request.method === "POST" && toolMatch) {
        const qualifiedName = decodeURIComponent(toolMatch[1]);
        const tool = tools.find((candidate) => candidate.qualifiedName === qualifiedName);
        if (!tool) {
          await writeWebResponse(json({ error: "TOOL_NOT_FOUND" }, 404), nodeResponse, () => {});
          return;
        }
        const appId = qualifiedName.slice(0, qualifiedName.indexOf("."));
        const runtime = runtimes.get(appId);
        const input = await toWebRequest(request, url.origin).text();
        const response = await runtime.fetch(
          new Request(
            `http://${appId}.localhost/__codebolt/tools/${encodeURIComponent(tool.name)}`,
            {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: input,
            },
          ),
        );
        await writeWebResponse(response, nodeResponse, () => {});
        return;
      }

      const reloadMatch = url.pathname.match(/^\/__codebolt\/reload\/([^/]+)$/);
      if (request.method === "POST" && reloadMatch) {
        const runtime = runtimes.get(reloadMatch[1]);
        if (!runtime) {
          await writeWebResponse(json({ error: "MINIAPP_NOT_FOUND" }, 404), nodeResponse, () => {});
          return;
        }
        await runtime.reload();
        await writeWebResponse(json({ reloaded: reloadMatch[1] }), nodeResponse, () => {});
        return;
      }

      const appId = appIdFromHost(host);
      const app = apps.get(appId);
      const runtime = runtimes.get(appId);
      if (!app || !runtime) {
        await writeWebResponse(json({ error: "MINIAPP_NOT_FOUND" }, 404), nodeResponse, () => {});
        return;
      }

      const backend =
        url.pathname.startsWith("/api/") ||
        url.pathname.startsWith("/__codebolt/");
      const response = backend
        ? await runtime.fetch(toWebRequest(request, url.origin))
        : await staticResponse(app, url.pathname);
      await writeWebResponse(response, nodeResponse, (before, after) => {
        logger.warn(
          `[miniapp:${appId}] Removed cookie Domain attribute: ${before} -> ${after}`,
        );
      });
    } catch (error) {
      logger.error(error);
      if (!nodeResponse.headersSent) {
        nodeResponse.statusCode = 500;
        nodeResponse.setHeader("content-type", "application/json");
      }
      nodeResponse.end(
        JSON.stringify({
          error: "MINIAPP_HOST_ERROR",
          message: error instanceof Error ? error.message : String(error),
        }),
      );
    }
  });

  return {
    apps,
    runtimes,
    tools,
    async listen() {
      await new Promise((resolvePromise, reject) => {
        server.once("error", reject);
        server.listen(port, "127.0.0.1", resolvePromise);
      });
      const address = server.address();
      return {
        port: address.port,
        leads: `http://leads.localhost:${address.port}`,
        onboarding: `http://onboarding.localhost:${address.port}`,
      };
    },
    async close() {
      await Promise.all([...runtimes.values()].map((runtime) => runtime.stop()));
      if (server.listening) {
        await new Promise((resolvePromise, reject) =>
          server.close((error) => (error ? reject(error) : resolvePromise())),
        );
      }
    },
  };
}
