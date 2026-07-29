const fs = require('fs');
const os = require('os');
const path = require('path');

const API_DOCS_PACKAGE_ROOT = path.resolve(__dirname, '../../../CodeBolt/sdks/api-docs-index');

function requireFirst(candidates) {
  const errors = [];
  for (const candidate of candidates) {
    try {
      return require(candidate);
    } catch (error) {
      errors.push(`${candidate}: ${error.message}`);
    }
  }
  throw new Error(`Unable to load module. Tried:\n${errors.join('\n')}`);
}

const api = requireFirst([
  '@codebolt/api-docs-index',
  path.join(API_DOCS_PACKAGE_ROOT, 'dist', 'index.js'),
]);

const apiTools = requireFirst([
  '@codebolt/api-docs-index/tools',
  path.join(API_DOCS_PACKAGE_ROOT, 'dist', 'tools.js'),
]);

const { createTool } = requireFirst([
  path.resolve(__dirname, '../../../CodeBolt/sdks/agent/dist/unified/agent/tools.js'),
  path.resolve(__dirname, '../../../CodeBolt/sdks/agent/dist/unified/tools.js'),
  '@codebolt/agent/unified/tools',
  '@codebolt/agent/unified',
]);

const { z } = requireFirst([
  'zod',
  path.resolve(__dirname, '../../../CodeBolt/node_modules/zod'),
  path.resolve(__dirname, '../creation-agent/node_modules/zod'),
]);

let codebolt;
if (process.env.API_DOCS_INDEX_STANDALONE !== '1') {
  try {
    const loaded = require('@codebolt/codeboltjs');
    codebolt = loaded.default || loaded;
  } catch {
    codebolt = undefined;
  }
}

const report = {
  passed: 0,
  failed: [],
  skipped: [],
  checks: [],
};

function record(status, label, details) {
  report.checks.push({ status, label, details });
  if (status === 'ok') report.passed += 1;
  if (status === 'fail') report.failed.push({ label, details });
  if (status === 'skip') report.skipped.push({ label, details });
}

function ok(label) {
  record('ok', label);
}

function fail(label, error) {
  record('fail', label, error && error.message ? error.message : String(error));
}

function skip(label, reason) {
  record('skip', label, reason);
}

async function step(label, fn) {
  try {
    await fn();
    ok(label);
  } catch (error) {
    fail(label, error);
  }
}

function parseJsonl(filePath) {
  return fs.readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertArray(value, label) {
  assert(Array.isArray(value), `${label} must be an array.`);
  return value;
}

async function executeTool(tool, input) {
  const response = await tool.execute(input, {});
  assert(response && response.success, response && response.error ? response.error : `Tool ${tool.id} failed.`);
  return response.result;
}

function writeSandboxRun(projectPath, runId) {
  const runDir = path.join(projectPath, '.codebolt', 'api-docs-index', 'sandbox-runs', runId);
  fs.mkdirSync(runDir, { recursive: true });
  fs.writeFileSync(path.join(runDir, 'logs.txt'), 'agent smoke logs\n', 'utf8');
  fs.writeFileSync(path.join(runDir, 'trace.json'), JSON.stringify({ runId, ok: true }, null, 2), 'utf8');
}

function loadIndexRecords() {
  const indexPath = path.join(API_DOCS_PACKAGE_ROOT, 'generated', 'api-index.jsonl');
  return parseJsonl(indexPath);
}

async function runApiDocsIndexToolTests(options = {}) {
  report.passed = 0;
  report.failed = [];
  report.skipped = [];
  report.checks = [];

  const records = loadIndexRecords();
  const ids = records.map((record) => record.id);
  const uniqueIds = new Set(ids);

  await step('generated index has records', async () => {
    assert(records.length > 0, 'No generated records found.');
  });

  await step('generated index ids are unique', async () => {
    assert(uniqueIds.size === ids.length, `${ids.length - uniqueIds.size} duplicate id(s).`);
  });

  await step('getApiSpec resolves every generated API id', async () => {
    const missing = [];
    for (const id of ids) {
      const spec = await api.getApiSpec(id);
      if (!spec || !spec.id) missing.push(id);
    }
    assert(missing.length === 0, `Missing ${missing.length}: ${missing.slice(0, 10).join(', ')}`);
  });

  await step('canary signatures use TypeScript declarations', async () => {
    const chatHistory = await api.getApiSpec('codeboltjs.chat.getChatHistory');
    assert(chatHistory.returns === 'Promise<ChatMessage>', `getChatHistory returns ${chatHistory.returns}`);

    const openBrowser = await api.getApiSpec('codeboltjs.browser.openNewBrowserInstance');
    assert(openBrowser.returns === 'Promise<{ instanceId: string; }>', `openNewBrowserInstance returns ${openBrowser.returns}`);

    const findAgent = await api.getApiSpec('codeboltjs.agent.findAgent');
    const params = Object.fromEntries((findAgent.parameters || []).map((param) => [param.name, param]));
    assert(params.maxResult && params.maxResult.type === 'number | undefined', `findAgent.maxResult type is ${params.maxResult && params.maxResult.type}`);
    assert(params.agents && params.agents.type === 'never[] | undefined', `findAgent.agents type is ${params.agents && params.agents.type}`);
  });

  await step('searchApiDocs defaults to API surfaces', async () => {
    const results = await api.searchApiDocs('send message to user', { limit: 10 });
    assert(results.length > 0, 'No search results.');
    const badSurface = results.find((result) => !['runtime-api', 'agent-framework'].includes(result.surface));
    assert(!badSurface, `Unexpected default surface ${badSurface && badSurface.surface} for ${badSurface && badSurface.id}.`);
  });

  await step('reference docs are available when explicitly requested', async () => {
    const results = await api.searchApiDocs('api reference', { limit: 5, surface: 'reference-doc' });
    assert(results.length > 0, 'No reference-doc results.');
    assert(results.every((result) => result.surface === 'reference-doc'), 'Non reference-doc result returned for reference-doc surface filter.');
  });

  await step('listApiCategories returns expected filters', async () => {
    const categories = await api.listApiCategories();
    for (const packageName of ['@codebolt/codeboltjs', '@codebolt/agent', '@codebolt/client-sdk']) {
      assert(categories.packages.includes(packageName), `Missing package ${packageName}.`);
    }
    for (const surface of ['runtime-api', 'agent-framework', 'client-api']) {
      assert(categories.surfaces.includes(surface), `Missing surface ${surface}.`);
    }
  });

  await step('getModuleSpec resolves every runtime module', async () => {
    const modules = records.filter((record) => record.kind === 'module' && record.surface === 'runtime-api');
    const missing = modules
      .map((record) => record.category || record.title)
      .filter((moduleName) => api.getModuleSpec(moduleName).length === 0);
    assert(missing.length === 0, `Missing module specs: ${missing.join(', ')}`);
  });

  await step('getModuleDts resolves every module with dtsPath', async () => {
    const moduleNames = records
      .filter((record) => record.kind === 'module' && record.dtsPath)
      .map((record) => record.category || record.title);
    const dts = api.getModuleDts(moduleNames);
    assert(dts.missing.length === 0, `Missing d.ts modules: ${dts.missing.join(', ')}`);
    assert(dts.content.length > 0, 'No d.ts content returned.');
  });

  await step('examples resolve all listed examples', async () => {
    for (const example of api.listExamples()) {
      const full = api.getExample(example.id);
      assert(full && full.fileContents.length > 0, `Example ${example.id} has no file contents.`);
    }
  });

  await step('authoring APIs resolve templates and specs', async () => {
    for (const targetType of ['agent', 'plugin', 'client']) {
      const spec = api.getAuthoringSpec(targetType);
      assert(spec.targetType === targetType, `Bad spec targetType for ${targetType}.`);
      for (const template of api.listAuthoringTemplates(targetType)) {
        assert(api.getAuthoringTemplate(targetType, template.id), `Missing ${targetType} template ${template.id}.`);
      }
    }
    for (const template of api.listAgentTemplates()) {
      assert(api.getAgentTemplate(template.id), `Missing agent template ${template.id}.`);
    }
  });

  await step('authoring project creation validates generated manifests', async () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'api-docs-index-agent-'));
    try {
      const agent = api.createAgentProject({
        projectRoot: tempRoot,
        agentId: 'smoke-agent',
        title: 'Smoke Agent',
        description: 'Generated by API docs index testing agent.',
      });
      const agentManifest = api.validateAgentManifest({ manifestPath: path.join(agent.projectPath, 'codeboltagent.yaml') });
      assert(agentManifest.valid, `Generated agent manifest invalid: ${agentManifest.errors.join('; ')}`);

      const plugin = api.createAuthoringProject({
        projectRoot: tempRoot,
        targetType: 'plugin',
        targetId: 'smoke-plugin',
        title: 'Smoke Plugin',
        description: 'Generated by API docs index testing agent.',
      });
      const pluginManifest = api.validateAuthoringManifest({ targetType: 'plugin', manifestPath: path.join(plugin.projectPath, 'package.json') });
      assert(pluginManifest.valid, `Generated plugin manifest invalid: ${pluginManifest.errors.join('; ')}`);
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  await step('validateApiUsage detects known and unknown APIs', async () => {
    const valid = api.validateApiUsage({
      sourceText: "codebolt.chat.sendMessage('hello');",
      apiIds: ['codeboltjs.chat.getChatHistory'],
    });
    assert(valid.valid, `Expected known API usage to pass: ${valid.errors.join('; ')}`);

    const invalid = api.validateApiUsage({ sourceText: 'codebolt.notReal.nope();' });
    assert(!invalid.valid && invalid.unknownApis.length > 0, 'Expected unknown API usage to fail.');
  });

  await step('local tool schemas are valid OpenAI function schemas', async () => {
    for (const tool of apiTools.apiDocsIndexTools) {
      const schema = tool.toOpenAITool();
      assert(schema.type === 'function', `${tool.id} schema is not a function.`);
      assert(schema.function.name === tool.id, `${tool.id} schema name mismatch.`);
      assert(schema.function.parameters && schema.function.parameters.type === 'object', `${tool.id} parameters must be object schema.`);
    }
  });

  await step('search_api_docs tool action returns API surfaces', async () => {
    const result = assertArray(await executeTool(apiTools.searchApiDocsTool, { query: 'send message', limit: 5 }), 'search_api_docs result');
    assert(result.length > 0, 'No search results.');
    const badSurface = result.find((item) => !['runtime-api', 'agent-framework'].includes(item.surface));
    assert(!badSurface, `Unexpected surface ${badSurface && badSurface.surface}.`);
  });

  await step('get_api_spec tool action returns exact spec', async () => {
    const result = assertArray(await executeTool(apiTools.getApiSpecTool, { ids: ['codeboltjs.chat.sendMessage'] }), 'get_api_spec result');
    assert(result[0] && result[0].id === 'codeboltjs.chat.sendMessage', 'Unexpected spec result.');
  });

  await step('module lookup tool actions return content', async () => {
    const spec = assertArray(await executeTool(apiTools.getModuleSpecTool, { module: 'chat' }), 'get_module_spec result');
    assert(spec[0] && spec[0].kind === 'module', 'Module summary was not first.');
    const dts = await executeTool(apiTools.getModuleDtsTool, { modules: ['chat', 'fs', 'agent-core'] });
    assert(dts.missing.length === 0 && dts.content.length > 0, 'Missing d.ts content.');
  });

  await step('category/example tool actions return content', async () => {
    const categories = await executeTool(apiTools.listApiCategoriesTool, {});
    assert(categories.packages.includes('@codebolt/codeboltjs'), 'Missing codeboltjs package.');

    const examples = assertArray(await executeTool(apiTools.listExamplesTool, {}), 'list_examples result');
    if (examples.length > 0) {
      const example = await executeTool(apiTools.getExampleTool, { exampleId: examples[0].id });
      assert(example.fileContents && example.fileContents.length > 0, `Example ${examples[0].id} has no files.`);
    }
  });

  await step('authoring tool actions return content', async () => {
    await executeTool(apiTools.getAuthoringSpecTool, { targetType: 'agent' });
    const concepts = assertArray(await executeTool(apiTools.listAuthoringConceptsTool, { targetType: 'plugin' }), 'list_authoring_concepts result');
    if (concepts.length > 0) {
      await executeTool(apiTools.getAuthoringConceptTool, { targetType: 'plugin', conceptId: concepts[0].id });
    }
    const agentTemplates = assertArray(await executeTool(apiTools.listAgentTemplatesTool, {}), 'list_agent_templates result');
    await executeTool(apiTools.getAgentTemplateTool, { templateId: agentTemplates[0].id });
    const authoringTemplates = assertArray(await executeTool(apiTools.listAuthoringTemplatesTool, { targetType: 'plugin' }), 'list_authoring_templates result');
    await executeTool(apiTools.getAuthoringTemplateTool, { targetType: 'plugin', templateId: authoringTemplates[0].id });
  });

  await step('create/validate authoring tool actions are consistent', async () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'api-docs-index-tools-agent-'));
    try {
      const agent = await executeTool(apiTools.createAgentProjectTool, {
        projectRoot: tempRoot,
        agentId: 'tool-smoke-agent',
        title: 'Tool Smoke Agent',
        description: 'Generated by API docs index testing agent.',
      });
      const agentManifest = await executeTool(apiTools.validateAgentManifestTool, {
        manifestPath: path.join(agent.projectPath, 'codeboltagent.yaml'),
      });
      assert(agentManifest.valid, `Generated agent manifest invalid: ${agentManifest.errors.join('; ')}`);

      const plugin = await executeTool(apiTools.createAuthoringProjectTool, {
        projectRoot: tempRoot,
        targetType: 'plugin',
        targetId: 'tool-smoke-plugin',
        title: 'Tool Smoke Plugin',
        description: 'Generated by API docs index testing agent.',
      });
      const pluginManifest = await executeTool(apiTools.validateAuthoringManifestTool, {
        targetType: 'plugin',
        manifestPath: path.join(plugin.projectPath, 'package.json'),
      });
      assert(pluginManifest.valid, `Generated plugin manifest invalid: ${pluginManifest.errors.join('; ')}`);

      const usage = await executeTool(apiTools.validateApiUsageTool, { sourceText: "codebolt.chat.sendMessage('hello');" });
      assert(usage.valid, `Known API usage failed: ${usage.errors.join('; ')}`);
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  await step('sandbox log lookup tool actions read persisted files', async () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'api-docs-index-sandbox-agent-'));
    try {
      const runId = 'agent-smoke-run';
      writeSandboxRun(tempRoot, runId);
      const logs = await executeTool(apiTools.getSandboxLogsTool, { projectPath: tempRoot, runId });
      assert(logs.logs.includes('agent smoke logs'), 'Sandbox logs were not read.');
      const trace = await executeTool(apiTools.getExecutionTraceTool, { projectPath: tempRoot, runId });
      assert(trace.runId === runId, 'Sandbox trace was not read.');
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  const shouldRunSandbox = options.runSandbox && process.env.API_DOCS_INDEX_SKIP_SANDBOX !== '1';
  if (shouldRunSandbox) {
    await step('test_run_agent_sandbox tool action executes command', async () => {
      const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'api-docs-index-runtime-agent-'));
      try {
        fs.writeFileSync(path.join(tempRoot, 'package.json'), JSON.stringify({ scripts: { test: 'node -e "process.exit(0)"' } }, null, 2), 'utf8');
        const result = await executeTool(apiTools.testRunAgentSandboxTool, {
          projectPath: tempRoot,
          command: 'node -e "process.exit(0)"',
          waitMs: 10000,
        });
        assert(result.runId && result.logsPath && result.tracePath, 'Sandbox run did not return metadata.');
      } finally {
        fs.rmSync(tempRoot, { recursive: true, force: true });
      }
    });
  } else {
    skip('test_run_agent_sandbox tool action', 'requires live CodeBolt runtime; unset API_DOCS_INDEX_SKIP_SANDBOX and run inside CodeBolt to execute it');
  }

  return {
    success: report.failed.length === 0,
    passed: report.passed,
    failed: report.failed,
    skipped: report.skipped,
    checks: report.checks,
  };
}

const runApiDocsIndexSmokeTestTool = createTool({
  id: 'run_api_docs_index_smoke_test',
  description: 'Run deterministic smoke tests for @codebolt/api-docs-index APIs and local tool actions.',
  inputSchema: z.object({
    runSandbox: z.boolean().optional().describe('Also run the terminal-backed sandbox action. Requires live CodeBolt runtime.'),
  }),
  execute: async ({ input }) => runApiDocsIndexToolTests({ runSandbox: Boolean(input && input.runSandbox) }),
});

function formatSummary(result) {
  const lines = [];
  lines.push(`API Docs Index Tool Tester: ${result.success ? 'PASS' : 'FAIL'}`);
  lines.push(`Passed: ${result.passed}`);
  lines.push(`Failed: ${result.failed.length}`);
  lines.push(`Skipped: ${result.skipped.length}`);
  if (result.failed.length > 0) {
    lines.push('');
    lines.push('Failures:');
    for (const failure of result.failed) {
      lines.push(`- ${failure.label}: ${failure.details}`);
    }
  }
  if (result.skipped.length > 0) {
    lines.push('');
    lines.push('Skipped:');
    for (const skipped of result.skipped) {
      lines.push(`- ${skipped.label}: ${skipped.details}`);
    }
  }
  return lines.join('\n');
}

async function notify(message) {
  if (codebolt && codebolt.chat && typeof codebolt.chat.sendMessage === 'function') {
    try {
      await codebolt.chat.sendMessage(message);
    } catch {
      // Chat reporting is best effort; return value still carries the full summary.
    }
  }
}

async function runForMessage(message) {
  const text = typeof message === 'string'
    ? message
    : message && typeof message.userMessage === 'string'
      ? message.userMessage
      : '';
  const runSandbox = /sandbox|all|runtime/i.test(text) && process.env.API_DOCS_INDEX_SKIP_SANDBOX !== '1';
  await notify('API Docs Index Tool Tester started.');
  const toolResponse = await runApiDocsIndexSmokeTestTool.execute({ runSandbox }, {});
  if (!toolResponse.success) {
    throw new Error(toolResponse.error || 'run_api_docs_index_smoke_test failed.');
  }
  const result = toolResponse.result;
  const summary = formatSummary(result);
  await notify(summary);
  if (!result.success) {
    throw new Error(summary);
  }
  return summary;
}

if (codebolt && typeof codebolt.onMessage === 'function') {
  codebolt.onMessage(runForMessage);
}

if (require.main === module && process.env.API_DOCS_INDEX_STANDALONE === '1') {
  runApiDocsIndexSmokeTestTool.execute({ runSandbox: process.env.API_DOCS_INDEX_SKIP_SANDBOX !== '1' }, {})
    .then((toolResponse) => {
      if (!toolResponse.success) throw new Error(toolResponse.error || 'run_api_docs_index_smoke_test failed.');
      const result = toolResponse.result;
      console.log(formatSummary(result));
      if (!result.success) process.exit(1);
    })
    .catch((error) => {
      console.error(error && error.stack ? error.stack : String(error));
      process.exit(1);
    });
}

module.exports = {
  runApiDocsIndexToolTests,
  runApiDocsIndexSmokeTestTool,
};
