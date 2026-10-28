import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { relative, resolve } from "node:path";

async function allFiles(directory) {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    return (await Promise.all(entries.map((entry) => {
      const path = resolve(directory, entry.name);
      return entry.isDirectory() ? allFiles(path) : Promise.resolve(entry.isFile() ? [path] : []);
    }))).flat();
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}

export function standaloneMiniApp(options) {
  if (!options?.id || !options?.title) throw new TypeError("standaloneMiniApp requires id and title.");
  return {
    name: `standalone-miniapp:${options.id}`,
    setup(nitro) {
      nitro.hooks.hook("compiled", async () => {
        const outputDir = resolve(nitro.options.output.dir);
        const manifestDir = resolve(outputDir, "codebolt");
        const publicFiles = await allFiles(resolve(nitro.options.output.publicDir));
        await mkdir(manifestDir, { recursive: true });
        const staticAssets = await Promise.all(publicFiles.map(async (path) => ({
          path: relative(nitro.options.output.publicDir, path).replaceAll("\\", "/"),
          size: (await stat(path)).size,
        })));
        const manifest = {
          schemaVersion: 1,
          id: options.id,
          title: options.title,
          version: options.version ?? "0.0.0",
          ui: { title: options.title, route: options.route ?? "/" },
          capabilities: options.capabilities ?? [],
          runtime: {
            handler: relative(outputDir, resolve(nitro.options.output.serverDir, "index.mjs")).replaceAll("\\", "/"),
            publicDir: relative(outputDir, nitro.options.output.publicDir).replaceAll("\\", "/"),
          },
          staticAssets: staticAssets.sort((a, b) => a.path.localeCompare(b.path)),
        };
        await writeFile(resolve(manifestDir, "miniapp.manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
      });
    },
  };
}
