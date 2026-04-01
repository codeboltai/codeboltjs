/**
 * E2B Template Builder (v2 SDK approach)
 *
 * Builds an E2B sandbox template with codebolt pre-installed.
 * Downloads the remote-execution-plugin from the Codebolt API
 * and installs it into the template.
 *
 * Prerequisites:
 *   - npm install
 *   - Set E2B_API_KEY in .env or environment
 *
 * Usage:
 *   npx tsx build-template.ts
 */

import { TemplateBase, Template, defaultBuildLogger } from 'e2b';
import { config } from 'dotenv';

config();

async function main() {
  console.log('Building E2B template with codebolt + remote-execution-plugin...\n');

  const PLUGIN_DIR = '/home/user/.codebolt/plugins/remote-execution-plugin';
  const PLUGIN_ID = '@codebolt/remote-execution-plugin';
  const API_URL = `https://api.codebolt.ai/api/plugins/detailbyuid?unique_id=${encodeURIComponent(PLUGIN_ID)}`;

  const template = new TemplateBase()
    .fromNodeImage('20')
    .aptInstall(['curl', 'git', 'unzip', 'jq'])
    // Install codebolt globally
    .runCmd('npm install -g --ignore-scripts codebolt', { user: 'root' })
    // Download and install remote-execution-plugin from API
    .runCmd(`mkdir -p ${PLUGIN_DIR}/dist`, { user: 'root' })
    .runCmd(
      `PLUGIN_ZIP_URL=$(curl -sf "${API_URL}" | jq -r '.zipFilePath') && ` +
      `curl -sfL -o /tmp/plugin-dist.zip "$PLUGIN_ZIP_URL" && ` +
      `unzip -o /tmp/plugin-dist.zip -d ${PLUGIN_DIR}/ && ` +
      `rm -f /tmp/plugin-dist.zip`,
      { user: 'root' },
    )
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
