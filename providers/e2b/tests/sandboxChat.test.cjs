const { test } = require('node:test');
const os = require('node:os');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const { EventEmitter } = require('node:events');
const root = process.env.E2B_PROVIDER_ROOT || path.resolve(__dirname, '..');
const ts = require(require.resolve('typescript', { paths: [root] }));

function fixture(config, sdkOverrides = {}) {
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
      if (name === '@e2b/desktop' && sdkOverrides.desktop) return { Sandbox: sdkOverrides.desktop };
      if (name === '@e2b/code-interpreter' && sdkOverrides.headless) return { Sandbox: sdkOverrides.headless };
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


test('uses the configured CodeBolt desktop template for screen access and preserves headless selection', async () => {
  for (const screenAccess of [true, false]) {
    const rootDir = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'codebolt-desktop-template-'));
    const desktopCalls = [], headlessCalls = [];
    let streamStarted = false;
    const sandbox = { sandboxId: 'new-sandbox', commands: { run: async () => ({stdout:''}) }, stream: {start:async()=>{streamStarted=true;},getUrl:()=> 'https://desktop.example.test/vnc.html'} };
    const {service} = fixture({ sandboxTemplate:'headless-custom', desktopSandboxTemplate:'desktop-custom' }, {
      desktop: {create:async (...args)=>{desktopCalls.push(args);return sandbox;}},
      headless: {create:async (...args)=>{headlessCalls.push(args);return sandbox;}},
    });
    service.screenAccessEnabled=screenAccess;
    service.state.projectPath=rootDir;
    service.getPersistedResourceId=()=>undefined;
    service.setEnvironmentResourceId=()=>{};
    try {
      await service.setupEnvironment({environmentName:'test',screenAccess:{resolution:{width:1440,height:900}}});
      const calls=screenAccess?desktopCalls:headlessCalls;
      assert.equal(calls.length,1);
      assert.equal(calls[0][0],screenAccess?'desktop-custom':'headless-custom');
      assert.equal((screenAccess?headlessCalls:desktopCalls).length,0);
      assert.equal(streamStarted,screenAccess);
      if(screenAccess) assert.deepEqual(calls[0][1].resolution,[1440,900]);
    } finally {fs.rmSync(rootDir,{recursive:true,force:true});}
  }
});

test('rejects an empty desktop template instead of creating an unprepared desktop image', async () => {
  const rootDir=fs.mkdtempSync(path.join(require('node:os').tmpdir(),'codebolt-desktop-missing-'));
  let created=false;
  const {service}=fixture({desktopSandboxTemplate:''},{desktop:{create:async()=>{created=true;}}});
  service.screenAccessEnabled=true;service.state.projectPath=rootDir;
  service.getPersistedResourceId=()=>undefined;
  try {
    await assert.rejects(service.setupEnvironment({environmentName:'test'}),/desktopSandboxTemplate/);
    assert.equal(created,false);
  } finally {fs.rmSync(rootDir,{recursive:true,force:true});}
});


test('reuses a running desktop stream and explicitly enables user input on every session', async () => {
  const {service}=fixture();let starts=0;
  service.screenAccessEnabled=true;
  service.sandbox={stream:{start:async()=>{starts++;throw new Error('Stream is already running');},getUrl:()=> 'https://desktop.example.test/vnc.html?view_only=true'}};
  const results=await Promise.all([service.onProviderScreenSession(),service.onProviderScreenSession()]);
  assert.equal(starts,1);
  for(const result of results){const url=new URL(result.url);assert.equal(url.searchParams.get('view_only'),'false');assert.equal(url.searchParams.get('autoconnect'),'true');assert.equal(url.searchParams.get('resize'),'scale');}
  await service.onProviderScreenSession();assert.equal(starts,2);
});

test('attaches to an existing stream when a reconnected SDK has no cached viewer URL', async () => {
  const {service}=fixture();service.screenAccessEnabled=true;
  service.sandbox={getHost:port=>`${port}-sandbox.example.test`,stream:{start:async()=>{throw new Error('Stream is already running');},getUrl:()=>{throw new Error('Server is not running');}}};
  const result=await service.onProviderScreenSession();
  assert.equal(new URL(result.url).host,'6080-sandbox.example.test');
  assert.equal(new URL(result.url).searchParams.get('view_only'),'false');
});

test('does not hide genuine desktop stream startup failures', async () => {
  const {service}=fixture();service.screenAccessEnabled=true;
  service.sandbox={stream:{start:async()=>{throw new Error('noVNC startup failed');},getUrl:()=> 'https://desktop.example.test'}};
  await assert.rejects(service.onProviderScreenSession(),/noVNC startup failed/);
});

test('SDK owns the only PR response even when the raw hook receives the same request', async () => {
  const { service } = fixture();
  let calls = 0;
  service.onSendPR = async () => { calls++; return { snapshotId: 'fresh' }; };
  const handlers = new Map();
  const codebolt = new Proxy({}, { get: (_, name) => callback => handlers.set(name, callback) });
  service.getEventHandlers = () => ({ onRawMessage: service.onRawMessage.bind(service) });
  const filename = path.join(root, 'src/index.ts');
  const mod = new Module(filename, module);
  mod.require = name => {
    if (name === '@codebolt/codeboltjs') return { __esModule: true, default: codebolt };
    if (name === './services/E2bRemoteProviderService') return { E2bRemoteProviderService: class { constructor() { return service; } } };
    throw new Error(`Unexpected import: ${name}`);
  };
  mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText, filename);
  service.agentServer.isConnected = false;
  await Promise.all([handlers.get('onRawMessage')({ type: 'providerSendPR' }), handlers.get('onSendPR')()]);
  assert.equal(calls, 1);
  assert.equal(service.forwarded.length, 0);
});

function narrativeReview(t, { snapshot = 'fresh', exported = 'fresh', bytes = Buffer.from([0, 1, 255, 34]), size = bytes.length } = {}) {
  const { service } = fixture();
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'e2b-review-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  service.lastInitVars = { syncMode: 'workspace_sync', snapshotId: 'original-base', narrativeContext: { agent_run_id: 'run-1' } };
  service.state.environmentName = 'review-environment';
  const requests = [], commands = [], downloads = [];
  service.sendNarrativeRequest = async (type, payload) => {
    requests.push({ type, ...payload });
    return type === 'narrative.createSnapshot' ? { snapshot_id: snapshot } : {
      snapshotId: exported, baseSnapshotId: null, bundlePath: "/tmp/review archive's.tar.gz", narrativeSummary: {},
    };
  };
  service.sandbox = {
    commands: { run: async (command, options) => { commands.push({ command, options }); return { stdout: String(size) }; } },
    files: { read: async (filename, options) => {
      downloads.push({ filename, options });
      return new ReadableStream({ start(controller) {
        for (let i = 0; i < bytes.length; i += 2) controller.enqueue(bytes.subarray(i, i + 2));
        controller.close();
      } });
    } },
  };
  return { service, directory, bytes, requests, commands, downloads };
}

test('exports current workspace once with the original base and portable bytes', async t => {
  const f = narrativeReview(t);
  const [first, second] = await Promise.all([f.service.onSendPR(), f.service.onSendPR()]);
  assert.deepEqual(first, second);
  assert.equal(f.requests.length, 2);
  assert.equal(f.requests[1].snapshotId, 'fresh');
  assert.equal(f.requests[1].baseSnapshotId, 'original-base');
  assert.equal(first.baseSnapshotId, 'original-base');
  assert.equal(first.mergeConfig.workspaceSync.snapshotId, 'fresh');
  assert.equal(first.snapshotId, 'fresh');
  assert.deepEqual(Buffer.from(first.bundleData, 'base64'), f.bytes);
  assert.equal(first.narrativeContext.agent_run_id, 'run-1');
  assert.equal(f.downloads[0].options.format, 'stream');
  assert.ok(f.downloads[0].options.streamIdleTimeoutMs > 0);
  assert.ok(!f.commands.some(({command}) => command.includes('base64')));
  assert.equal(first.bundlePath, undefined);
});

test('refuses to substitute an old startup snapshot for a failed fresh snapshot', async t => {
  const f = narrativeReview(t, { snapshot: undefined });
  // An explicitly absent response must not use the fixture default.
  f.service.sendNarrativeRequest = async type => { f.requests.push(type); return {}; };
  await assert.rejects(f.service.onSendPR(), /Fresh workspace snapshot/);
  assert.deepEqual(f.requests, ['narrative.createSnapshot']);
  assert.equal(f.downloads.length, 0);
});

test('refuses a bundle for a different snapshot', async t => {
  const f = narrativeReview(t, { exported: 'old-snapshot' });
  await assert.rejects(f.service.onSendPR(), /does not match the fresh/);
  assert.equal(f.downloads.length, 0);
});

test('does not publish truncated downloads and preserves an existing destination', async t => {
  const f = narrativeReview(t, { size: 500 });
  const target = path.join(f.directory, 'bundle.tar.gz');
  fs.writeFileSync(target, 'previous');
  await assert.rejects(f.service.downloadFileFromSandbox('/tmp/archive.tar.gz', target), /size mismatch/);
  assert.equal(fs.readFileSync(target, 'utf8'), 'previous');
  assert.deepEqual(fs.readdirSync(f.directory), ['bundle.tar.gz']);
});

// Persisted environments can still carry the old GitHub review configuration.
// All of them must return portable narrative data without requiring a Git remote.
for (const config of [
  {},
  { syncMode: 'git' },
  { syncMode: 'workspace_sync' },
  { syncMode: 'git', rmrSourceType: 'git', gitTransport: 'github_pr' },
]) {
  test(`uses narrative review export for ${JSON.stringify(config)}`, async t => {
    const f = narrativeReview(t);
    Object.assign(f.service.lastInitVars, config);
    // The helper's default should not override the unspecified-mode case.
    if (!config.syncMode) delete f.service.lastInitVars.syncMode;
    const result = await f.service.onSendPR();
    assert.equal(result.rmrSourceType, 'workspace_sync');
    assert.equal(result.mergeConfig.strategy, 'workspace_sync');
    assert.equal(result.externalPrUrl, undefined);
    assert.equal(result.mergeConfig.git, undefined);
    assert.deepEqual(f.requests.map(request => request.type), [
      'narrative.createSnapshot', 'narrative.exportUnifiedBundle',
    ]);
    assert.ok(f.commands.every(({command}) => !/\bgit\b|github/.test(command)));
    const preview = f.service.getProspectivePath({ ...config, projectName: 'review' });
    assert.equal(preview.rmrSourceType, 'workspace_sync');
    assert.equal(preview.defaultRmrSourceType, 'workspace_sync');
    assert.equal(preview.mergeStrategy, 'workspace_sync');
    assert.deepEqual(preview.supportedRmrSourceTypes, ['workspace_sync']);
    assert.equal(preview.rmrPolicy.createsExternalPullRequest, false);
  });
}

test('manifests advertise narrative review independently of initial Git sync', () => {
  for (const manifest of ['providers.yaml', 'codeboltprovider.yaml']) {
    const content = fs.readFileSync(path.join(root, manifest), 'utf8');
    assert.match(content, /defaultRmrSourceType: workspace_sync/);
    assert.doesNotMatch(content, /github_pr/);
    assert.match(content, /syncModes:\n    - git\n    - workspace_sync/);
    assert.match(content, /rmrSourceTypes:\n    - workspace_sync/);
  }
});

// The API request ID correlates startup; params.messageId identifies the user
// message already stored by the host and must survive the sandbox round trip.
for (const location of ['body', 'envelope', 'wrapper']) {
  test(`preserves the host message ID from the ${location}`, async () => {
    const { service, socket } = fixture();
    const input = turn();
    if (location === 'body') input.message.messageId = 'host-user-message';
    else input.messageId = 'host-user-message';
    await service.onProviderAgentStart(location === 'wrapper' ? { userMessage: input } : input);
    assert.equal(socket.sent.length, 1);
    assert.equal(socket.sent[0].params.messageId, 'host-user-message');
    assert.equal(socket.sent[0].message.messageId, 'host-user-message');
    assert.notEqual(socket.sent[0].requestId, 'host-user-message');
  });
}

test('does not forward the SDK-owned providerAgentStart request through the raw hook', async () => {
  const { service, socket } = fixture();
  const input = turn();
  input.message.messageId = 'first-user-message';
  await Promise.all([
    service.onRawMessage({ type: 'providerAgentStart', userMessage: input }),
    service.onProviderAgentStart(input),
  ]);
  assert.equal(socket.sent.length, 1);
  assert.equal(socket.sent[0].type, 'threadEvent');
  assert.equal(socket.sent[0].params.messageId, 'first-user-message');
});

test('keeps separate turns with identical text as distinct user messages', async () => {
  const { service, socket } = fixture();
  for (const messageId of ['first-user-message', 'second-user-message']) {
    const input = turn(); input.message.messageId = messageId;
    await service.onProviderAgentStart(input);
  }
  assert.equal(socket.sent.length, 2);
  assert.deepEqual(socket.sent.map(request => request.params.messageId), ['first-user-message', 'second-user-message']);
});
