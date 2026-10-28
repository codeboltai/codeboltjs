const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const { EventEmitter } = require('node:events');
const root = process.env.E2B_PROVIDER_ROOT || path.resolve(__dirname, '..');
const ts = require(require.resolve('typescript', { paths: [root] }));

function fixture(config) {
  class Socket extends EventEmitter {
    static OPEN = 1;
    static instances = [];
    static fail = false;
    static autoReply = true;
    constructor(url) {
      super(); this.url = url; this.readyState = 0; this.sent = [];
      Socket.instances.push(this);
      queueMicrotask(() => {
        if (this.readyState !== 0) return;
        if (Socket.fail) { this.emit('error', new Error('chat refused')); this.close(); }
        else { this.readyState = 1; this.emit('open'); }
      });
    }
    send(data, callback) {
      const request = JSON.parse(data);
      this.sent.push(request);
      callback?.();
      if (Socket.autoReply && request.type === 'threadEvent') queueMicrotask(() => this.emit('message', JSON.stringify({
        type: 'startThreadResponse', success: true, requestId: request.requestId,
        threadId: request.params.threadId || 'new-thread',
      })));
    }
    close() { this.readyState = 3; this.emit('close'); }
    terminate() { this.close(); }
  }
  class BaseProvider {
    constructor(config) {
      this.config = config; this.state = {}; this.forwarded = [];
      this.agentServer = { serverUrl: 'wss://sandbox.example', isConnected: true, wsConnection: { readyState: 1 } };
    }
    resetState() { this.state = {}; }
    async resolveWorkspacePath() { return this.state.projectPath; }
    async afterConnected() {}
    startHeartbeat() {}
    registerConnectedEnvironment() {}
    startEnvironmentHeartbeat() {}
    handleTransportMessage(message) { this.forwarded.push(message); }
  }
  const logger = { log() {}, error() {}, warn() {} };
  const cache = new Map();
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename).exports;
    let actual = filename;
    if (filename.endsWith('/services/E2bRemoteProviderService.ts') && process.env.E2B_CHAT_SERVICE_SOURCE) actual = process.env.E2B_CHAT_SERVICE_SOURCE;
    if (filename.endsWith('/utils/sandboxChat.ts') && process.env.E2B_CHAT_HELPER_SOURCE) actual = process.env.E2B_CHAT_HELPER_SOURCE;
    const mod = new Module(filename, module);
    cache.set(filename, mod);
    mod.filename = filename;
    mod.paths = Module._nodeModulePaths(path.dirname(filename));
    const originalRequire = mod.require.bind(mod);
    mod.require = name => {
      if (name === '@codebolt/provider') return { BaseProvider };
      if (name === 'ws') return Socket;
      if (name === '../utils/logger') return { createPrefixedLogger: () => logger };
      if (name.startsWith('.')) {
        const target = path.resolve(path.dirname(filename), `${name}.ts`);
        if (fs.existsSync(target) || target.endsWith('/utils/sandboxChat.ts')) return load(target);
      }
      return originalRequire(name);
    };
    const output = ts.transpileModule(fs.readFileSync(actual, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    }).outputText;
    mod._compile(output, filename);
    return mod.exports;
  }
  const { E2bRemoteProviderService } = load(path.join(root, 'src/services/E2bRemoteProviderService.ts'));
  const service = new E2bRemoteProviderService(config);
  service.sandboxWorkspacePath = '/home/user/project';
  service.ensureAgentServer = async () => { service.agentServer.serverUrl = 'wss://sandbox.example'; };
  const helpers = load(path.join(root, 'src/utils/sandboxChat.ts'));
  const socket = new Socket('wss://sandbox.example/direct-execution-gateway');
  socket.readyState = Socket.OPEN;
  service.agentServer.wsConnection = socket;
  service.ensureTransportConnection = async () => {
    service.agentServer.isConnected = true;
    socket.readyState = Socket.OPEN;
  };
  return { service, Socket, helpers, socket };
}

const turn = () => ({
  type: 'messageResponse', threadId: 'host-thread', projectPath: '/Users/host/project',
  runtimeId: 'environment:host-env', targetRuntimeId: 'environment:host-env',
  narrativeBundlePath: '/Users/host/bundle.tar.gz', narrativeContext: { objective_id: 'objective' },
  message: { userMessage: 'hi', selectedAgent: { id: 'act-agent' }, environment: { id: 'host-env' },
    isRemoteTask: true, remoteEnv: true, environmentProvider: { unique_id: 'e2b' } },
});

test('keeps the generic gateway transport and normalizes the host turn for sandbox execution', async () => {
  const { service, socket, Socket } = fixture();
  const input = turn();
  await service.onProviderAgentStart(input);
  assert.equal(new URL(socket.url).pathname, '/direct-execution-gateway');
  assert.equal(Socket.instances.length, 1);
  const sent = socket.sent[0];
  assert.equal(sent.type, 'threadEvent');
  assert.equal(sent.action, 'createAndStartThread');
  assert.ok(sent.requestId);
  assert.equal(sent.threadId, undefined);
  assert.equal(sent.params.threadId, 'host-thread');
  assert.equal(sent.params.reuseThreadId, true);
  assert.equal(sent.params.executionMode, 'background_scoped');
  assert.equal(sent.params.waitForCompletion, false);
  assert.equal(sent.params.projectPath, '/home/user/project');
  assert.equal(sent.params.userMessage, 'hi');
  assert.deepEqual(sent.message, sent.params);
  assert.equal(sent.params.selectedAgent.id, 'act-agent');
  assert.equal(sent.params.environment, undefined);
  assert.equal(sent.params.remoteEnv, undefined);
  assert.equal(sent.params.runtimeId, undefined);
  assert.equal(sent.params.narrativeBundlePath, undefined);
  assert.equal(sent.params.narrativeContext.objective_id, 'objective');
  assert.equal(input.message.environment.id, 'host-env');
});

test('forwards gateway chat responses back to the host without another transport', () => {
  const { service } = fixture();
  service.handlePluginMessage({ type: 'chatBroadcast', message: { type: 'message', threadId: 'host-thread', content: 'Hello' } });
  assert.equal(service.forwarded[0].type, 'chatBroadcast');
  assert.equal(service.forwarded[0].message.content, 'Hello');
});

test('keeps backend API responses out of the host request dispatcher', () => {
  const { service } = fixture();
  for (const type of ['asyncTask.listResponse', 'asyncTask.errorResponse', 'getProjectPathResponse', 'startThreadResponse', 'externalError']) {
    service.handlePluginMessage({ type, requestId: 'sandbox-request' });
    service.handlePluginMessage({ type: 'executionGateway.notification', originalType: 'asyncTask.list', result: { type, requestId: 'sandbox-request' } });
  }
  assert.equal(service.forwarded.length, 0);
  service.handlePluginMessage({ type: 'executionGateway.notification', result: { type: 'message', threadId: 'host-thread', content: 'Hello' } });
  assert.equal(service.forwarded[0].content, 'Hello');
});

test('returns sandbox approval acknowledgements to the requesting host', () => {
  const { service } = fixture();
  const response = { type: 'providerApprovalReplyResponse', requestId: 'approval-request', success: true };
  service.handlePluginMessage(response);
  assert.deepEqual(service.forwarded, [response]);
});

test('forwards approval replies over the existing sandbox socket without starting another agent', async () => {
  const { service, socket } = fixture();
  service.matchPendingExecutionRequest = () => null;
  // BaseProvider normally forwards raw messages through this socket.
  const base = Object.getPrototypeOf(Object.getPrototypeOf(service));
  base.onRawMessage = async function (message) { this.agentServer.wsConnection.send(JSON.stringify(message)); };
  const request = { type: 'providerApprovalReply', requestId: 'approval-request', rememberForThread: true,
    reply: { type: 'confirmationResponse', messageId: 'original-message', threadId: 'host-thread' } };
  await service.onRawMessage(request);
  assert.deepEqual(socket.sent, [request]);
});

test('drops async-task echoes from the host before they can loop back to the sandbox', async () => {
  const { service, socket } = fixture();
  for (const type of ['asyncTask.listResponse', 'asyncTask.errorResponse']) await service.onRawMessage({ type });
  assert.equal(socket.sent.length, 0);
});

test('reconnects the generic gateway before forwarding the next turn', async () => {
  const { service, socket } = fixture();
  service.state.environmentName = 'env';
  service.agentServer.isConnected = false;
  await service.onProviderAgentStart(turn());
  assert.equal(service.agentServer.isConnected, true);
  assert.equal(socket.sent.length, 1);
});

test('propagates failed gateway sends', async () => {
  const { service, socket } = fixture();
  socket.send = (_data, callback) => callback(new Error('gateway send failed'));
  await assert.rejects(service.onProviderAgentStart(turn()), /gateway send failed/);
});

async function waitForSend(socket, count = 1) {
  for (let i = 0; i < 100 && socket.sent.length < count; i++) await Promise.resolve();
  assert.equal(socket.sent.length, count);
  return socket.sent[count - 1];
}

test('waits for a matching start response and ignores unrelated gateway traffic', async () => {
  const { service, socket, Socket } = fixture();
  Socket.autoReply = false;
  let settled = false;
  const result = service.onProviderAgentStart(turn()).then(() => { settled = true; });
  const request = await waitForSend(socket);
  assert.equal(settled, false);
  socket.emit('message', JSON.stringify({ type: 'startThreadResponse', requestId: 'unrelated', success: true, threadId: 'host-thread' }));
  await Promise.resolve();
  assert.equal(settled, false);
  socket.emit('message', JSON.stringify({ type: 'startThreadResponse', requestId: request.requestId, success: true, threadId: 'host-thread' }));
  await result;
  assert.equal(settled, true);
  assert.equal(socket.listenerCount('message'), 0);
  assert.equal(socket.listenerCount('close'), 0);
  assert.equal(socket.listenerCount('error'), 0);
});

test('propagates correlated server startup errors', async () => {
  const { service, socket, Socket } = fixture();
  Socket.autoReply = false;
  const result = service.onProviderAgentStart(turn());
  const rejected = assert.rejects(result, /Agent unavailable/);
  const request = await waitForSend(socket);
  socket.emit('message', JSON.stringify({ type: 'startThreadResponse', requestId: request.requestId, success: false, error: 'Agent unavailable' }));
  await rejected;
  assert.equal(socket.listenerCount('message'), 0);
});

test('accepts the legacy dispatch acknowledgement only for the requested thread and agent', async () => {
  const { service, socket, Socket } = fixture({ timeouts: { agentStart: 1000 } });
  Socket.autoReply = false;
  let settled = false;
  const result = service.onProviderAgentStart(turn()).then(() => { settled = true; });
  await waitForSend(socket);
  for (const event of [
    { type: 'ThreadAgentStarted', threadId: 'other-thread', agentId: 'act-agent' },
    { type: 'ThreadAgentStarted', threadId: 'host-thread', agentId: 'other-agent' },
    { type: 'ThreadAgentStarted', threadId: 'host-thread' },
    { type: 'chatBroadcast', message: { type: 'message', threadId: 'host-thread', content: 'Installing agent' } },
  ]) socket.emit('message', JSON.stringify(event));
  await Promise.resolve();
  assert.equal(settled, false);
  socket.emit('message', JSON.stringify({ type: 'ThreadAgentStarted', threadId: 'host-thread', agentId: 'act-agent' }));
  await result;
  assert.equal(settled, true);
  assert.equal(socket.listenerCount('message'), 0);
  assert.equal(socket.listenerCount('close'), 0);
  assert.equal(socket.listenerCount('error'), 0);
});

test('accepts subsequent turns on the same legacy thread without waiting for task completion', async () => {
  const { service, socket, Socket } = fixture({ timeouts: { agentStart: 1000 } });
  Socket.autoReply = false;
  for (let count = 1; count <= 2; count++) {
    const result = service.onProviderAgentStart(turn());
    const request = await waitForSend(socket, count);
    socket.emit('message', JSON.stringify({ type: 'ThreadAgentStarted', threadId: request.message.threadId, agentId: request.message.selectedAgent.id }));
    await result;
  }
  assert.notEqual(socket.sent[0].requestId, socket.sent[1].requestId);
});

test('correlates legacy notifications and ignores unrelated or uncorrelated results', async () => {
  const { service, socket, Socket } = fixture();
  Socket.autoReply = false;
  let settled = false;
  const result = service.onProviderAgentStart(turn()).then(() => { settled = true; });
  const request = await waitForSend(socket);
  const response = { type: 'startThreadResponse', success: true, threadId: 'host-thread' };
  socket.emit('message', JSON.stringify(response));
  socket.emit('message', JSON.stringify({ type: 'executionGateway.notification', originalMessage: { requestId: 'other-request' }, result: response }));
  await Promise.resolve();
  assert.equal(settled, false);
  socket.emit('message', JSON.stringify({ type: 'executionGateway.notification', originalMessage: request, result: response }));
  await result;
  assert.equal(settled, true);
  assert.equal(socket.listenerCount('message'), 0);
});

test('propagates the legacy template error immediately through its notification', async () => {
  const { service, socket, Socket } = fixture();
  Socket.autoReply = false;
  const rejected = assert.rejects(service.onProviderAgentStart(turn()), /Cannot set properties of undefined/);
  const request = await waitForSend(socket);
  socket.emit('message', JSON.stringify({
    type: 'executionGateway.notification', originalMessage: request,
    result: { type: 'errorResponse', error: "Cannot set properties of undefined (setting 'parentId')" },
  }));
  await rejected;
  assert.equal(socket.listenerCount('message'), 0);
});

test('rejects when the gateway disconnects before confirming startup', async () => {
  const { service, socket, Socket } = fixture();
  Socket.autoReply = false;
  const rejected = assert.rejects(service.onProviderAgentStart(turn()), /disconnected before sandbox agent startup/);
  await waitForSend(socket);
  socket.close();
  await rejected;
  assert.equal(socket.listenerCount('message'), 0);
});

test('times out a gateway that accepts writes but never starts a thread', async () => {
  const { service, socket, Socket } = fixture({ timeouts: { agentStart: 15 } });
  Socket.autoReply = false;
  await assert.rejects(service.onProviderAgentStart(turn()), /Timeout waiting for sandbox startThreadResponse after 15ms/);
  assert.equal(socket.listenerCount('message'), 0);
});

test('rejects an acknowledgement for an unexpected thread', async () => {
  const { service, socket, Socket } = fixture();
  Socket.autoReply = false;
  const rejected = assert.rejects(service.onProviderAgentStart(turn()), /unexpected thread ID/);
  const request = await waitForSend(socket);
  socket.emit('message', JSON.stringify({ type: 'startThreadResponse', requestId: request.requestId, success: true, threadId: 'other-thread' }));
  await rejected;
});

test('rejects empty tasks before sending a startup request', async () => {
  const { service, socket } = fixture();
  await assert.rejects(service.onProviderAgentStart({ ...turn(), message: { userMessage: ' ' } }), /without a user message/);
  assert.equal(socket.sent.length, 0);
});

for (const format of ['current', 'legacy', 'legacy-dispatch']) {
test(`starts through a real local ${format} WebSocket gateway and waits for its response`, async t => {
  const { WebSocket, WebSocketServer } = require(require.resolve('ws', { paths: [root] }));
  const { once } = require('node:events');
  const { service } = fixture();
  const gateway = new WebSocketServer({ host: '127.0.0.1', port: 0, path: '/direct-execution-gateway' });
  let client;
  t.after(() => {
    client?.terminate();
    for (const socket of gateway.clients) socket.terminate();
    return new Promise(resolve => gateway.close(resolve));
  });
  await once(gateway, 'listening');
  const connection = once(gateway, 'connection');
  client = new WebSocket(`ws://127.0.0.1:${gateway.address().port}/direct-execution-gateway`);
  const [serverSocket] = await connection;
  await once(client, 'open');
  service.agentServer.wsConnection = client;
  const received = once(serverSocket, 'message');
  let settled = false;
  const result = service.onProviderAgentStart(turn()).then(() => { settled = true; });
  const [raw] = await received;
  const request = JSON.parse(raw.toString());
  assert.equal(request.type, 'threadEvent');
  assert.equal(request.action, 'createAndStartThread');
  assert.equal(request.params.userMessage, 'hi');
  assert.equal(request.params.environment, undefined);
  assert.equal(settled, false);
  let response;
  if (format.startsWith('legacy')) {
    // Reproduce the template's dereference that failed in env-a7077e0f.
    request.message.parentId = request.threadId;
    assert.equal(request.message.parentId, undefined);
    assert.equal(request.message.threadId, 'host-thread');
    assert.equal(request.message.userMessage, 'hi');
    assert.equal(request.message.selectedAgent.id, 'act-agent');
    response = format === 'legacy-dispatch'
      ? { type: 'ThreadAgentStarted', threadId: request.message.threadId, agentId: request.message.selectedAgent.id }
      : { type: 'executionGateway.notification', originalMessage: request,
          result: { type: 'startThreadResponse', success: true, threadId: request.message.threadId } };
  } else {
    response = { type: 'startThreadResponse', requestId: request.requestId, success: true, threadId: request.params.threadId };
  }
  serverSocket.send(JSON.stringify(response));
  await result;
  assert.equal(settled, true);
});
}

test('reports the sandbox workspace and actual environment ID while keeping local metadata separate', async () => {
  const { service } = fixture();
  service.setupEnvironment = async () => { service.sandboxId = 'sandbox-id'; service.sandbox = {}; };
  service.ensureTransportConnection = async () => {};
  const result = await service.onProviderStart({
    environmentName: 'env-name', environmentId: 'actual-id', providerId: 'e2b-remote-provider',
    projectPath: '/host/project', resolvedPath: '/home/user/project',
  });
  assert.equal(result.environmentId, 'actual-id');
  assert.equal(result.workspacePath, '/home/user/project');
  assert.equal(result.resolvedPath, '/home/user/project');
  assert.equal(result.environmentPath, '/home/user/project');
  assert.equal(service.state.workspacePath, '/host/project/.codebolt/remote-envs/env-name');
});

test('rebases nested active-project settings without touching unrelated projects or credentials', () => {
  const { helpers } = fixture();
  const source = { codebolt_users: [{ active_project_path: '/Users/host/project' }],
    files: ['/Users/host/project/src/index.ts', '/Users/host/project-other/src/index.ts'],
    apiKey: 'secret', endpoint: 'https://example.test' };
  const result = JSON.parse(helpers.rebaseSandboxSettings(JSON.stringify(source), '/Users/host/project/', '/home/user/project'));
  assert.equal(result.codebolt_users[0].active_project_path, '/home/user/project');
  assert.deepEqual(result.files, ['/home/user/project/src/index.ts', '/Users/host/project-other/src/index.ts']);
  assert.equal(result.apiKey, 'secret');
  assert.equal(result.endpoint, 'https://example.test');
});

test('pins sandbox user profiles to its workspace even when host profiles select other projects', () => {
  const { helpers } = fixture();
  const source = {
    codebolt_users: [
      { userId: 'first', active_profile_id: 'default', active_project_path: '/Users/host/unrelated' },
      { userId: 'second', active_profile_id: 'second-profile', active_project_path: '/Users/host/codeboltjs' },
    ],
    codebolt_userprofiles: [{ profileId: 'default', llm_settings: [{ apiKey: 'test-key' }] }],
    projectHistory: ['/Users/host/unrelated'],
    projectConfig: '/Users/host/continuing-olive/.codebolt/projectState.json',
  };
  const serialized = helpers.prepareSandboxGlobalSettings(JSON.stringify(source), '/Users/host/continuing-olive', '/home/user/env-b64c3987');
  // Both initial startup and the agent connection reload this serialized file.
  for (let reload = 0; reload < 2; reload++) {
    const settings = JSON.parse(serialized);
    for (const user of settings.codebolt_users) assert.equal(user.active_project_path, '/home/user/env-b64c3987');
    assert.deepEqual(settings.codebolt_userprofiles, source.codebolt_userprofiles);
    assert.deepEqual(settings.projectHistory, source.projectHistory);
    assert.equal(settings.projectConfig, '/home/user/env-b64c3987/.codebolt/projectState.json');
  }
  assert.equal(source.codebolt_users[1].active_project_path, '/Users/host/codeboltjs');
});

test('preserves settings without user profiles', () => {
  const { helpers } = fixture();
  const source = { theme: 'dark', endpoint: 'https://example.test' };
  assert.deepEqual(JSON.parse(helpers.prepareSandboxGlobalSettings(JSON.stringify(source), '/host', '/home/user/project')), source);
});
