import { CodeboltModule, param, fn } from './types';

export const utilsModule: CodeboltModule = {
  name: 'utils',
  displayName: 'Utils',
  description: 'Utility functions',
  category: 'utilities',
  functions: [
    fn('editFileAndApplyDiff', 'Edits file with diff', [
      param('filePath', 'string', true, 'File path'),
      param('diff', 'string', true, 'Diff content'),
      param('diffIdentifier', 'string', true, 'Diff identifier'),
      param('prompt', 'string', true, 'Edit prompt'),
      param('applyModel', 'string', false, 'Model to use'),
    ], 'EditResponse'),
  ],
};

export const tokenizerModule: CodeboltModule = {
  name: 'tokenizer',
  displayName: 'Tokenizer',
  description: 'Token management',
  category: 'utilities',
  functions: [
    fn('addToken', 'Adds a token', [
      param('key', 'string', true, 'Token key'),
    ], 'TokenResponse'),
    fn('getToken', 'Gets a token', [
      param('key', 'string', true, 'Token key'),
    ], 'TokenResponse'),
  ],
};

export const debugModule: CodeboltModule = {
  name: 'debug',
  displayName: 'Debug',
  description: 'Debugging operations',
  category: 'utilities',
  functions: [
    fn('debug', 'Sends debug log', [
      param('log', 'string', true, 'Log message'),
      param('type', 'string', true, 'Log type'),
    ], 'void'),
    fn('openDebugBrowser', 'Opens debug browser', [
      param('url', 'string', true, 'URL to open'),
      param('port', 'number', true, 'Port number'),
    ], 'DebugBrowserResponse'),
  ],
};

export const historyModule: CodeboltModule = {
  name: 'history',
  displayName: 'History',
  description: 'Chat history/summarization',
  category: 'utilities',
  functions: [
    fn('summarizeAll', 'Summarizes all chat history', [], 'SummaryResponse'),
    fn('summarize', 'Summarizes part of history', [
      param('messages', 'array', true, 'Messages to summarize'),
      param('depth', 'number', true, 'Summary depth'),
    ], 'SummaryResponse'),
  ],
};

export const userMessageUtilitiesModule: CodeboltModule = {
  name: 'userMessageUtilities',
  displayName: 'User Message Utilities',
  description: 'User message context access',
  category: 'utilities',
  functions: [
    fn('getCurrent', 'Gets current user message', [], 'UserMessageResponse'),
    fn('getText', 'Gets message text', [], 'TextResponse'),
    fn('getMentionedMCPs', 'Gets mentioned MCPs', [], 'MCPsResponse'),
    fn('getMentionedFiles', 'Gets mentioned files', [], 'FilesResponse'),
    fn('getMentionedFolders', 'Gets mentioned folders', [], 'FoldersResponse'),
    fn('getMentionedAgents', 'Gets mentioned agents', [], 'AgentsResponse'),
    fn('getRemixPrompt', 'Gets remix prompt', [], 'PromptResponse'),
    fn('getUploadedImages', 'Gets uploaded images', [], 'ImagesResponse'),
    fn('getCurrentFile', 'Gets current file', [], 'FileResponse'),
    fn('getSelection', 'Gets text selection', [], 'SelectionResponse'),
    fn('getMessageId', 'Gets message ID', [], 'MessageIdResponse'),
    fn('getThreadId', 'Gets thread ID', [], 'ThreadIdResponse'),
    fn('getProcessingConfig', 'Gets processing config', [], 'ProcessingConfigResponse'),
    fn('isProcessingEnabled', 'Checks if processing enabled', [
      param('type', 'string', true, 'Processing type'),
    ], 'BooleanResponse'),
    fn('setSessionData', 'Sets session data', [
      param('key', 'string', true, 'Data key'),
      param('value', 'any', true, 'Data value'),
    ], 'void'),
    fn('getSessionData', 'Gets session data', [
      param('key', 'string', true, 'Data key'),
    ], 'SessionDataResponse'),
    fn('getTimestamp', 'Gets message timestamp', [], 'TimestampResponse'),
    fn('hasMessage', 'Checks if message exists', [], 'BooleanResponse'),
    fn('updateProcessingConfig', 'Updates processing config', [
      param('config', 'any', true, 'Config data'),
    ], 'ProcessingConfigResponse'),
    fn('clear', 'Clears message', [], 'void'),
  ],
};
