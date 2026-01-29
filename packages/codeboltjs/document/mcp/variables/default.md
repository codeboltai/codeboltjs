[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [mcp.ts:65](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/mcp.ts#L65)

Object containing methods for interacting with Codebolt MCP (Model Context Protocol) tools.
Provides functionality to discover, list, and execute tools.

## Type Declaration

### configureMCPServer()

> **configureMCPServer**: (`name`, `config`) => `Promise`\<`ConfigureToolBoxResponse`\>

Configures a specific toolbox with provided configuration.

#### Parameters

##### name

`string`

The name of the toolbox to configure

##### config

`MCPConfiguration`

Configuration object for the toolbox

#### Returns

`Promise`\<`ConfigureToolBoxResponse`\>

Promise with the configuration result

### configureMcpTool()

> **configureMcpTool**: (`mcpName`, `toolName`, `config`) => `Promise`\<`ConfigureMCPToolResponse`\>

Configures a specific MCP tool with provided configuration.

#### Parameters

##### mcpName

`string`

The name of the MCP server

##### toolName

`string`

The name of the tool to configure

##### config

`Record`\<`string`, `unknown`\>

Configuration object for the tool

#### Returns

`Promise`\<`ConfigureMCPToolResponse`\>

Promise with the configuration result

### executeTool()

> **executeTool**: (`toolbox`, `toolName`, `params`) => `Promise`\<`ExecuteToolResponse`\>

Executes a specific tool with provided parameters.

#### Parameters

##### toolbox

`string`

The name of the toolbox containing the tool

##### toolName

`string`

The name of the tool to execute

##### params

`ToolParameters`

Parameters to pass to the tool

#### Returns

`Promise`\<`ExecuteToolResponse`\>

Promise with the execution result

### getAllMcpTools()

> **getAllMcpTools**: () => `Promise`\<`GetAllMCPToolsResponse`\>

Gets all tools from all enabled MCP servers.

#### Returns

`Promise`\<`GetAllMCPToolsResponse`\>

Promise with all MCP tools data

### getEnabledMcps()

> **getEnabledMcps**: () => `Promise`\<`GetEnabledMCPSResponse`\>

Gets the list of enabled MCP servers.

#### Returns

`Promise`\<`GetEnabledMCPSResponse`\>

Promise with enabled MCP servers data

### getEnabledMCPServers()

> **getEnabledMCPServers**: () => `Promise`\<`GetEnabledToolBoxesResponse`\>

Gets the list of currently enabled toolboxes.

#### Returns

`Promise`\<`GetEnabledToolBoxesResponse`\>

Promise with the enabled toolboxes data

### getLocalMCPServers()

> **getLocalMCPServers**: () => `Promise`\<`GetLocalToolBoxesResponse`\>

Gets the list of locally available toolboxes.

#### Returns

`Promise`\<`GetLocalToolBoxesResponse`\>

Promise with the local toolboxes data

### getMcpList()

> **getMcpList**: () => `Promise`\<`GetMcpListResponse`\>

Gets the list of available MCP servers.

#### Returns

`Promise`\<`GetMcpListResponse`\>

Promise with MCP server list

### getMcpTools()

> **getMcpTools**: (`mcpNames?`) => `Promise`\<`GetMcpToolsResponse`\>

Gets MCP tools from the specified servers.

#### Parameters

##### mcpNames?

`string`[]

Array of MCP server names to get tools from

#### Returns

`Promise`\<`GetMcpToolsResponse`\>

Promise with MCP tools data

### getMentionedMCPServers()

> **getMentionedMCPServers**: (`userMessage`) => `Promise`\<`GetAvailableToolBoxesResponse`\>

Gets toolboxes mentioned in a user message.

#### Parameters

##### userMessage

`MCPUserMessage`

The user message to extract mentions from

#### Returns

`Promise`\<`GetAvailableToolBoxesResponse`\>

Promise with the mentioned toolboxes

### getTools()

> **getTools**: (`toolRequests`) => `Promise`\<`GetToolsResponse`\>

Gets detailed information about specific tools.

#### Parameters

##### toolRequests

`object`[]

Array of toolbox and tool name pairs

#### Returns

`Promise`\<`GetToolsResponse`\>

Promise with detailed information about the tools

### listMcpFromServers()

> **listMcpFromServers**: (`toolBoxes`) => `Promise`\<`ListToolsFromToolBoxesResponse`\>

Lists all tools from the specified toolboxes.

#### Parameters

##### toolBoxes

`string`[]

Array of toolbox names to list tools from

#### Returns

`Promise`\<`ListToolsFromToolBoxesResponse`\>

Promise with tools from the specified toolboxes (in OpenAI format)

### searchAvailableMCPServers()

> **searchAvailableMCPServers**: (`query`) => `Promise`\<`SearchAvailableToolBoxesResponse`\>

Searches for available toolboxes matching a query.

#### Parameters

##### query

`string`

The search query string

#### Returns

`Promise`\<`SearchAvailableToolBoxesResponse`\>

Promise with matching toolboxes data
