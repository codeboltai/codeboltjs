/**
 * E2B Template Builder.
 *
 * Builds a sandbox template with codebolt cli pre-installed from npm and the
 * cloud-plugin pre-extracted into the user's plugin directory.
 *
 * node:22-trixie is required because @codebolt/narrative-linux-x64 (glibc
 * 2.35 after the ubuntu-22.04 build fix is still fine here) / historically
 * was linked against newer glibc; trixie is a safe modern base.
 *
 * Bump CLI_VERSION here and in E2bRemoteProviderService.ts together when you
 * want the sandbox to use a new published cli.
 *
 * Usage:
 *   npx tsx build-template-with-plugin.ts
 */

import { TemplateBase, Template, defaultBuildLogger } from 'e2b';
import { config } from 'dotenv';

config();

const CLI_VERSION = '1.12.29';
const PLUGIN_UNIQUE_ID = 'cloud-plugin';
const PLUGIN_DETAIL_URL = `https://api.codebolt.ai/api/plugins/detailbyuid?unique_id=${encodeURIComponent(PLUGIN_UNIQUE_ID)}`;
const CODEBOLT_PLUGIN_ROOT = '/home/user/.codebolt/plugins';
const CODEBLOT_ROOT = '/home/user/.codeblot';

function buildPluginInstallCommand(): string {
  const cacheBuster = Date.now();
  return [
    `mkdir -p ${CODEBOLT_PLUGIN_ROOT} ${CODEBLOT_ROOT}`,
    `rm -rf ${CODEBLOT_ROOT}/plugins`,
    `ln -s ${CODEBOLT_PLUGIN_ROOT} ${CODEBLOT_ROOT}/plugins`,
    `plugin_json="$(curl -fsSL '${PLUGIN_DETAIL_URL}&t=${cacheBuster}')"`,
    `plugin_zip_url="$(printf '%s' "$plugin_json" | jq -r '.zipFilePath')"`,
    `plugin_dir_name="$(printf '%s' "$plugin_json" | jq -r '.unique_id // .name')"`,
    `test -n "$plugin_zip_url"`,
    `test "$plugin_zip_url" != "null"`,
    `test -n "$plugin_dir_name"`,
    `test "$plugin_dir_name" != "null"`,
    `plugin_target_dir="${CODEBOLT_PLUGIN_ROOT}/$plugin_dir_name"`,
    `rm -rf "$plugin_target_dir"`,
    `mkdir -p "$plugin_target_dir"`,
    `tmp_dir="$(mktemp -d)"`,
    `trap 'rm -rf "$tmp_dir"' EXIT`,
    `curl -fsSL "$plugin_zip_url?t=${cacheBuster}" -o "$tmp_dir/plugin.zip"`,
    `unzip -oq "$tmp_dir/plugin.zip" -d "$plugin_target_dir"`,
    `rm -rf "$tmp_dir"`,
    `trap - EXIT`,
  ].join(' && ');
}

async function main() {
  console.log(
    `Building E2B template (node:22-trixie + codebolt@${CLI_VERSION} + ${PLUGIN_UNIQUE_ID})...\n`,
  );

  const template = new TemplateBase()
    .fromImage('node:22-trixie')
    .aptInstall(['curl', 'git', 'unzip', 'jq'])
    .runCmd(`npm install -g codebolt@${CLI_VERSION}`, { user: 'root' })
    .runCmd(buildPluginInstallCommand(), { user: 'root' });

  const buildInfo = await Template.build(template, 'codebolt-remote-template-with-plugin', {
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
