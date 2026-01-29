[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [codemap.ts:21](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/codemap.ts#L21)

Codemap Module for codeboltjs
Provides functionality for managing codemaps (visual representations of code structure).
Mirrors the codemapService.cli.ts operations via WebSocket.

## Type Declaration

### create()

> **create**: (`data`, `projectPath?`) => `Promise`\<`CodemapCreateResponse`\>

Create a placeholder codemap (status: 'creating')
Call this before generating the actual codemap content

#### Parameters

##### data

`CreateCodemapData`

##### projectPath?

`string`

#### Returns

`Promise`\<`CodemapCreateResponse`\>

### delete()

> **delete**: (`codemapId`, `projectPath?`) => `Promise`\<`CodemapDeleteResponse`\>

Delete a codemap

#### Parameters

##### codemapId

`string`

##### projectPath?

`string`

#### Returns

`Promise`\<`CodemapDeleteResponse`\>

### get()

> **get**: (`codemapId`, `projectPath?`) => `Promise`\<`CodemapGetResponse`\>

Get a specific codemap by ID

#### Parameters

##### codemapId

`string`

##### projectPath?

`string`

#### Returns

`Promise`\<`CodemapGetResponse`\>

### list()

> **list**: (`projectPath?`) => `Promise`\<`CodemapListResponse`\>

List all codemaps for a project

#### Parameters

##### projectPath?

`string`

#### Returns

`Promise`\<`CodemapListResponse`\>

### save()

> **save**: (`codemapId`, `codemap`, `projectPath?`) => `Promise`\<`CodemapSaveResponse`\>

Save a complete codemap with content

#### Parameters

##### codemapId

`string`

##### codemap

`Codemap`

##### projectPath?

`string`

#### Returns

`Promise`\<`CodemapSaveResponse`\>

### setStatus()

> **setStatus**: (`codemapId`, `status`, `error?`, `projectPath?`) => `Promise`\<`CodemapUpdateResponse`\>

Set the status of a codemap

#### Parameters

##### codemapId

`string`

##### status

`CodemapStatus`

##### error?

`string`

##### projectPath?

`string`

#### Returns

`Promise`\<`CodemapUpdateResponse`\>

### update()

> **update**: (`codemapId`, `data`, `projectPath?`) => `Promise`\<`CodemapUpdateResponse`\>

Update codemap info (title, description, etc.)

#### Parameters

##### codemapId

`string`

##### data

`UpdateCodemapData`

##### projectPath?

`string`

#### Returns

`Promise`\<`CodemapUpdateResponse`\>
