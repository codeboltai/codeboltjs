[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / fileUpdateIntent

# Variable: fileUpdateIntent

> `const` **fileUpdateIntent**: `object`

Defined in: [packages/codeboltjs/src/modules/fileUpdateIntent.ts:15](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/fileUpdateIntent.ts#L15)

File Update Intent service client for codeboltjs.

## Type Declaration

### cancel()

> **cancel**: (`id`, `cancelledBy`) => `Promise`\<[`FileUpdateIntent`](../interfaces/FileUpdateIntent.md)\>

Cancel an intent

#### Parameters

##### id

`string`

##### cancelledBy

`string`

#### Returns

`Promise`\<[`FileUpdateIntent`](../interfaces/FileUpdateIntent.md)\>

### checkOverlap()

> **checkOverlap**: (`environmentId`, `filePaths`, `priority`) => `Promise`\<[`IntentOverlapResult`](../interfaces/IntentOverlapResult.md)\>

Check for overlap without creating

#### Parameters

##### environmentId

`string`

##### filePaths

`string`[]

##### priority

`number` = `5`

#### Returns

`Promise`\<[`IntentOverlapResult`](../interfaces/IntentOverlapResult.md)\>

### complete()

> **complete**: (`id`, `closedBy`) => `Promise`\<[`FileUpdateIntent`](../interfaces/FileUpdateIntent.md)\>

Complete an intent

#### Parameters

##### id

`string`

##### closedBy

`string`

#### Returns

`Promise`\<[`FileUpdateIntent`](../interfaces/FileUpdateIntent.md)\>

### create()

> **create**: (`data`, `claimedBy`, `claimedByName?`) => `Promise`\<\{ `intent?`: [`FileUpdateIntent`](../interfaces/FileUpdateIntent.md); `overlap?`: [`IntentOverlapResult`](../interfaces/IntentOverlapResult.md); \}\>

Create a new file update intent

#### Parameters

##### data

[`CreateFileUpdateIntentRequest`](../interfaces/CreateFileUpdateIntentRequest.md)

##### claimedBy

`string`

##### claimedByName?

`string`

#### Returns

`Promise`\<\{ `intent?`: [`FileUpdateIntent`](../interfaces/FileUpdateIntent.md); `overlap?`: [`IntentOverlapResult`](../interfaces/IntentOverlapResult.md); \}\>

### delete()

> **delete**: (`id`) => `Promise`\<\{ `success`: `boolean`; \}\>

Delete an intent

#### Parameters

##### id

`string`

#### Returns

`Promise`\<\{ `success`: `boolean`; \}\>

### get()

> **get**: (`id`) => `Promise`\<[`FileUpdateIntent`](../interfaces/FileUpdateIntent.md)\>

Get a single intent

#### Parameters

##### id

`string`

#### Returns

`Promise`\<[`FileUpdateIntent`](../interfaces/FileUpdateIntent.md)\>

### getBlockedFiles()

> **getBlockedFiles**: (`environmentId`) => `Promise`\<\{ `blockedFiles`: `string`[]; \}\>

Get blocked files (level 4 locks)

#### Parameters

##### environmentId

`string`

#### Returns

`Promise`\<\{ `blockedFiles`: `string`[]; \}\>

### getByAgent()

> **getByAgent**: (`agentId`) => `Promise`\<[`FileUpdateIntent`](../interfaces/FileUpdateIntent.md)[]\>

Get intents by agent

#### Parameters

##### agentId

`string`

#### Returns

`Promise`\<[`FileUpdateIntent`](../interfaces/FileUpdateIntent.md)[]\>

### getFilesWithIntents()

> **getFilesWithIntents**: (`environmentId`) => `Promise`\<`FileWithIntent`[]\>

Get all files with intents

#### Parameters

##### environmentId

`string`

#### Returns

`Promise`\<`FileWithIntent`[]\>

### list()

> **list**: (`filters`) => `Promise`\<[`FileUpdateIntent`](../interfaces/FileUpdateIntent.md)[]\>

List intents

#### Parameters

##### filters

[`FileUpdateIntentFilters`](../interfaces/FileUpdateIntentFilters.md) = `{}`

#### Returns

`Promise`\<[`FileUpdateIntent`](../interfaces/FileUpdateIntent.md)[]\>

### update()

> **update**: (`id`, `data`) => `Promise`\<[`FileUpdateIntent`](../interfaces/FileUpdateIntent.md)\>

Update an existing intent

#### Parameters

##### id

`string`

##### data

[`UpdateFileUpdateIntentRequest`](../interfaces/UpdateFileUpdateIntentRequest.md)

#### Returns

`Promise`\<[`FileUpdateIntent`](../interfaces/FileUpdateIntent.md)\>
