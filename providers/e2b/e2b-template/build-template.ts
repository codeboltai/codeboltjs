/**
 * E2B Template Builder — minimal base.
 *
 * Builds a thin sandbox template: node:22-trixie + apt tooling, nothing else.
 * The provider installs codebolt cli + remote-execution-plugin from the local
 * monorepo at runtime via installLocalDevArtifacts — so this template does
 * NOT pre-bake either of them.
 *
 * node:22-trixie is required because @codebolt/narrative-linux-x64 is linked
 * against glibc 2.39 (node:20/bookworm ships glibc 2.36 and fails with
 * `libc.so.6: version GLIBC_2.39 not found`).
 *
 * Usage:
 *   npx tsx build-template.ts
 */

import { TemplateBase, Template, defaultBuildLogger } from 'e2b';
import { config } from 'dotenv';

config();

async function main() {
  console.log('Building minimal E2B template (node:22-trixie + tooling)...\n');

  const template = new TemplateBase()
    .fromImage('node:22-trixie')
    .aptInstall(['curl', 'git', 'unzip', 'jq']);

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
