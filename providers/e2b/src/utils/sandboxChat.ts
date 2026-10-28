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
      if (!response || (response.requestId !== request.requestId && response.messageId !== request.messageId)) return;
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
