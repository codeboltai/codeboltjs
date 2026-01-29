[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [projectStructureUpdateRequest.ts:18](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/projectStructureUpdateRequest.ts#L18)

Project Structure Update Request Module for codeboltjs
Allows agents to propose changes to the project structure

## Type Declaration

### addComment()

> **addComment**: (`id`, `disputeId`, `data`, `workspacePath?`) => `Promise`\<`UpdateRequestResponse`\>

Add a comment

#### Parameters

##### id

`string`

##### disputeId

`string`

##### data

`AddCommentData`

##### workspacePath?

`string`

#### Returns

`Promise`\<`UpdateRequestResponse`\>

### addDispute()

> **addDispute**: (`id`, `data`, `workspacePath?`) => `Promise`\<`UpdateRequestResponse`\>

Add a dispute

#### Parameters

##### id

`string`

##### data

`CreateDisputeData`

##### workspacePath?

`string`

#### Returns

`Promise`\<`UpdateRequestResponse`\>

### complete()

> **complete**: (`id`, `workspacePath?`) => `Promise`\<`UpdateRequestResponse`\>

Complete work on an update request

#### Parameters

##### id

`string`

##### workspacePath?

`string`

#### Returns

`Promise`\<`UpdateRequestResponse`\>

### create()

> **create**: (`data`, `workspacePath?`) => `Promise`\<`UpdateRequestResponse`\>

Create a new update request

#### Parameters

##### data

`CreateUpdateRequestData`

##### workspacePath?

`string`

#### Returns

`Promise`\<`UpdateRequestResponse`\>

### delete()

> **delete**: (`id`, `workspacePath?`) => `Promise`\<`UpdateRequestResponse`\>

Delete an update request

#### Parameters

##### id

`string`

##### workspacePath?

`string`

#### Returns

`Promise`\<`UpdateRequestResponse`\>

### get()

> **get**: (`id`, `workspacePath?`) => `Promise`\<`UpdateRequestResponse`\>

Get an update request by ID

#### Parameters

##### id

`string`

##### workspacePath?

`string`

#### Returns

`Promise`\<`UpdateRequestResponse`\>

### list()

> **list**: (`filters?`, `workspacePath?`) => `Promise`\<`UpdateRequestListResponse`\>

List update requests

#### Parameters

##### filters?

`UpdateRequestFilters`

##### workspacePath?

`string`

#### Returns

`Promise`\<`UpdateRequestListResponse`\>

### merge()

> **merge**: (`id`, `workspacePath?`) => `Promise`\<`UpdateRequestResponse`\>

Merge an update request

#### Parameters

##### id

`string`

##### workspacePath?

`string`

#### Returns

`Promise`\<`UpdateRequestResponse`\>

### resolveDispute()

> **resolveDispute**: (`id`, `disputeId`, `resolutionSummary?`, `workspacePath?`) => `Promise`\<`UpdateRequestResponse`\>

Resolve a dispute

#### Parameters

##### id

`string`

##### disputeId

`string`

##### resolutionSummary?

`string`

##### workspacePath?

`string`

#### Returns

`Promise`\<`UpdateRequestResponse`\>

### startWork()

> **startWork**: (`id`, `workspacePath?`) => `Promise`\<`UpdateRequestResponse`\>

Start working on an update request

#### Parameters

##### id

`string`

##### workspacePath?

`string`

#### Returns

`Promise`\<`UpdateRequestResponse`\>

### submit()

> **submit**: (`id`, `workspacePath?`) => `Promise`\<`UpdateRequestResponse`\>

Submit an update request for review

#### Parameters

##### id

`string`

##### workspacePath?

`string`

#### Returns

`Promise`\<`UpdateRequestResponse`\>

### unwatch()

> **unwatch**: (`id`, `watcherId`, `workspacePath?`) => `Promise`\<`UpdateRequestResponse`\>

Stop watching an update request

#### Parameters

##### id

`string`

##### watcherId

`string`

##### workspacePath?

`string`

#### Returns

`Promise`\<`UpdateRequestResponse`\>

### update()

> **update**: (`id`, `updates`, `workspacePath?`) => `Promise`\<`UpdateRequestResponse`\>

Update an existing update request

#### Parameters

##### id

`string`

##### updates

`UpdateUpdateRequestData`

##### workspacePath?

`string`

#### Returns

`Promise`\<`UpdateRequestResponse`\>

### watch()

> **watch**: (`id`, `data`, `workspacePath?`) => `Promise`\<`UpdateRequestResponse`\>

Watch an update request

#### Parameters

##### id

`string`

##### data

`AddWatcherData`

##### workspacePath?

`string`

#### Returns

`Promise`\<`UpdateRequestResponse`\>
