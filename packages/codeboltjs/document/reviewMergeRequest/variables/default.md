[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [reviewMergeRequest.ts:16](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/reviewMergeRequest.ts#L16)

Review Merge Request service client for codeboltjs.

## Type Declaration

### addLinkedJob()

> **addLinkedJob**: (`id`, `jobId`) => `Promise`\<\{ `request`: `ReviewMergeRequest`; \}\>

Add linked job

#### Parameters

##### id

`string`

##### jobId

`string`

#### Returns

`Promise`\<\{ `request`: `ReviewMergeRequest`; \}\>

### addReview()

> **addReview**: (`id`, `feedback`) => `Promise`\<\{ `request`: `ReviewMergeRequest`; \}\>

Add review feedback

#### Parameters

##### id

`string`

##### feedback

`AddReviewFeedback`

#### Returns

`Promise`\<\{ `request`: `ReviewMergeRequest`; \}\>

### byAgent()

> **byAgent**: (`agentId`) => `Promise`\<\{ `requests`: `ReviewMergeRequest`[]; `totalCount`: `number`; \}\>

Get requests by agent

#### Parameters

##### agentId

`string`

#### Returns

`Promise`\<\{ `requests`: `ReviewMergeRequest`[]; `totalCount`: `number`; \}\>

### bySwarm()

> **bySwarm**: (`swarmId`) => `Promise`\<\{ `requests`: `ReviewMergeRequest`[]; `totalCount`: `number`; \}\>

Get requests by swarm

#### Parameters

##### swarmId

`string`

#### Returns

`Promise`\<\{ `requests`: `ReviewMergeRequest`[]; `totalCount`: `number`; \}\>

### create()

> **create**: (`data`) => `Promise`\<\{ `request`: `ReviewMergeRequest`; \}\>

Create a new review merge request

#### Parameters

##### data

`CreateReviewMergeRequest`

#### Returns

`Promise`\<\{ `request`: `ReviewMergeRequest`; \}\>

### delete()

> **delete**: (`id`) => `Promise`\<\{ `deleted`: `boolean`; \}\>

Delete a review merge request

#### Parameters

##### id

`string`

#### Returns

`Promise`\<\{ `deleted`: `boolean`; \}\>

### get()

> **get**: (`id`) => `Promise`\<\{ `request`: `ReviewMergeRequest`; \}\>

Get a single review merge request

#### Parameters

##### id

`string`

#### Returns

`Promise`\<\{ `request`: `ReviewMergeRequest`; \}\>

### list()

> **list**: (`filters`) => `Promise`\<\{ `requests`: `ReviewMergeRequest`[]; `totalCount`: `number`; \}\>

List review merge requests

#### Parameters

##### filters

`ReviewMergeRequestFilters` = `{}`

#### Returns

`Promise`\<\{ `requests`: `ReviewMergeRequest`[]; `totalCount`: `number`; \}\>

### merge()

> **merge**: (`id`, `mergedBy`) => `Promise`\<\{ `result`: `MergeResult`; \}\>

Merge request

#### Parameters

##### id

`string`

##### mergedBy

`string`

#### Returns

`Promise`\<\{ `result`: `MergeResult`; \}\>

### pending()

> **pending**: () => `Promise`\<\{ `requests`: `ReviewMergeRequest`[]; `totalCount`: `number`; \}\>

Get pending reviews

#### Returns

`Promise`\<\{ `requests`: `ReviewMergeRequest`[]; `totalCount`: `number`; \}\>

### readyToMerge()

> **readyToMerge**: () => `Promise`\<\{ `requests`: `ReviewMergeRequest`[]; `totalCount`: `number`; \}\>

Get ready to merge requests

#### Returns

`Promise`\<\{ `requests`: `ReviewMergeRequest`[]; `totalCount`: `number`; \}\>

### removeLinkedJob()

> **removeLinkedJob**: (`id`, `jobId`) => `Promise`\<\{ `request`: `ReviewMergeRequest`; \}\>

Remove linked job

#### Parameters

##### id

`string`

##### jobId

`string`

#### Returns

`Promise`\<\{ `request`: `ReviewMergeRequest`; \}\>

### statistics()

> **statistics**: () => `Promise`\<\{ `statistics`: `any`; \}\>

Get statistics

#### Returns

`Promise`\<\{ `statistics`: `any`; \}\>

### update()

> **update**: (`id`, `data`) => `Promise`\<\{ `request`: `ReviewMergeRequest`; \}\>

Update an existing review merge request

#### Parameters

##### id

`string`

##### data

`UpdateReviewMergeRequest`

#### Returns

`Promise`\<\{ `request`: `ReviewMergeRequest`; \}\>

### updateStatus()

> **updateStatus**: (`id`, `status`) => `Promise`\<\{ `request`: `ReviewMergeRequest`; \}\>

Update status

#### Parameters

##### id

`string`

##### status

`ReviewRequestStatus`

#### Returns

`Promise`\<\{ `request`: `ReviewMergeRequest`; \}\>
