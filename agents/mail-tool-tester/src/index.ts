/* MAIL_TOOL_TESTER_LEGACY_SMOKE_RUNNER_DISABLED
import codebolt from '@codebolt/codeboltjs';
import { FlatUserMessage } from '@codebolt/types/sdk';

type MailToolName = typeof MAIL_TOOL_NAMES[number];

type ToolResultRecord = {
  toolName: MailToolName;
  ok: boolean;
  details: string;
};

type RuntimeState = {
  runId: string;
  senderAgentId: string;
  recipientAgentId: string;
  threadId?: string;
  alternateThreadId?: string;
  messageId?: string;
  reservedFile: string;
};

const MAIL_TOOL_NAMES = [
  'mail_register_agent',
  'mail_list_agents',
  'mail_get_agent',
  'mail_create_thread',
  'mail_find_or_create_thread',
  'mail_list_threads',
  'mail_get_thread',
  'mail_update_thread_status',
  'mail_archive_thread',
  'mail_fetch_inbox',
  'mail_send_message',
  'mail_reply_message',
  'mail_get_message',
  'mail_get_messages',
  'mail_mark_read',
  'mail_acknowledge',
  'mail_search',
  'mail_summarize_thread',
  'mail_reserve_files',
  'mail_release_files',
  'mail_force_reserve_files',
  'mail_list_reservations',
  'mail_check_conflicts',
] as const;

function createRunId(): string {
  return new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
}

function unwrapResponsePayload(response: unknown): unknown {
  if (!response || typeof response !== 'object') {
    return response;
  }

  const responseRecord = response as Record<string, unknown>;
  if (responseRecord.payload && typeof responseRecord.payload === 'object') {
    return responseRecord.payload;
  }

  return response;
}

function assertSuccessfulPayload(payload: unknown): void {
  if (!payload || typeof payload !== 'object') {
    return;
  }

  const payloadRecord = payload as Record<string, unknown>;
  if (payloadRecord.error) {
    throw new Error(String(payloadRecord.error));
  }

  if (payloadRecord.success === false) {
    throw new Error(JSON.stringify(payloadRecord));
  }
}

function findStringByKey(value: unknown, keyMatchers: string[]): string | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const nestedMatch = findStringByKey(item, keyMatchers);
      if (nestedMatch) {
        return nestedMatch;
      }
    }
    return undefined;
  }

  const record = value as Record<string, unknown>;
  for (const [key, propertyValue] of Object.entries(record)) {
    if (typeof propertyValue === 'string' && keyMatchers.includes(key.toLowerCase())) {
      return propertyValue;
    }
  }

  for (const propertyValue of Object.values(record)) {
    const nestedMatch = findStringByKey(propertyValue, keyMatchers);
    if (nestedMatch) {
      return nestedMatch;
    }
  }

  return undefined;
}

function summarizePayload(value: unknown): string {
  const payload = unwrapResponsePayload(value);

  if (!payload) {
    return 'No payload returned';
  }

  if (typeof payload === 'string') {
    return payload.slice(0, 180);
  }

  if (Array.isArray(payload)) {
    return `Returned array(${payload.length})`;
  }

  if (typeof payload === 'object') {
    const keys = Object.keys(payload as Record<string, unknown>).slice(0, 8);
    return `Returned object keys: ${keys.join(', ') || '(none)'}`;
  }

  return String(payload);
}

async function recordToolResult(
  results: ToolResultRecord[],
  toolName: MailToolName,
  action: () => Promise<unknown>,
  onSuccess?: (payload: unknown) => void,
): Promise<void> {
  try {
    const rawResponse = await action();
    const payload = unwrapResponsePayload(rawResponse);
    assertSuccessfulPayload(payload);
    onSuccess?.(payload);
    results.push({
      toolName,
      ok: true,
      details: summarizePayload(payload),
    });
  } catch (error) {
    results.push({
      toolName,
      ok: false,
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

function createRuntimeState(): RuntimeState {
  const runId = createRunId();

  return {
    runId,
    senderAgentId: `mail-tool-tester-sender-${runId}`,
    recipientAgentId: `mail-tool-tester-recipient-${runId}`,
    reservedFile: `.codebolt/mail-tool-tester-${runId}.txt`,
  };
}

async function runMailToolSmokeTest(): Promise<ToolResultRecord[]> {
  const state = createRuntimeState();
  const results: ToolResultRecord[] = [];
  const mailApi = codebolt.mail as any;

  await recordToolResult(results, 'mail_register_agent', async () => {
    const senderResponse = await mailApi.registerAgent({
      id: state.senderAgentId,
      name: 'Mail Tool Tester Sender',
      program: 'mail-tool-tester',
      model: 'static-agent',
    });
    assertSuccessfulPayload(unwrapResponsePayload(senderResponse));

    const recipientResponse = await mailApi.registerAgent({
      id: state.recipientAgentId,
      name: 'Mail Tool Tester Recipient',
      program: 'mail-tool-tester',
      model: 'static-agent',
    });
    assertSuccessfulPayload(unwrapResponsePayload(recipientResponse));

    return recipientResponse;
  });

  await recordToolResult(results, 'mail_list_agents', () => mailApi.listAgents());

  await recordToolResult(results, 'mail_get_agent', () => mailApi.getAgent({
    agentId: state.senderAgentId,
  }));

  await recordToolResult(results, 'mail_create_thread', () => mailApi.createThread({
    subject: `Mail tool smoke test ${state.runId}`,
    participants: [state.senderAgentId, state.recipientAgentId],
    type: 'agent-to-agent',
    metadata: { runId: state.runId, source: 'mail-tool-tester' },
  }), (payload) => {
    state.threadId = findStringByKey(payload, ['threadid', 'id']);
  });

  await recordToolResult(results, 'mail_find_or_create_thread', () => mailApi.findOrCreateThread({
    subject: `Mail tool smoke test find-or-create ${state.runId}`,
    participants: [state.senderAgentId, state.recipientAgentId],
    type: 'agent-to-agent',
    metadata: { runId: state.runId, source: 'mail-tool-tester' },
  }), (payload) => {
    state.alternateThreadId = findStringByKey(payload, ['threadid', 'id']);
  });

  await recordToolResult(results, 'mail_list_threads', () => mailApi.listThreads({
    participant: state.senderAgentId,
    search: state.runId,
    limit: 10,
    offset: 0,
  }));

  if (state.threadId) {
    await recordToolResult(results, 'mail_get_thread', () => mailApi.getThread({
      threadId: state.threadId,
    }));
  } else {
    results.push({ toolName: 'mail_get_thread', ok: false, details: 'Skipped because mail_create_thread returned no thread id' });
  }

  await recordToolResult(results, 'mail_send_message', () => mailApi.sendMessage({
    threadId: state.threadId,
    senderId: state.senderAgentId,
    senderName: 'Mail Tool Tester Sender',
    recipients: [
      {
        address: `subagent:${state.recipientAgentId}`,
        label: 'Mail Tool Tester Recipient',
      },
    ],
    subject: `Mail tool smoke test message ${state.runId}`,
    body: `Smoke test message for run ${state.runId}`,
    importance: 'normal',
    ackRequired: true,
    fileReferences: [state.reservedFile],
  }), (payload) => {
    state.messageId = findStringByKey(payload, ['messageid', 'id']);
    state.threadId = state.threadId ?? findStringByKey(payload, ['threadid']);
  });

  if (state.messageId) {
    await recordToolResult(results, 'mail_reply_message', () => mailApi.replyMessage({
      messageId: state.messageId,
      senderId: state.recipientAgentId,
      senderName: 'Mail Tool Tester Recipient',
      body: `Smoke test reply for run ${state.runId}`,
      fileReferences: [state.reservedFile],
    }));

    await recordToolResult(results, 'mail_get_message', () => mailApi.getMessage({
      messageId: state.messageId,
    }));

    await recordToolResult(results, 'mail_mark_read', () => mailApi.markRead({
      messageId: state.messageId,
      agentId: state.recipientAgentId,
    }));

    await recordToolResult(results, 'mail_acknowledge', () => mailApi.acknowledge({
      messageId: state.messageId,
      agentId: state.recipientAgentId,
    }));
  } else {
    for (const skippedToolName of ['mail_reply_message', 'mail_get_message', 'mail_mark_read', 'mail_acknowledge'] as const) {
      results.push({ toolName: skippedToolName, ok: false, details: 'Skipped because mail_send_message returned no message id' });
    }
  }

  if (state.threadId) {
    await recordToolResult(results, 'mail_get_messages', () => mailApi.getMessages({
      threadId: state.threadId,
    }));

    await recordToolResult(results, 'mail_summarize_thread', () => mailApi.summarizeThread({
      threadId: state.threadId,
      maxMessages: 10,
    }));

    await recordToolResult(results, 'mail_update_thread_status', () => mailApi.updateThreadStatus({
      threadId: state.threadId,
      status: 'open',
    }));
  } else {
    for (const skippedToolName of ['mail_get_messages', 'mail_summarize_thread', 'mail_update_thread_status'] as const) {
      results.push({ toolName: skippedToolName, ok: false, details: 'Skipped because no thread id is available' });
    }
  }

  await recordToolResult(results, 'mail_fetch_inbox', () => mailApi.fetchInbox({
    agentId: state.recipientAgentId,
    unreadOnly: false,
    limit: 10,
    offset: 0,
  }));

  await recordToolResult(results, 'mail_search', () => mailApi.search({
    query: state.runId,
    agentId: state.recipientAgentId,
    threadId: state.threadId,
    limit: 10,
  }));

  await recordToolResult(results, 'mail_check_conflicts', () => mailApi.checkConflicts({
    agentId: state.senderAgentId,
    paths: [state.reservedFile],
  }));

  await recordToolResult(results, 'mail_reserve_files', () => mailApi.reserveFiles({
    agentId: state.senderAgentId,
    paths: [state.reservedFile],
    exclusive: true,
    ttlSeconds: 300,
    reason: `Mail tool smoke test ${state.runId}`,
  }));

  await recordToolResult(results, 'mail_list_reservations', () => mailApi.listReservations({
    agentId: state.senderAgentId,
  }));

  await recordToolResult(results, 'mail_release_files', async () => {
    const senderReleaseResponse = await mailApi.releaseFiles({
      agentId: state.senderAgentId,
      paths: [state.reservedFile],
    });
    assertSuccessfulPayload(unwrapResponsePayload(senderReleaseResponse));

    return senderReleaseResponse;
  });

  await recordToolResult(results, 'mail_force_reserve_files', () => mailApi.forceReserveFiles({
    agentId: state.recipientAgentId,
    paths: [state.reservedFile],
    reason: `Mail tool force reservation smoke test ${state.runId}`,
  }));

  try {
    await mailApi.releaseFiles({
      agentId: state.recipientAgentId,
      paths: [state.reservedFile],
    });
  } catch (_error) {
    // Cleanup is best effort and should not create a second mail_release_files row.
  }

  if (state.threadId) {
    await recordToolResult(results, 'mail_archive_thread', () => mailApi.archiveThread({
      threadId: state.threadId,
    }));
  } else {
    results.push({ toolName: 'mail_archive_thread', ok: false, details: 'Skipped because no thread id is available' });
  }

  return results;
}

function formatResults(results: ToolResultRecord[]): string {
  const passedCount = results.filter((result) => result.ok).length;
  const failedCount = results.length - passedCount;
  const uniqueTestedToolNames = new Set(results.map((result) => result.toolName));
  const missingToolNames = MAIL_TOOL_NAMES.filter((toolName) => !uniqueTestedToolNames.has(toolName));

  const resultLines = results.map((result) => {
    const status = result.ok ? 'PASS' : 'FAIL';
    return `| ${status} | ${result.toolName} | ${result.details.replace(/\n/g, ' ').slice(0, 220)} |`;
  });

  const missingLine = missingToolNames.length > 0
    ? `\n\nMissing tools: ${missingToolNames.join(', ')}`
    : '';

  return [
    `Mail tool smoke test complete: ${passedCount} passed, ${failedCount} failed.`,
    '',
    '| Status | Tool | Details |',
    '| --- | --- | --- |',
    ...resultLines,
    missingLine,
  ].join('\n');
}

codebolt.onMessage(async (_reqMessage: FlatUserMessage) => {
  try {
    await codebolt.chat.sendMessage('Starting mail tool smoke test.');
    const results = await runMailToolSmokeTest();
    const report = formatResults(results);

    await codebolt.chat.sendMessage(report);
    codebolt.notify.chat.AgentTextResponseNotify(report, results.some((result) => !result.ok));

    return {
      success: results.every((result) => result.ok),
      results,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await codebolt.chat.sendMessage(`Mail tool smoke test failed before completion: ${message}`);
    codebolt.notify.chat.AgentTextResponseNotify(`Mail tool smoke test failed: ${message}`, true);

    return {
      success: false,
      error: message,
    };
  }
});

*/

// MAIL_TOOL_TESTER_MANIFEST_ONLY_RUNNER
import codebolt from '@codebolt/codeboltjs';
import { FlatUserMessage } from '@codebolt/types/sdk';

const MANIFEST_TOOL_NAME = 'get_available_tools_manifest';
const MANIFEST_TOOL_ARGUMENTS = {
  mode: 'details',
  pattern: 'mail_send_message',
  explanation: 'Getting the schema details for mail_send_message to send the user confirmation.',
};

function stringifyForReport(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch (_error) {
    return String(value);
  }
}

codebolt.onMessage(async (_reqMessage: FlatUserMessage) => {
  await codebolt.chat.sendMessage(
    'Testing ' + MANIFEST_TOOL_NAME + ' with ' + JSON.stringify(MANIFEST_TOOL_ARGUMENTS),
  );

  try {
    const response = await codebolt.mcp.executeTool(
      'codebolt',
      MANIFEST_TOOL_NAME,
      MANIFEST_TOOL_ARGUMENTS,
    );

    const report = [
      'Manifest tool test completed.',
      '',
      '```json',
      stringifyForReport(response),
      '```',
    ].join('\n');

    await codebolt.chat.sendMessage(report);
    codebolt.notify.chat.AgentTextResponseNotify(report, false);

    return {
      success: true,
      toolName: MANIFEST_TOOL_NAME,
      arguments: MANIFEST_TOOL_ARGUMENTS,
      response,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const report = 'Manifest tool test failed: ' + message;

    await codebolt.chat.sendMessage(report);
    codebolt.notify.chat.AgentTextResponseNotify(report, true);

    return {
      success: false,
      toolName: MANIFEST_TOOL_NAME,
      arguments: MANIFEST_TOOL_ARGUMENTS,
      error: message,
    };
  }
});
