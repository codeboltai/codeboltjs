---
title: StreamCallback
---

[**@codebolt/agent**](../../README)

***

# Type Alias: StreamCallback()

```ts
type StreamCallback = (chunk: StreamChunk) => void | Promise<void>;
```

Defined in: [packages/agent/src/unified/types/libTypes.ts:403](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/libTypes.ts#L403)

Stream callback function

## Parameters

| Parameter | Type |
| ------ | ------ |
| `chunk` | [`StreamChunk`](../interfaces/StreamChunk) |

## Returns

`void` \| `Promise`\<`void`\>
