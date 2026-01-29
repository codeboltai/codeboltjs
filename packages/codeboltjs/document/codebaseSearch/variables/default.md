[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [codebaseSearch.ts:15](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/codebaseSearch.ts#L15)

Codebase Search Module for codeboltjs
Provides semantic code search functionality across the project.
Mirrors the codebaseSearch.cli.ts operations via WebSocket.

## Type Declaration

### search()

> **search**: (`query`, `targetDirectories?`) => `Promise`\<`CodebaseSearchResponse`\>

Perform a semantic search across the codebase

#### Parameters

##### query

`string`

The search query

##### targetDirectories?

`string`[]

Optional directories to limit the search

#### Returns

`Promise`\<`CodebaseSearchResponse`\>

### searchMcpTool()

> **searchMcpTool**: (`query`, `tags?`) => `Promise`\<`McpToolSearchResponse`\>

Search for MCP tools by query and optional tags

#### Parameters

##### query

`string`

The search query

##### tags?

`string`[]

Optional tags to filter results

#### Returns

`Promise`\<`McpToolSearchResponse`\>
