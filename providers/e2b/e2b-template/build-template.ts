/**
 * E2B Template Builder.
 *
 * Builds a sandbox template with codebolt cli pre-installed from npm, so the
 * provider doesn't have to `npm install -g codebolt` on every cold start.
 * The /plugins endpoint refactor means the remote-execution-plugin is no
 * longer needed, so we do NOT pre-bake it.
 *
 * node:22-trixie is required because @codebolt/narrative-linux-x64 (glibc
 * 2.35 after the ubuntu-22.04 build fix is still fine here) / historically
 * was linked against newer glibc; trixie is a safe modern base.
 *
 * Bump CLI_VERSION here and in E2bRemoteProviderService.ts together when you
 * want the sandbox to use a new published cli.
 *
 * Usage:
 *   npx tsx build-template.ts
 */

import { TemplateBase, Template, defaultBuildLogger } from 'e2b';
import { config } from 'dotenv';

config();

const CLI_VERSION = '1.12.27';

async function main() {
  console.log(`Building E2B template (node:22-trixie + codebolt@${CLI_VERSION})...\n`);

  const template = new TemplateBase()
    .fromImage('node:22-trixie')
    .aptInstall(['curl', 'git', 'unzip', 'jq'])
    .runCmd(`npm install -g codebolt@${CLI_VERSION}`, { user: 'root' });

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
