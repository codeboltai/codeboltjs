/**
 * E2B Template Builder (v2 SDK approach)
 *
 * Builds an E2B sandbox template with codebolt pre-installed.
 * Copies the full remote-execution-plugin (package.json, dist/, etc.)
 * from the local monorepo into the template.
 *
 * Prerequisites:
 *   - npm install
 *   - Set E2B_API_KEY in .env or environment
 *   - Build the remote-execution-plugin first (npm run build in the plugin dir)
 *
 * Usage:
 *   npx tsx build-template.ts
 */

import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';
import { TemplateBase, Template, defaultBuildLogger } from 'e2b';
import { config } from 'dotenv';

config();

async function main() {
  console.log('Building E2B template with codebolt + remote-execution-plugin...\n');

  const PLUGIN_DIR = '/home/user/.codebolt/plugins/remote-execution-plugin';

  // Locate the full plugin directory on the host
  const candidatePluginDirs = [
    // Relative to this script: e2b-template/ → providers/e2b/ → codeboltjs/ → AiEditor/ → CodeBolt/
    path.resolve(__dirname, '..', '..', '..', 'CodeBolt', 'packages', 'plugins', 'remote-execution-plugin'),
    // Well-known dev path
    path.resolve(process.env.HOME || '/tmp', 'Documents', 'codeboltai', 'AiEditor', 'CodeBolt', 'packages', 'plugins', 'remote-execution-plugin'),
  ];

  let localPluginDir: string | null = null;
  for (const dir of candidatePluginDirs) {
    if (fs.existsSync(path.join(dir, 'package.json')) && fs.existsSync(path.join(dir, 'dist', 'index.js'))) {
      localPluginDir = dir;
      break;
    }
  }

  if (!localPluginDir) {
    console.error('Could not find the remote-execution-plugin directory. Searched:');
    candidatePluginDirs.forEach(d => console.error(`  - ${d}`));
    console.error('\nMake sure the plugin is built (npm run build) and the path is correct.');
    process.exit(1);
  }

  console.log(`Found plugin at: ${localPluginDir}`);

  // Create a tar.gz template of the full plugin (excluding dev files)
  const pluginArchivePath = path.join(__dirname, '.plugin-template.tar.gz');
  execSync(
    `tar -czf "${pluginArchivePath}" --exclude=node_modules --exclude=src --exclude=.DS_Store --exclude=tsconfig.json --exclude=build.mjs -C "${localPluginDir}" .`,
  );
  console.log(`Created plugin template archive: ${pluginArchivePath}`);

  // Read archive as base64 for embedding into template build
  const archiveBase64 = fs.readFileSync(pluginArchivePath).toString('base64');
  // Cleanup temp archive
  fs.unlinkSync(pluginArchivePath);

  const template = new TemplateBase()
    .fromNodeImage('20')
    .aptInstall(['curl', 'git', 'unzip', 'jq'])
    // Install codebolt globally
    .runCmd('npm install -g --ignore-scripts codebolt', { user: 'root' })
    // Create plugin directory and extract the full plugin from embedded archive
    .runCmd(`mkdir -p ${PLUGIN_DIR}`, { user: 'root' })
    .runCmd(`echo '${archiveBase64}' | base64 -d | tar -xzf - -C ${PLUGIN_DIR}`, { user: 'root' })
    // Fix ownership so the user can access the plugin
    .runCmd('chown -R user:user /home/user/.codebolt', { user: 'root' });

  // Build the template
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
}

main().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
