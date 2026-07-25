import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = new URL(".", import.meta.url);
const publicDir = fileURLToPath(new URL("./.output/public/", root));
const manifestDir = new URL("./.output/codebolt/", root);
const assets = [];

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      await walk(path);
      continue;
    }
    assets.push({
      path: relative(publicDir, path).replaceAll("\\", "/"),
      size: (await stat(path)).size,
    });
  }
}

await walk(publicDir);
await mkdir(manifestDir, { recursive: true });
await writeFile(
  new URL("static-assets.json", manifestDir),
  `${JSON.stringify(assets.sort((a, b) => a.path.localeCompare(b.path)), null, 2)}\n`,
);
