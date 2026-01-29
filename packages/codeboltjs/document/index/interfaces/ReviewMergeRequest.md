[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / ReviewMergeRequest

# Interface: ReviewMergeRequest

Defined in: [packages/codeboltjs/src/types/reviewMergeRequest.ts:71](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/reviewMergeRequest.ts#L71)

Core Review/Merge Request interface

## Properties

### agentId

> **agentId**: `string`

Defined in: [packages/codeboltjs/src/types/reviewMergeRequest.ts:81](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/reviewMergeRequest.ts#L81)

***

### agentName

> **agentName**: `string`

Defined in: [packages/codeboltjs/src/types/reviewMergeRequest.ts:82](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/reviewMergeRequest.ts#L82)

***

### changesFilePath?

> `optional` **changesFilePath**: `string`

Defined in: [packages/codeboltjs/src/types/reviewMergeRequest.ts:90](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/reviewMergeRequest.ts#L90)

***

### closedAt?

> `optional` **closedAt**: `string`

Defined in: [packages/codeboltjs/src/types/reviewMergeRequest.ts:111](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/reviewMergeRequest.ts#L111)

***

### createdAt

> **createdAt**: `string`

Defined in: [packages/codeboltjs/src/types/reviewMergeRequest.ts:108](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/reviewMergeRequest.ts#L108)

***

### description

> **description**: `string`

Defined in: [packages/codeboltjs/src/types/reviewMergeRequest.ts:87](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/reviewMergeRequest.ts#L87)

***

### diffPatch

> **diffPatch**: `string`

Defined in: [packages/codeboltjs/src/types/reviewMergeRequest.ts:89](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/reviewMergeRequest.ts#L89)

***

### id

> **id**: `string`

Defined in: [packages/codeboltjs/src/types/reviewMergeRequest.ts:72](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/reviewMergeRequest.ts#L72)

***

### initialTask

> **initialTask**: `string`

Defined in: [packages/codeboltjs/src/types/reviewMergeRequest.ts:77](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/reviewMergeRequest.ts#L77)

***

### issuesFaced?

> `optional` **issuesFaced**: `string`[]

Defined in: [packages/codeboltjs/src/types/reviewMergeRequest.ts:96](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/reviewMergeRequest.ts#L96)

***

### linkedJobIds

> **linkedJobIds**: `string`[]

Defined in: [packages/codeboltjs/src/types/reviewMergeRequest.ts:101](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/reviewMergeRequest.ts#L101)

***

### majorFilesChanged

> **majorFilesChanged**: `string`[]

Defined in: [packages/codeboltjs/src/types/reviewMergeRequest.ts:88](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/reviewMergeRequest.ts#L88)

***

### mergeConfig?

> `optional` **mergeConfig**: [`MergeConfig`](MergeConfig.md)

Defined in: [packages/codeboltjs/src/types/reviewMergeRequest.ts:93](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/reviewMergeRequest.ts#L93)

***

### mergedAt?

> `optional` **mergedAt**: `string`

Defined in: [packages/codeboltjs/src/types/reviewMergeRequest.ts:110](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/reviewMergeRequest.ts#L110)

***

### mergedBy?

> `optional` **mergedBy**: `string`

Defined in: [packages/codeboltjs/src/types/reviewMergeRequest.ts:104](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/reviewMergeRequest.ts#L104)

***

### mergeResult?

> `optional` **mergeResult**: [`MergeResult`](MergeResult.md)

Defined in: [packages/codeboltjs/src/types/reviewMergeRequest.ts:105](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/reviewMergeRequest.ts#L105)

***

### remainingTasks?

> `optional` **remainingTasks**: `string`[]

Defined in: [packages/codeboltjs/src/types/reviewMergeRequest.ts:97](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/reviewMergeRequest.ts#L97)

***

### reviews

> **reviews**: [`ReviewFeedback`](ReviewFeedback.md)[]

Defined in: [packages/codeboltjs/src/types/reviewMergeRequest.ts:100](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/reviewMergeRequest.ts#L100)

***

### status

> **status**: [`ReviewRequestStatus`](../type-aliases/ReviewRequestStatus.md)

Defined in: [packages/codeboltjs/src/types/reviewMergeRequest.ts:74](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/reviewMergeRequest.ts#L74)

***

### swarmId?

> `optional` **swarmId**: `string`

Defined in: [packages/codeboltjs/src/types/reviewMergeRequest.ts:83](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/reviewMergeRequest.ts#L83)

***

### taskDescription?

> `optional` **taskDescription**: `string`

Defined in: [packages/codeboltjs/src/types/reviewMergeRequest.ts:78](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/reviewMergeRequest.ts#L78)

***

### title

> **title**: `string`

Defined in: [packages/codeboltjs/src/types/reviewMergeRequest.ts:86](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/reviewMergeRequest.ts#L86)

***

### type

> **type**: [`ReviewRequestType`](../type-aliases/ReviewRequestType.md)

Defined in: [packages/codeboltjs/src/types/reviewMergeRequest.ts:73](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/reviewMergeRequest.ts#L73)

***

### updatedAt

> **updatedAt**: `string`

Defined in: [packages/codeboltjs/src/types/reviewMergeRequest.ts:109](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/reviewMergeRequest.ts#L109)
