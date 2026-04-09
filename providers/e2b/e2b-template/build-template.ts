/**
 * E2B Template Builder (v2 SDK approach)
 *
 * Builds an E2B sandbox template with codebolt pre-installed and the
 * remote-execution-plugin packed from the local monorepo (not the API).
 *
 * Prerequisites:
 *   - npm install
 *   - Set E2B_API_KEY in .env or environment
 *   - The plugin must be built (dist/index.js present)
 *
 * Usage:
 *   npx tsx build-template.ts
 */

import { TemplateBase, Template, defaultBuildLogger } from 'e2b';
import { config } from 'dotenv';
import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

config();

async function main() {
  console.log('Building E2B template with codebolt + local remote-execution-plugin...\n');

  const PLUGIN_DIR = '/home/user/.codebolt/plugins/remote-execution-plugin';
  const BUILTIN_PLUGIN_DIR = '/usr/local/lib/node_modules/codebolt/dist/plugins/remote-execution-plugin';

  // Local plugin source (monorepo path).
  const localPluginDir = path.resolve(
    __dirname,
    '../../../../CodeBolt/packages/plugins/remote-execution-plugin',
  );
  if (!fs.existsSync(path.join(localPluginDir, 'package.json'))) {
    throw new Error(`Local plugin not found at: ${localPluginDir}`);
  }
  if (!fs.existsSync(path.join(localPluginDir, 'dist', 'index.js'))) {
    throw new Error(
      `Plugin dist/index.js missing at: ${localPluginDir}. Build the plugin first.`,
    );
  }

  const pluginPkg = JSON.parse(
    fs.readFileSync(path.join(localPluginDir, 'package.json'), 'utf-8'),
  );
  const PLUGIN_VERSION = pluginPkg.version || 'unknown';
  console.log(`Packing local plugin ${pluginPkg.name}@${PLUGIN_VERSION} from ${localPluginDir}`);

  // Pack the plugin into a tarball inside this builder dir so e2b can upload it.
  const packOut = execSync('npm pack --json --silent', {
    cwd: localPluginDir,
    encoding: 'utf-8',
  });
  const packMeta = JSON.parse(packOut);
  const packEntry = Array.isArray(packMeta) ? packMeta[0] : packMeta;
  const packedFilename: string = packEntry.filename;
  const packedAbs = path.resolve(localPluginDir, packedFilename);
  // Move the tarball next to this script so the e2b uploader picks it up.
  const stagedTar = path.resolve(__dirname, 'plugin.tgz');
  fs.renameSync(packedAbs, stagedTar);
  console.log(`Packed plugin -> ${stagedTar}`);

  const template = new TemplateBase()
    .fromNodeImage('20')
    .aptInstall(['curl', 'git', 'unzip', 'jq'])
    // Install codebolt globally
    .runCmd('npm install -g codebolt@1.12.16', { user: 'root' })
    // Upload the packed plugin tarball into the sandbox
    .copy('plugin.tgz', '/tmp/plugin.tgz', { user: 'root' })
    // Extract into both the builtin plugin dir and the user plugin dir.
    // npm pack produces a tarball whose top-level entry is `package/`, so we
    // strip that with --strip-components=1.
    .runCmd(
      `# plugin version: ${PLUGIN_VERSION}\n` +
      `mkdir -p ${PLUGIN_DIR} ${BUILTIN_PLUGIN_DIR} && ` +
      `tar -xzf /tmp/plugin.tgz -C ${PLUGIN_DIR} --strip-components=1 && ` +
      `tar -xzf /tmp/plugin.tgz -C ${BUILTIN_PLUGIN_DIR} --strip-components=1 && ` +
      `rm -f /tmp/plugin.tgz`,
      { user: 'root' },
    )
    // Fix ownership so the user can access the plugin
    .runCmd('chown -R user:user /home/user/.codebolt', { user: 'root' });

  try {
    const buildInfo = await Template.build(template, 'codebolt-remote-execution', {
      cpuCount: 2,
      memoryMB: 2048,
      onBuildLogs: defaultBuildLogger(),
    });

    console.log('\nTemplate built successfully!');
    console.log(`   Template ID: ${buildInfo.templateId}`);
    console.log(`   Build ID:    ${buildInfo.buildId}`);
    console.log(`   Name:        ${buildInfo.name}`);
    console.log('\nSet this in your config:');
    console.log(`   export E2B_SANDBOX_TEMPLATE=${buildInfo.templateId}`);
  } finally {
    try { fs.unlinkSync(stagedTar); } catch { /* ignore */ }
  }
}

main().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
