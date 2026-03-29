/**
 * E2B Template Builder (v2 SDK approach)
 *
 * Builds an E2B sandbox template with codebolt pre-installed.
 * The remote-execution-plugin is bundled inside the codebolt npm package.
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

  // Define the template using the v2 SDK
  const PLUGIN_UNIQUE_ID = process.env.PLUGIN_UNIQUE_ID || '@codebolt/remote-execution-plugin';
  const PLUGIN_DIR = '/home/user/.codebolt/plugins/remote-execution-plugin';

  const template = new TemplateBase()
    .fromNodeImage('20')
    .aptInstall(['curl', 'git', 'unzip', 'jq'])
    // Install codebolt globally
    .runCmd('npm install -g --ignore-scripts codebolt', { user: 'root' })
    // Create plugin directory
    .runCmd(`mkdir -p ${PLUGIN_DIR}/dist`, { user: 'root' })
    // Download plugin dist zip from the API and extract it
    .runCmd([
      `PLUGIN_ZIP_URL=$(curl -sf "https://api.codebolt.ai/api/plugins/detailbyuid?unique_id=${encodeURIComponent(PLUGIN_UNIQUE_ID)}" | jq -r '.zipFilePath')`,
      `echo "Downloading plugin from: $PLUGIN_ZIP_URL"`,
      `curl -sfL -o /tmp/plugin-dist.zip "$PLUGIN_ZIP_URL"`,
      `unzip -o /tmp/plugin-dist.zip -d ${PLUGIN_DIR}/dist/`,
      `rm -f /tmp/plugin-dist.zip`,
    ].join(' && '), { user: 'root' })
    // Write plugin package.json for CodeBolt discovery
    .runCmd(`cat > ${PLUGIN_DIR}/package.json << 'PKGJSON'
{
  "name": "${PLUGIN_UNIQUE_ID}",
  "version": "1.0.0",
  "description": "Bridges ExecutionGateway with a provider from another environment",
  "main": "dist/index.js",
  "codebolt": {
    "plugin": {
      "type": "execution",
      "gateway": { "claimsExecutionGateway": true },
      "triggers": [{ "type": "startup" }]
    }
  }
}
PKGJSON`, { user: 'root' })
    // Fix ownership so the user can access the plugin
    .runCmd(`chown -R user:user /home/user/.codebolt`, { user: 'root' });

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
