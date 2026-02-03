import { CodeboltModule, param, fn } from './types';

export const llmModule: CodeboltModule = {
  name: 'llm',
  displayName: 'LLM',
  description: 'Language model inference',
  category: 'ai-llm',
  functions: [
    fn('inference', 'Performs LLM inference', [
      param('messages', 'array', true, 'Messages array'),
      param('model', 'string', false, 'Model to use'),
      param('temperature', 'number', false, 'Temperature', 0.7),
      param('maxTokens', 'number', false, 'Max tokens'),
      param('systemPrompt', 'string', false, 'System prompt'),
    ], 'InferenceResponse'),
    fn('getModelConfig', 'Gets model configuration', [
      param('modelId', 'string', false, 'Model ID'),
    ], 'ModelConfigResponse'),
  ],
};

export const mcpModule: CodeboltModule = {
  name: 'mcp',
  displayName: 'MCP',
  description: 'Model Context Protocol tool management',
  category: 'ai-llm',
  functions: [
    fn('getEnabledMCPServers', 'Gets enabled MCP servers', [], 'MCPServersResponse'),
    fn('getLocalMCPServers', 'Gets local MCP servers', [], 'MCPServersResponse'),
    fn('getMentionedMCPServers', 'Gets mentioned MCP servers', [
      param('userMessage', 'object', true, 'User message object'),
    ], 'MCPServersResponse'),
    fn('searchAvailableMCPServers', 'Searches for MCP servers', [
      param('query', 'string', true, 'Search query'),
    ], 'MCPSearchResponse'),
    fn('listMcpFromServers', 'Lists tools from servers', [
      param('toolBoxes', 'array', true, 'Toolbox names'),
    ], 'MCPToolsResponse'),
    fn('configureMCPServer', 'Configures MCP server', [
      param('name', 'string', true, 'Server name'),
      param('config', 'object', true, 'Server configuration'),
    ], 'ConfigureResponse'),
    fn('getTools', 'Gets tool details', [
      param('toolRequests', 'array', true, 'Tool request array'),
    ], 'ToolsResponse'),
    fn('executeTool', 'Executes an MCP tool', [
      param('toolbox', 'string', true, 'Toolbox name'),
      param('toolName', 'string', true, 'Tool name'),
      param('params', 'object', true, 'Tool parameters'),
    ], 'ExecuteToolResponse'),
    fn('getMcpTools', 'Gets MCP tools', [
      param('mcpNames', 'array', false, 'MCP server names'),
    ], 'MCPToolsResponse'),
    fn('getMcpList', 'Gets MCP server list', [], 'MCPListResponse'),
    fn('getAllMcpTools', 'Gets all MCP tools', [], 'MCPToolsResponse'),
    fn('getEnabledMcps', 'Gets enabled MCPs', [], 'EnabledMCPsResponse'),
    fn('configureMcpTool', 'Configures MCP tool', [
      param('mcpName', 'string', true, 'MCP name'),
      param('toolName', 'string', true, 'Tool name'),
      param('config', 'object', true, 'Tool configuration'),
    ], 'ConfigureResponse'),
  ],
};
