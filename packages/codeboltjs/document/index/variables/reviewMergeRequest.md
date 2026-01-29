[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / reviewMergeRequest

# Variable: reviewMergeRequest

> `const` **reviewMergeRequest**: `object`

Defined in: [packages/codeboltjs/src/modules/reviewMergeRequest.ts:16](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/reviewMergeRequest.ts#L16)

Review Merge Request service client for codeboltjs.

## Type Declaration

### addLinkedJob()

> **addLinkedJob**: (`id`, `jobId`) => `Promise`\<\{ `request`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md); \}\>

Add linked job

#### Parameters

##### id

`string`

##### jobId

`string`

#### Returns

`Promise`\<\{ `request`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md); \}\>

### addReview()

> **addReview**: (`id`, `feedback`) => `Promise`\<\{ `request`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md); \}\>

Add review feedback

#### Parameters

##### id

`string`

##### feedback

[`AddReviewFeedback`](../interfaces/AddReviewFeedback.md)

#### Returns

`Promise`\<\{ `request`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md); \}\>

### byAgent()

> **byAgent**: (`agentId`) => `Promise`\<\{ `requests`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md)[]; `totalCount`: `number`; \}\>

Get requests by agent

#### Parameters

##### agentId

`string`

#### Returns

`Promise`\<\{ `requests`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md)[]; `totalCount`: `number`; \}\>

### bySwarm()

> **bySwarm**: (`swarmId`) => `Promise`\<\{ `requests`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md)[]; `totalCount`: `number`; \}\>

Get requests by swarm

#### Parameters

##### swarmId

`string`

#### Returns

`Promise`\<\{ `requests`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md)[]; `totalCount`: `number`; \}\>

### create()

> **create**: (`data`) => `Promise`\<\{ `request`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md); \}\>

Create a new review merge request

#### Parameters

##### data

[`CreateReviewMergeRequest`](../interfaces/CreateReviewMergeRequest.md)

#### Returns

`Promise`\<\{ `request`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md); \}\>

### delete()

> **delete**: (`id`) => `Promise`\<\{ `deleted`: `boolean`; \}\>

Delete a review merge request

#### Parameters

##### id

`string`

#### Returns

`Promise`\<\{ `deleted`: `boolean`; \}\>

### get()

> **get**: (`id`) => `Promise`\<\{ `request`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md); \}\>

Get a single review merge request

#### Parameters

##### id

`string`

#### Returns

`Promise`\<\{ `request`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md); \}\>

### list()

> **list**: (`filters`) => `Promise`\<\{ `requests`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md)[]; `totalCount`: `number`; \}\>

List review merge requests

#### Parameters

##### filters

[`ReviewMergeRequestFilters`](../interfaces/ReviewMergeRequestFilters.md) = `{}`

#### Returns

`Promise`\<\{ `requests`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md)[]; `totalCount`: `number`; \}\>

### merge()

> **merge**: (`id`, `mergedBy`) => `Promise`\<\{ `result`: [`MergeResult`](../interfaces/MergeResult.md); \}\>

Merge request

#### Parameters

##### id

`string`

##### mergedBy

`string`

#### Returns

`Promise`\<\{ `result`: [`MergeResult`](../interfaces/MergeResult.md); \}\>

### pending()

> **pending**: () => `Promise`\<\{ `requests`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md)[]; `totalCount`: `number`; \}\>

Get pending reviews

#### Returns

`Promise`\<\{ `requests`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md)[]; `totalCount`: `number`; \}\>

### readyToMerge()

> **readyToMerge**: () => `Promise`\<\{ `requests`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md)[]; `totalCount`: `number`; \}\>

Get ready to merge requests

#### Returns

`Promise`\<\{ `requests`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md)[]; `totalCount`: `number`; \}\>

### removeLinkedJob()

> **removeLinkedJob**: (`id`, `jobId`) => `Promise`\<\{ `request`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md); \}\>

Remove linked job

#### Parameters

##### id

`string`

##### jobId

`string`

#### Returns

`Promise`\<\{ `request`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md); \}\>

### statistics()

> **statistics**: () => `Promise`\<\{ `statistics`: `any`; \}\>

Get statistics

#### Returns

`Promise`\<\{ `statistics`: `any`; \}\>

### update()

> **update**: (`id`, `data`) => `Promise`\<\{ `request`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md); \}\>

Update an existing review merge request

#### Parameters

##### id

`string`

##### data

[`UpdateReviewMergeRequest`](../interfaces/UpdateReviewMergeRequest.md)

#### Returns

`Promise`\<\{ `request`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md); \}\>

### updateStatus()

> **updateStatus**: (`id`, `status`) => `Promise`\<\{ `request`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md); \}\>

Update status

#### Parameters

##### id

`string`

##### status

[`ReviewRequestStatus`](../type-aliases/ReviewRequestStatus.md)

#### Returns

`Promise`\<\{ `request`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md); \}\>
