import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import Ajv from "ajv";
import standaloneCode from "ajv/dist/standalone/index.js";
import { createJiti } from "jiti";
import type { Nitro, NitroConfig, NitroModule } from "nitro/types";
import type {
  CollectionDefinition,
  ToolDefinition,
} from "./index";

export interface MiniAppModuleOptions {
  id: string;
  title: string;
  version?: string;
  route?: string;
}

type Definition = ToolDefinition | CollectionDefinition;

function localTarget(): NitroConfig {
  return {
    preset: "standard",
    serveStatic: false,
    output: {
      dir: "{{ rootDir }}/.output",
      serverDir: "{{ output.dir }}/server",
      publicDir: "{{ output.dir }}/public",
    },
  };
}

export function resolveTarget(
  target = process.env.MINIAPP_TARGET,
): NitroConfig {
  if (target === "vercel") {
    return { preset: "vercel" };
  }

  if (target === "netlify") {
    return { preset: "netlify" };
  }

  if (target === "deno") {
    return { preset: "deno-deploy" };
  }

  if (target === "node") {
    return {
      preset: "node-server",
      output: { dir: "{{ rootDir }}/.output-node" },
    };
  }

  if (target === "cloudflare") {
    return {
      preset: "cloudflare-module",
      output: { dir: "{{ rootDir }}/.output-cloudflare" },
    };
  }

  return localTarget();
}

async function definitionFiles(directory: string): Promise<string[]> {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = await Promise.all(
      entries.map(async (entry) => {
        const path = resolve(directory, entry.name);
        return entry.isDirectory()
          ? definitionFiles(path)
          : /\.[cm]?[jt]s$/.test(entry.name)
            ? [path]
            : [];
      }),
    );
    return files.flat().sort();
  } catch {
    return [];
  }
}

async function allFiles(directory: string): Promise<string[]> {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    return (
      await Promise.all(
        entries.map((entry) => {
          const path = resolve(directory, entry.name);
          return entry.isDirectory() ? allFiles(path) : Promise.resolve([path]);
        }),
      )
    ).flat();
  } catch {
    return [];
  }
}

async function readDefinition(path: string): Promise<Definition> {
  const jiti = createJiti(import.meta.url, { interopDefault: true });
  const definition = await jiti.import(path, { default: true }) as Definition;
  if (!definition || !["tool", "collection"].includes(definition.kind)) {
    throw new TypeError(`${path} does not default-export a MiniApp definition.`);
  }
  return definition;
}

function inlineAjvRuntimeHelpers(code: string) {
  return code.replace(
    /const (func\d+) = require\("ajv\/dist\/runtime\/ucs2length"\)\.default;/g,
    `const $1 = (value) => {
  let length = 0;
  for (let index = 0; index < value.length; index += 1) {
    length += 1;
    const code = value.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff && index + 1 < value.length) {
      const next = value.charCodeAt(index + 1);
      if (next >= 0xdc00 && next <= 0xdfff) index += 1;
    }
  }
  return length;
};`,
  );
}

export function codeboltMiniApp(options: MiniAppModuleOptions): NitroModule {
  return {
    name: `codebolt-miniapp:${options.id}`,
    async setup(nitro: Nitro) {
      const serverDir = String(nitro.options.serverDir);
      const toolFiles = await definitionFiles(resolve(serverDir, "tools"));
      const collectionFiles = await definitionFiles(resolve(serverDir, "collections"));

      const tools = await Promise.all(toolFiles.map(readDefinition)) as ToolDefinition[];
      const collections = await Promise.all(
        collectionFiles.map(readDefinition),
      ) as CollectionDefinition[];

      const names = new Set<string>();
      for (const tool of tools) {
        if (names.has(tool.name)) {
          throw new Error(`Duplicate MiniApp tool name: ${tool.name}`);
        }
        names.add(tool.name);
      }

      const imports = toolFiles
        .map(
          (path, index) =>
            `import tool${index} from ${JSON.stringify(pathToFileURL(path).href)};`,
        )
        .join("\n");
      nitro.options.virtual ??= {};
      nitro.options.virtual["#codebolt/miniapp-tools"] = [
        imports,
        `export const tools = new Map([${tools
          .map((tool, index) => `[${JSON.stringify(tool.name)}, tool${index}]`)
          .join(",")}]);`,
      ].join("\n");
      if (tools.length) {
        const ajv = new Ajv({
          allErrors: true,
          code: { source: true, esm: true },
        });
        tools.forEach((tool, index) => {
          ajv.addSchema(tool.inputSchema, `tool${index}`);
        });
        nitro.options.virtual["#codebolt/miniapp-tool-validators"] = [
          inlineAjvRuntimeHelpers(standaloneCode(ajv)),
          `export const validators = new Map([${tools
            .map(
              (tool, index) =>
                `[${JSON.stringify(tool.name)}, tool${index}]`,
            )
            .join(",")}]);`,
        ].join("\n");
      } else {
        nitro.options.virtual["#codebolt/miniapp-tool-validators"] =
          "export const validators = new Map();";
      }

      const toolHandler = fileURLToPath(
        new URL("./runtime/tool-handler.ts", import.meta.url),
      ).replaceAll("\\", "/");
      nitro.options.handlers.push({
        route: "/__codebolt/tools/:name",
        method: "post",
        handler: toolHandler,
      });

      nitro.hooks.hook("compiled", async () => {
        const manifestDir = resolve(nitro.options.output.dir, "codebolt");
        await mkdir(manifestDir, { recursive: true });
        const publicFiles = await allFiles(nitro.options.output.publicDir);
        const staticAssets = await Promise.all(
          publicFiles.map(async (path) => ({
            path: relative(nitro.options.output.publicDir, path).replaceAll("\\", "/"),
            size: (await stat(path)).size,
          })),
        );
        const manifest = {
          schemaVersion: 1,
          id: options.id,
          title: options.title,
          version: options.version ?? "0.0.0",
          ui: {
            title: options.title,
            route: options.route ?? "/",
          },
          runtime: {
            handler: relative(
              nitro.options.output.dir,
              resolve(nitro.options.output.serverDir, "index.mjs"),
            ).replaceAll("\\", "/"),
            publicDir: relative(
              nitro.options.output.dir,
              nitro.options.output.publicDir,
            ).replaceAll("\\", "/"),
          },
          tools: tools.map((tool) => ({
            name: tool.name,
            qualifiedName: `${options.id}.${tool.name}`,
            description: tool.description,
            inputSchema: tool.inputSchema,
            outputSchema: tool.outputSchema,
          })),
          collections: collections.map(({ name, schema }) => ({ name, schema })),
          staticAssets: staticAssets.sort((a, b) => a.path.localeCompare(b.path)),
        };
        await writeFile(
          resolve(manifestDir, "miniapp.manifest.json"),
          `${JSON.stringify(manifest, null, 2)}\n`,
        );
      });
    },
  };
}

