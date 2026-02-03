import { CodeboltModule, param, fn } from './types';

export const chatModule: CodeboltModule = {
  name: 'chat',
  displayName: 'Chat',
  description: 'Chat communication and user interaction',
  category: 'communication',
  functions: [
    fn('getChatHistory', 'Gets chat history', [
      param('threadId', 'string', true, 'Thread ID'),
    ], 'ChatHistoryResponse'),
    fn('setRequestHandler', 'Sets request handler', [
      param('handler', 'object', true, 'Request handler function'),
    ], 'void'),
    fn('sendMessage', 'Sends a message', [
      param('message', 'string', true, 'Message content'),
      param('payload', 'object', false, 'Additional payload'),
    ], 'SendMessageResponse'),
    fn('waitforReply', 'Waits for reply', [
      param('message', 'string', true, 'Message to wait for reply'),
    ], 'ReplyResponse'),
    fn('processStarted', 'Notifies process started', [
      param('onStopClicked', 'object', false, 'Stop callback function'),
    ], 'void'),
    fn('stopProcess', 'Stops the process', [], 'void'),
    fn('processFinished', 'Notifies process finished', [], 'void'),
    fn('sendConfirmationRequest', 'Sends confirmation request', [
      param('confirmationMessage', 'string', true, 'Confirmation message'),
      param('buttons', 'array', false, 'Button options'),
      param('withFeedback', 'boolean', false, 'Include feedback option', false),
    ], 'ConfirmationResponse'),
    fn('askQuestion', 'Asks a question', [
      param('question', 'string', true, 'Question to ask'),
      param('buttons', 'array', false, 'Button options'),
      param('withFeedback', 'boolean', false, 'Include feedback option', false),
    ], 'QuestionResponse'),
    fn('sendNotificationEvent', 'Sends notification event', [
      param('notificationMessage', 'string', true, 'Notification message'),
      param('type', 'string', true, 'Notification type'),
    ], 'void'),
    fn('checkForSteeringMessage', 'Checks for steering messages', [], 'SteeringMessageResponse'),
    fn('onSteeringMessageReceived', 'Waits for steering message', [], 'SteeringMessageResponse'),
  ],
};

export const mailModule: CodeboltModule = {
  name: 'mail',
  displayName: 'Mail',
  description: 'Agent mail/messaging system',
  category: 'communication',
  functions: [
    fn('registerAgent', 'Registers an agent', [
      param('agentId', 'string', true, 'Agent ID'),
      param('name', 'string', true, 'Agent name'),
      param('capabilities', 'array', false, 'Agent capabilities'),
    ], 'RegisterAgentResponse'),
    fn('listAgents', 'Lists all agents', [], 'AgentListResponse'),
    fn('getAgent', 'Gets agent details', [
      param('agentId', 'string', true, 'Agent ID'),
    ], 'AgentResponse'),
    fn('createThread', 'Creates a mail thread', [
      param('subject', 'string', true, 'Thread subject'),
      param('participants', 'array', true, 'Participant agent IDs'),
    ], 'ThreadResponse'),
    fn('findOrCreateThread', 'Finds or creates a thread', [
      param('subject', 'string', true, 'Thread subject'),
      param('participants', 'array', true, 'Participant agent IDs'),
    ], 'ThreadResponse'),
    fn('listThreads', 'Lists mail threads', [
      param('filters', 'object', false, 'Filter options'),
    ], 'ThreadListResponse'),
    fn('getThread', 'Gets thread details', [
      param('threadId', 'string', true, 'Thread ID'),
    ], 'ThreadResponse'),
    fn('updateThreadStatus', 'Updates thread status', [
      param('threadId', 'string', true, 'Thread ID'),
      param('status', 'string', true, 'New status'),
    ], 'ThreadResponse'),
    fn('archiveThread', 'Archives a thread', [
      param('threadId', 'string', true, 'Thread ID'),
    ], 'ThreadResponse'),
    fn('fetchInbox', 'Fetches inbox messages', [
      param('agentId', 'string', true, 'Agent ID'),
      param('limit', 'number', false, 'Message limit'),
    ], 'InboxResponse'),
    fn('sendMessage', 'Sends a mail message', [
      param('threadId', 'string', true, 'Thread ID'),
      param('content', 'string', true, 'Message content'),
      param('attachments', 'array', false, 'Message attachments'),
    ], 'MessageResponse'),
    fn('replyMessage', 'Replies to a message', [
      param('messageId', 'string', true, 'Message ID'),
      param('content', 'string', true, 'Reply content'),
    ], 'MessageResponse'),
    fn('getMessage', 'Gets a message', [
      param('messageId', 'string', true, 'Message ID'),
    ], 'MessageResponse'),
    fn('getMessages', 'Gets multiple messages', [
      param('threadId', 'string', true, 'Thread ID'),
      param('limit', 'number', false, 'Message limit'),
    ], 'MessagesResponse'),
    fn('markRead', 'Marks message as read', [
      param('messageId', 'string', true, 'Message ID'),
    ], 'MessageResponse'),
    fn('acknowledge', 'Acknowledges a message', [
      param('messageId', 'string', true, 'Message ID'),
    ], 'MessageResponse'),
    fn('search', 'Searches messages', [
      param('query', 'string', true, 'Search query'),
      param('filters', 'object', false, 'Search filters'),
    ], 'SearchResponse'),
    fn('summarizeThread', 'Summarizes a thread', [
      param('threadId', 'string', true, 'Thread ID'),
    ], 'SummaryResponse'),
    fn('reserveFiles', 'Reserves files', [
      param('files', 'array', true, 'File paths to reserve'),
      param('agentId', 'string', true, 'Reserving agent ID'),
    ], 'ReservationResponse'),
    fn('releaseFiles', 'Releases file reservations', [
      param('files', 'array', true, 'File paths to release'),
      param('agentId', 'string', true, 'Agent ID'),
    ], 'ReleaseResponse'),
    fn('forceReserveFiles', 'Force reserves files', [
      param('files', 'array', true, 'File paths'),
      param('agentId', 'string', true, 'Agent ID'),
    ], 'ReservationResponse'),
    fn('listReservations', 'Lists file reservations', [
      param('agentId', 'string', false, 'Filter by agent ID'),
    ], 'ReservationListResponse'),
    fn('checkConflicts', 'Checks for reservation conflicts', [
      param('files', 'array', true, 'File paths to check'),
    ], 'ConflictResponse'),
  ],
};

export const terminalModule: CodeboltModule = {
  name: 'terminal',
  displayName: 'Terminal',
  description: 'Terminal command execution',
  category: 'communication',
  functions: [
    fn('executeCommand', 'Executes terminal command', [
      param('command', 'string', true, 'Command to execute'),
      param('returnEmptyStringOnSuccess', 'boolean', false, 'Return empty on success', false),
    ], 'TerminalResponse'),
    fn('executeCommandRunUntilError', 'Executes until error occurs', [
      param('command', 'string', true, 'Command to execute'),
      param('executeInMain', 'boolean', false, 'Execute in main terminal', false),
    ], 'TerminalResponse'),
    fn('executeCommandRunUntilInterrupt', 'Executes until interrupted', [
      param('command', 'string', true, 'Command to execute'),
      param('executeInMain', 'boolean', false, 'Execute in main terminal', false),
    ], 'TerminalResponse'),
    fn('sendManualInterrupt', 'Sends interrupt signal', [], 'void'),
    fn('executeCommandWithStream', 'Executes with streaming output', [
      param('command', 'string', true, 'Command to execute'),
      param('executeInMain', 'boolean', false, 'Execute in main terminal', false),
    ], 'StreamResponse'),
  ],
};
