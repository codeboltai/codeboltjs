/**
 * E2B Template Builder.
 *
 * Builds a sandbox template with codebolt cli pre-installed from npm, so the
 * provider doesn't have to `npm install -g codebolt` on every cold start.
 * The direct execution gateway path means no bridge plugin is pre-baked.
 *
 * node:22-trixie is required because @codebolt/narrative-linux-x64 (glibc
 * 2.35 after the ubuntu-22.04 build fix is still fine here) / historically
 * was linked against newer glibc; trixie is a safe modern base.
 *
 * Bump CLI_VERSION here when you
 * want the sandbox to use a new published cli.
 *
 * Usage:
 *   npx tsx build-template.ts
 */

import { TemplateBase, Template, defaultBuildLogger } from 'e2b';
import { config } from 'dotenv';
import * as fs from 'node:fs';

config();

const CLI_VERSION = process.env.CODEBOLT_CLI_VERSION || '1.12.91';
const TEMPLATE_NAME = process.env.E2B_TEMPLATE_NAME || 'codebolt-remote-execution';
const BUILD_MEMORY_MB = Number(process.env.E2B_TEMPLATE_BUILD_MEMORY_MB || 4096);

async function main() {
  if (!/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(CLI_VERSION)) throw new Error('CODEBOLT_CLI_VERSION must be an exact version');
  console.log(`Building E2B template (node:22-trixie + codebolt@${CLI_VERSION})...\n`);

  const verifyRuntime = 'const fs=require("fs");const code=fs.readFileSync(process.argv[1],"utf8");if(!code.includes("asyncTask.listResponse")||!code.includes("asyncTask.controlResponse"))throw new Error("CLI runtime lacks asyncTask API");console.log("Verified CLI asyncTask API")';
  const template = new TemplateBase({ fileContextPath: __dirname })
    .fromImage('node:22-trixie')
    .aptInstall(['curl', 'git', 'unzip', 'jq'])
    .runCmd(`ONNXRUNTIME_NODE_INSTALL=skip npm install -g codebolt@${CLI_VERSION}`, { user: 'root' })
    .copy('provider-gateway-compat.cjs', '/tmp/provider-gateway-compat.cjs', { user: 'root' })
    .runCmd('node /tmp/provider-gateway-compat.cjs "$(npm root -g)/codebolt/dist/index.js"', { user: 'root' })
    .runCmd(`node -e '${verifyRuntime}' "$(npm root -g)/codebolt/dist/index.js"`, { user: 'root' });

  const buildInfo = await Template.build(template, TEMPLATE_NAME, {
    cpuCount: 2,
    memoryMB: BUILD_MEMORY_MB,
    onBuildLogs: defaultBuildLogger(),
  });

  console.log('\nTemplate built successfully!');
  console.log(`   Template ID: ${buildInfo.templateId}`);
  console.log(`   Build ID:    ${buildInfo.buildId}`);
  console.log(`   Name:        ${buildInfo.name}`);
  console.log('\nSet this in your config:');
  console.log(`   export E2B_SANDBOX_TEMPLATE=${buildInfo.templateId}`);
  if (process.env.E2B_TEMPLATE_RESULT_PATH) {
    fs.writeFileSync(process.env.E2B_TEMPLATE_RESULT_PATH, JSON.stringify(buildInfo, null, 2));
  }
}

main().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
