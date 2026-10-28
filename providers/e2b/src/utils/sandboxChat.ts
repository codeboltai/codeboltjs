import { randomUUID } from 'crypto';
import type WebSocket from 'ws';

/** Convert a host turn into the thread-start API accepted by the generic gateway. */
export function prepareSandboxChatMessage(input: Record<string, any>, workspacePath: string): Record<string, any> {
  const envelope = input.userMessage && typeof input.userMessage === 'object' ? input.userMessage : input;
  const body = envelope.message && typeof envelope.message === 'object' ? envelope.message : envelope;
  const threadId = envelope.threadId || body.threadId || input.threadId;
  const params = {
    ...envelope,
    ...body,
    projectPath: workspacePath,
    ...(threadId ? { threadId } : {}),
    userMessage: body.userMessage || body.text || envelope.text || '',
    selectedAgent: body.selectedAgent || envelope.selectedAgent,
    reuseThreadId: Boolean(threadId),
    executionMode: 'background_scoped',
    waitForCompletion: false,
  };
  if (typeof params.userMessage !== 'string' || !params.userMessage.trim()) {
    throw new Error('Cannot start sandbox agent without a user message');
  }
  // These identify the route from the host to this sandbox. Keeping them would
  // route the turn back out instead of executing it in the sandbox.
  for (const key of [
    'environment', 'isRemoteTask', 'remoteEnv', 'environmentProvider', 'providerConfig',
    'targetRuntimeId', 'runtimeId', 'cloudRuntimeId', 'targetRuntimeProviderId',
    'parentRuntimeId', 'parentEnvironmentId', 'parentProjectPath',
    'archivePath', 'snapshotId', 'narrativeBundlePath',
    'environmentPath', 'requestedPath', 'resolvedPath', 'workspacePath',
    'type', 'action', 'requestId', 'message', 'data', 'payload',
    'execution_mode', 'callerThreadId', 'callerAgentId', 'parentId',
    'agentInstanceId', 'parentAgentInstanceId',
  ]) {
    delete (params as Record<string, any>)[key];
  }
  const requestId = randomUUID();
  // Keep the reused thread in params: the API treats a top-level threadId as
  // a caller/parent thread, which would make this thread its own parent.
  return {
    type: 'threadEvent', action: 'createAndStartThread',
    requestId, messageId: requestId, timestamp: new Date().toISOString(), params,
    // Existing E2B templates read finalMessage.message before dispatching. Keep
    // both bodies identical so those templates and the current API can start.
    message: params,
  };
}

/** A successful socket write is not an agent-start acknowledgement. */
export function requestSandboxAgentStart(
  socket: Pick<WebSocket, 'on' | 'off' | 'send'>,
  request: Record<string, any>,
  timeoutMs = 120_000,
): Promise<Record<string, any>> {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timeout);
      socket.off('message', onMessage);
      socket.off('close', onClose);
      socket.off('error', onError);
    };
    const fail = (error: Error) => { cleanup(); reject(error); };
    const onClose = () => fail(new Error('CodeBolt gateway disconnected before sandbox agent startup was confirmed'));
    const onError = (error: Error) => fail(error);
    const onMessage = (raw: any) => {
      let response: any;
      try { response = JSON.parse(raw.toString()); } catch { return; }
      if (!response) return;
      // Legacy runtimes send this dispatch acknowledgement immediately, but
      // defer startThreadResponse until the whole task completes. Match both
      // thread and agent; unrelated chat traffic is not an acknowledgement.
      const expectedAgentId = request.params.selectedAgent?.id || request.params.selectedAgent?.agentId;
      if (response.type === 'ThreadAgentStarted' && request.params.threadId && expectedAgentId &&
        response.threadId === request.params.threadId && response.agentId === expectedAgentId) {
        cleanup();
        resolve({ ...response, success: true });
        return;
      }
      const notification = ['executionGateway.notification', 'executionNotification'].includes(response.type);
      // Older gateways correlate notifications through the original request;
      // their result (and the direct response) may have no correlation fields.
      const correlation = notification ? response.originalMessage : response;
      if (!correlation || !(
        (request.requestId && correlation.requestId === request.requestId) ||
        (request.messageId && correlation.messageId === request.messageId)
      )) return;
      if (notification) response = response.result;
      if (!response) return;
      if (!['startThreadResponse', 'errorResponse', 'externalError'].includes(response.type)) return;
      if (response.type !== 'startThreadResponse' || response.success !== true || response.error) {
        fail(new Error(response.error || 'Sandbox agent failed to start'));
        return;
      }
      if (request.params.threadId && response.threadId !== request.params.threadId) {
        fail(new Error('Sandbox agent startup response returned an unexpected thread ID'));
        return;
      }
      cleanup();
      resolve(response);
    };
    const timeout = setTimeout(() => fail(new Error(`Timeout waiting for sandbox startThreadResponse after ${timeoutMs}ms`)), timeoutMs);
    socket.on('message', onMessage);
    socket.on('close', onClose);
    socket.on('error', onError);
    try {
      socket.send(JSON.stringify(request), (error) => { if (error) fail(error); });
    } catch (error) {
      fail(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

/** Rebase paths in copied JSON settings so sandbox services never use the host root. */
export function rebaseSandboxSettings(content: string, hostRoot: string, sandboxRoot: string): string {
  const local = hostRoot.replace(/\/+$/, '');
  const remote = sandboxRoot.replace(/\/+$/, '');
  return JSON.stringify(JSON.parse(content), (_key, value) => {
    if (typeof value === 'string' && (value === local || value.startsWith(`${local}/`))) {
      return `${remote}${value.slice(local.length)}`;
    }
    return value;
  });
}

/** The sandbox has one project, even when the host's active profile points elsewhere. */
export function prepareSandboxGlobalSettings(content: string, hostRoot: string, sandboxRoot: string): string {
  const settings = JSON.parse(rebaseSandboxSettings(content, hostRoot, sandboxRoot));
  if (Array.isArray(settings.codebolt_users)) {
    settings.codebolt_users = settings.codebolt_users.map((user: Record<string, any>) => ({
      ...user, active_project_path: sandboxRoot,
    }));
  }
  return JSON.stringify(settings);
}
