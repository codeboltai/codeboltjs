---
title: ReviewMergeRequest
---

[**@codebolt/codeboltjs**](../index)

***

# Interface: ReviewMergeRequest

Defined in: [packages/codeboltjs/src/types/reviewMergeRequest.ts:71](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/reviewMergeRequest.ts#L71)

Core Review/Merge Request interface

## Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="agentid"></a> `agentId` | `string` | [packages/codeboltjs/src/types/reviewMergeRequest.ts:81](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/reviewMergeRequest.ts#L81) |
| <a id="agentname"></a> `agentName` | `string` | [packages/codeboltjs/src/types/reviewMergeRequest.ts:82](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/reviewMergeRequest.ts#L82) |
| <a id="changesfilepath"></a> `changesFilePath?` | `string` | [packages/codeboltjs/src/types/reviewMergeRequest.ts:90](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/reviewMergeRequest.ts#L90) |
| <a id="closedat"></a> `closedAt?` | `string` | [packages/codeboltjs/src/types/reviewMergeRequest.ts:111](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/reviewMergeRequest.ts#L111) |
| <a id="createdat"></a> `createdAt` | `string` | [packages/codeboltjs/src/types/reviewMergeRequest.ts:108](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/reviewMergeRequest.ts#L108) |
| <a id="description"></a> `description` | `string` | [packages/codeboltjs/src/types/reviewMergeRequest.ts:87](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/reviewMergeRequest.ts#L87) |
| <a id="diffpatch"></a> `diffPatch` | `string` | [packages/codeboltjs/src/types/reviewMergeRequest.ts:89](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/reviewMergeRequest.ts#L89) |
| <a id="id"></a> `id` | `string` | [packages/codeboltjs/src/types/reviewMergeRequest.ts:72](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/reviewMergeRequest.ts#L72) |
| <a id="initialtask"></a> `initialTask` | `string` | [packages/codeboltjs/src/types/reviewMergeRequest.ts:77](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/reviewMergeRequest.ts#L77) |
| <a id="issuesfaced"></a> `issuesFaced?` | `string`[] | [packages/codeboltjs/src/types/reviewMergeRequest.ts:96](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/reviewMergeRequest.ts#L96) |
| <a id="linkedjobids"></a> `linkedJobIds` | `string`[] | [packages/codeboltjs/src/types/reviewMergeRequest.ts:101](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/reviewMergeRequest.ts#L101) |
| <a id="majorfileschanged"></a> `majorFilesChanged` | `string`[] | [packages/codeboltjs/src/types/reviewMergeRequest.ts:88](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/reviewMergeRequest.ts#L88) |
| <a id="mergeconfig"></a> `mergeConfig?` | [`MergeConfig`](MergeConfig) | [packages/codeboltjs/src/types/reviewMergeRequest.ts:93](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/reviewMergeRequest.ts#L93) |
| <a id="mergedat"></a> `mergedAt?` | `string` | [packages/codeboltjs/src/types/reviewMergeRequest.ts:110](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/reviewMergeRequest.ts#L110) |
| <a id="mergedby"></a> `mergedBy?` | `string` | [packages/codeboltjs/src/types/reviewMergeRequest.ts:104](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/reviewMergeRequest.ts#L104) |
| <a id="mergeresult"></a> `mergeResult?` | [`MergeResult`](MergeResult) | [packages/codeboltjs/src/types/reviewMergeRequest.ts:105](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/reviewMergeRequest.ts#L105) |
| <a id="remainingtasks"></a> `remainingTasks?` | `string`[] | [packages/codeboltjs/src/types/reviewMergeRequest.ts:97](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/reviewMergeRequest.ts#L97) |
| <a id="reviews"></a> `reviews` | [`ReviewFeedback`](ReviewFeedback)[] | [packages/codeboltjs/src/types/reviewMergeRequest.ts:100](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/reviewMergeRequest.ts#L100) |
| <a id="status"></a> `status` | [`ReviewRequestStatus`](../type-aliases/ReviewRequestStatus) | [packages/codeboltjs/src/types/reviewMergeRequest.ts:74](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/reviewMergeRequest.ts#L74) |
| <a id="swarmid"></a> `swarmId?` | `string` | [packages/codeboltjs/src/types/reviewMergeRequest.ts:83](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/reviewMergeRequest.ts#L83) |
| <a id="taskdescription"></a> `taskDescription?` | `string` | [packages/codeboltjs/src/types/reviewMergeRequest.ts:78](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/reviewMergeRequest.ts#L78) |
| <a id="title"></a> `title` | `string` | [packages/codeboltjs/src/types/reviewMergeRequest.ts:86](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/reviewMergeRequest.ts#L86) |
| <a id="type"></a> `type` | [`ReviewRequestType`](../type-aliases/ReviewRequestType) | [packages/codeboltjs/src/types/reviewMergeRequest.ts:73](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/reviewMergeRequest.ts#L73) |
| <a id="updatedat"></a> `updatedAt` | `string` | [packages/codeboltjs/src/types/reviewMergeRequest.ts:109](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/reviewMergeRequest.ts#L109) |
