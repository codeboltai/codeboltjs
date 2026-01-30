---
title: ReviewMergeRequest
---

[**@codebolt/codeboltjs**](../README)

***

# Interface: ReviewMergeRequest

Defined in: packages/codeboltjs/src/types/reviewMergeRequest.ts:71

Core Review/Merge Request interface

## Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="agentid"></a> `agentId` | `string` | [packages/codeboltjs/src/types/reviewMergeRequest.ts:81](packages/codeboltjs/src/types/reviewMergeRequest.ts#L81) |
| <a id="agentname"></a> `agentName` | `string` | [packages/codeboltjs/src/types/reviewMergeRequest.ts:82](packages/codeboltjs/src/types/reviewMergeRequest.ts#L82) |
| <a id="changesfilepath"></a> `changesFilePath?` | `string` | [packages/codeboltjs/src/types/reviewMergeRequest.ts:90](packages/codeboltjs/src/types/reviewMergeRequest.ts#L90) |
| <a id="closedat"></a> `closedAt?` | `string` | [packages/codeboltjs/src/types/reviewMergeRequest.ts:111](packages/codeboltjs/src/types/reviewMergeRequest.ts#L111) |
| <a id="createdat"></a> `createdAt` | `string` | [packages/codeboltjs/src/types/reviewMergeRequest.ts:108](packages/codeboltjs/src/types/reviewMergeRequest.ts#L108) |
| <a id="description"></a> `description` | `string` | [packages/codeboltjs/src/types/reviewMergeRequest.ts:87](packages/codeboltjs/src/types/reviewMergeRequest.ts#L87) |
| <a id="diffpatch"></a> `diffPatch` | `string` | [packages/codeboltjs/src/types/reviewMergeRequest.ts:89](packages/codeboltjs/src/types/reviewMergeRequest.ts#L89) |
| <a id="id"></a> `id` | `string` | [packages/codeboltjs/src/types/reviewMergeRequest.ts:72](packages/codeboltjs/src/types/reviewMergeRequest.ts#L72) |
| <a id="initialtask"></a> `initialTask` | `string` | [packages/codeboltjs/src/types/reviewMergeRequest.ts:77](packages/codeboltjs/src/types/reviewMergeRequest.ts#L77) |
| <a id="issuesfaced"></a> `issuesFaced?` | `string`[] | [packages/codeboltjs/src/types/reviewMergeRequest.ts:96](packages/codeboltjs/src/types/reviewMergeRequest.ts#L96) |
| <a id="linkedjobids"></a> `linkedJobIds` | `string`[] | [packages/codeboltjs/src/types/reviewMergeRequest.ts:101](packages/codeboltjs/src/types/reviewMergeRequest.ts#L101) |
| <a id="majorfileschanged"></a> `majorFilesChanged` | `string`[] | [packages/codeboltjs/src/types/reviewMergeRequest.ts:88](packages/codeboltjs/src/types/reviewMergeRequest.ts#L88) |
| <a id="mergeconfig"></a> `mergeConfig?` | [`MergeConfig`](MergeConfig) | [packages/codeboltjs/src/types/reviewMergeRequest.ts:93](packages/codeboltjs/src/types/reviewMergeRequest.ts#L93) |
| <a id="mergedat"></a> `mergedAt?` | `string` | [packages/codeboltjs/src/types/reviewMergeRequest.ts:110](packages/codeboltjs/src/types/reviewMergeRequest.ts#L110) |
| <a id="mergedby"></a> `mergedBy?` | `string` | [packages/codeboltjs/src/types/reviewMergeRequest.ts:104](packages/codeboltjs/src/types/reviewMergeRequest.ts#L104) |
| <a id="mergeresult"></a> `mergeResult?` | [`MergeResult`](MergeResult) | [packages/codeboltjs/src/types/reviewMergeRequest.ts:105](packages/codeboltjs/src/types/reviewMergeRequest.ts#L105) |
| <a id="remainingtasks"></a> `remainingTasks?` | `string`[] | [packages/codeboltjs/src/types/reviewMergeRequest.ts:97](packages/codeboltjs/src/types/reviewMergeRequest.ts#L97) |
| <a id="reviews"></a> `reviews` | [`ReviewFeedback`](ReviewFeedback)[] | [packages/codeboltjs/src/types/reviewMergeRequest.ts:100](packages/codeboltjs/src/types/reviewMergeRequest.ts#L100) |
| <a id="status"></a> `status` | [`ReviewRequestStatus`](../type-aliases/ReviewRequestStatus) | [packages/codeboltjs/src/types/reviewMergeRequest.ts:74](packages/codeboltjs/src/types/reviewMergeRequest.ts#L74) |
| <a id="swarmid"></a> `swarmId?` | `string` | [packages/codeboltjs/src/types/reviewMergeRequest.ts:83](packages/codeboltjs/src/types/reviewMergeRequest.ts#L83) |
| <a id="taskdescription"></a> `taskDescription?` | `string` | [packages/codeboltjs/src/types/reviewMergeRequest.ts:78](packages/codeboltjs/src/types/reviewMergeRequest.ts#L78) |
| <a id="title"></a> `title` | `string` | [packages/codeboltjs/src/types/reviewMergeRequest.ts:86](packages/codeboltjs/src/types/reviewMergeRequest.ts#L86) |
| <a id="type"></a> `type` | [`ReviewRequestType`](../type-aliases/ReviewRequestType) | [packages/codeboltjs/src/types/reviewMergeRequest.ts:73](packages/codeboltjs/src/types/reviewMergeRequest.ts#L73) |
| <a id="updatedat"></a> `updatedAt` | `string` | [packages/codeboltjs/src/types/reviewMergeRequest.ts:109](packages/codeboltjs/src/types/reviewMergeRequest.ts#L109) |
