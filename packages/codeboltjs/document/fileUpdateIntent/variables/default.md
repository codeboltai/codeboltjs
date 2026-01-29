[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [fileUpdateIntent.ts:15](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/fileUpdateIntent.ts#L15)

File Update Intent service client for codeboltjs.

## Type Declaration

### cancel()

> **cancel**: (`id`, `cancelledBy`) => `Promise`\<`FileUpdateIntent`\>

Cancel an intent

#### Parameters

##### id

`string`

##### cancelledBy

`string`

#### Returns

`Promise`\<`FileUpdateIntent`\>

### checkOverlap()

> **checkOverlap**: (`environmentId`, `filePaths`, `priority`) => `Promise`\<`IntentOverlapResult`\>

Check for overlap without creating

#### Parameters

##### environmentId

`string`

##### filePaths

`string`[]

##### priority

`number` = `5`

#### Returns

`Promise`\<`IntentOverlapResult`\>

### complete()

> **complete**: (`id`, `closedBy`) => `Promise`\<`FileUpdateIntent`\>

Complete an intent

#### Parameters

##### id

`string`

##### closedBy

`string`

#### Returns

`Promise`\<`FileUpdateIntent`\>

### create()

> **create**: (`data`, `claimedBy`, `claimedByName?`) => `Promise`\<\{ `intent?`: `FileUpdateIntent`; `overlap?`: `IntentOverlapResult`; \}\>

Create a new file update intent

#### Parameters

##### data

`CreateFileUpdateIntentRequest`

##### claimedBy

`string`

##### claimedByName?

`string`

#### Returns

`Promise`\<\{ `intent?`: `FileUpdateIntent`; `overlap?`: `IntentOverlapResult`; \}\>

### delete()

> **delete**: (`id`) => `Promise`\<\{ `success`: `boolean`; \}\>

Delete an intent

#### Parameters

##### id

`string`

#### Returns

`Promise`\<\{ `success`: `boolean`; \}\>

### get()

> **get**: (`id`) => `Promise`\<`FileUpdateIntent`\>

Get a single intent

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`FileUpdateIntent`\>

### getBlockedFiles()

> **getBlockedFiles**: (`environmentId`) => `Promise`\<\{ `blockedFiles`: `string`[]; \}\>

Get blocked files (level 4 locks)

#### Parameters

##### environmentId

`string`

#### Returns

`Promise`\<\{ `blockedFiles`: `string`[]; \}\>

### getByAgent()

> **getByAgent**: (`agentId`) => `Promise`\<`FileUpdateIntent`[]\>

Get intents by agent

#### Parameters

##### agentId

`string`

#### Returns

`Promise`\<`FileUpdateIntent`[]\>

### getFilesWithIntents()

> **getFilesWithIntents**: (`environmentId`) => `Promise`\<`FileWithIntent`[]\>

Get all files with intents

#### Parameters

##### environmentId

`string`

#### Returns

`Promise`\<`FileWithIntent`[]\>

### list()

> **list**: (`filters`) => `Promise`\<`FileUpdateIntent`[]\>

List intents

#### Parameters

##### filters

`FileUpdateIntentFilters` = `{}`

#### Returns

`Promise`\<`FileUpdateIntent`[]\>

### update()

> **update**: (`id`, `data`) => `Promise`\<`FileUpdateIntent`\>

Update an existing intent

#### Parameters

##### id

`string`

##### data

`UpdateFileUpdateIntentRequest`

#### Returns

`Promise`\<`FileUpdateIntent`\>
