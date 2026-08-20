import { promises as fs } from 'node:fs';
import path from 'node:path';

async function main(): Promise<void> {
  const [databasePath, inputPath, outputPath] = process.argv.slice(2);
  if (!databasePath || !inputPath || !outputPath) throw new Error('Missing delta extraction paths');

  const { AgentFS } = await import('agentfs-sdk');
  const files = JSON.parse(await fs.readFile(inputPath, 'utf8')) as string[];
  const agent = await AgentFS.open({ path: databasePath });
  const manifest: Array<{ path: string; file: string; mode: number; symlink: boolean }> = [];
  await fs.mkdir(outputPath, { recursive: true });
  try {
    for (const [index, filePath] of files.entries()) {
      const agentPath = `/${filePath}`;
      const stats = await agent.fs.lstat(agentPath);
      const file = String(index);
      const content = stats.isSymbolicLink()
        ? Buffer.from(await agent.fs.readlink(agentPath))
        : await agent.fs.readFile(agentPath);
      await fs.writeFile(path.join(outputPath, file), content);
      manifest.push({ path: filePath, file, mode: stats.mode, symlink: stats.isSymbolicLink() });
    }
  } finally {
    await agent.close();
  }
  await fs.writeFile(path.join(outputPath, 'manifest.json'), JSON.stringify(manifest));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
