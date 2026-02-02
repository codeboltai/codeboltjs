import { CodeboltModule, param, fn } from './types';

export const orchestratorModule: CodeboltModule = {
  name: 'orchestrator',
  displayName: 'Orchestrator',
  description: 'Orchestrator management',
  category: 'orchestration',
  functions: [
    fn('listOrchestrators', 'Lists orchestrators', [], 'OrchestratorListResponse'),
    fn('getOrchestrator', 'Gets orchestrator', [
      param('orchestratorId', 'string', true, 'Orchestrator ID'),
    ], 'OrchestratorResponse'),
    fn('getOrchestratorSettings', 'Gets orchestrator settings', [
      param('orchestratorId', 'string', true, 'Orchestrator ID'),
    ], 'SettingsResponse'),
    fn('createOrchestrator', 'Creates orchestrator', [
      param('data', 'object', true, 'Orchestrator data'),
    ], 'OrchestratorResponse'),
    fn('updateOrchestrator', 'Updates orchestrator', [
      param('orchestratorId', 'string', true, 'Orchestrator ID'),
      param('data', 'object', true, 'Update data'),
    ], 'OrchestratorResponse'),
    fn('updateOrchestratorSettings', 'Updates settings', [
      param('orchestratorId', 'string', true, 'Orchestrator ID'),
      param('settings', 'object', true, 'Settings data'),
    ], 'SettingsResponse'),
    fn('deleteOrchestrator', 'Deletes orchestrator', [
      param('orchestratorId', 'string', true, 'Orchestrator ID'),
    ], 'DeleteResponse'),
    fn('updateOrchestratorStatus', 'Updates status', [
      param('orchestratorId', 'string', true, 'Orchestrator ID'),
      param('status', 'string', true, 'New status'),
    ], 'OrchestratorResponse'),
    fn('updateCodeboltJs', 'Initiates CodeboltJS update', [], 'UpdateResponse'),
  ],
};

export const backgroundChildThreadsModule: CodeboltModule = {
  name: 'backgroundChildThreads',
  displayName: 'Background Child Threads',
  description: 'Background agent thread tracking',
  category: 'orchestration',
  functions: [
    fn('addRunningAgent', 'Adds running agent', [
      param('threadId', 'string', true, 'Thread ID'),
      param('data', 'object', true, 'Agent data'),
      param('groupId', 'string', false, 'Group ID'),
    ], 'AddAgentResponse'),
    fn('getRunningAgentCount', 'Gets running agent count', [], 'CountResponse'),
    fn('checkForBackgroundAgentCompletion', 'Checks for completion', [], 'CompletionResponse'),
    fn('onBackgroundAgentCompletion', 'Waits for completion', [], 'CompletionResponse'),
    fn('checkForBackgroundGroupedAgentCompletion', 'Checks for grouped completion', [], 'GroupedCompletionResponse'),
    fn('onBackgroundGroupedAgentCompletion', 'Waits for grouped completion', [], 'GroupedCompletionResponse'),
    fn('waitForAnyExternalEvent', 'Waits for any external event', [], 'ExternalEventResponse'),
  ],
};

export const threadModule: CodeboltModule = {
  name: 'thread',
  displayName: 'Thread',
  description: 'Thread/conversation management',
  category: 'orchestration',
  functions: [
    fn('createThread', 'Creates a thread', [
      param('agentId', 'string', true, 'Agent ID'),
      param('title', 'string', false, 'Thread title'),
      param('metadata', 'object', false, 'Thread metadata'),
    ], 'ThreadResponse'),
    fn('createAndStartThread', 'Creates and starts thread', [
      param('agentId', 'string', true, 'Agent ID'),
      param('task', 'string', true, 'Task description'),
      param('title', 'string', false, 'Thread title'),
    ], 'ThreadResponse'),
    fn('createThreadInBackground', 'Creates thread in background', [
      param('agentId', 'string', true, 'Agent ID'),
      param('task', 'string', true, 'Task description'),
      param('title', 'string', false, 'Thread title'),
    ], 'ThreadResponse'),
    fn('getThreadList', 'Gets thread list', [
      param('options', 'object', false, 'Filter options'),
    ], 'ThreadListResponse'),
    fn('getThreadDetail', 'Gets thread details', [
      param('threadId', 'string', true, 'Thread ID'),
    ], 'ThreadResponse'),
    fn('startThread', 'Starts a thread', [
      param('threadId', 'string', true, 'Thread ID'),
    ], 'ThreadResponse'),
    fn('updateThread', 'Updates a thread', [
      param('threadId', 'string', true, 'Thread ID'),
      param('updates', 'object', true, 'Update data'),
    ], 'ThreadResponse'),
    fn('deleteThread', 'Deletes a thread', [
      param('threadId', 'string', true, 'Thread ID'),
    ], 'DeleteResponse'),
    fn('updateThreadStatus', 'Updates thread status', [
      param('threadId', 'string', true, 'Thread ID'),
      param('status', 'string', true, 'New status'),
    ], 'ThreadResponse'),
    fn('getThreadMessages', 'Gets thread messages', [
      param('threadId', 'string', true, 'Thread ID'),
      param('limit', 'number', false, 'Message limit'),
    ], 'MessagesResponse'),
    fn('getThreadFileChanges', 'Gets file changes', [
      param('threadId', 'string', true, 'Thread ID'),
    ], 'FileChangesResponse'),
    fn('getThreadFileChangesSummary', 'Gets changes summary', [
      param('threadId', 'string', true, 'Thread ID'),
    ], 'SummaryResponse'),
  ],
};
