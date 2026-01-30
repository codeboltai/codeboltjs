---
title: DiffResult
---

[**@codebolt/codeboltjs**](../README)

***

# Interface: DiffResult

Defined in: [packages/codeboltjs/src/types/commonTypes.ts:63](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/commonTypes.ts#L63)

## Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="changed"></a> `changed` | `number` | [packages/codeboltjs/src/types/commonTypes.ts:76](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/commonTypes.ts#L76) |
| <a id="deletions"></a> `deletions` | `number` | [packages/codeboltjs/src/types/commonTypes.ts:75](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/commonTypes.ts#L75) |
| <a id="files"></a> `files` | \{ `binary`: `boolean`; `changes`: `number`; `deletions`: `number`; `diff?`: `string`; `file`: `string`; `insertions`: `number`; `oldFile?`: `string`; `status?`: `"added"` \| `"modified"` \| `"deleted"` \| `"renamed"` \| `"copied"`; \}[] | [packages/codeboltjs/src/types/commonTypes.ts:64](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/commonTypes.ts#L64) |
| <a id="insertions"></a> `insertions` | `number` | [packages/codeboltjs/src/types/commonTypes.ts:74](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/commonTypes.ts#L74) |
| <a id="rawdiff"></a> `rawDiff?` | `string` | [packages/codeboltjs/src/types/commonTypes.ts:77](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/commonTypes.ts#L77) |
