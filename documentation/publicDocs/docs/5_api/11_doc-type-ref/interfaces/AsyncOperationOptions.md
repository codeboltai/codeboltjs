---
title: AsyncOperationOptions
---

[**@codebolt/codeboltjs**](../index)

***

# Interface: AsyncOperationOptions

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:1761](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/libFunctionTypes.ts#L1761)

Common options for async operations

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="onprogress"></a> `onProgress?` | (`progress`: `number`) => `void` | Progress callback | [packages/codeboltjs/src/types/libFunctionTypes.ts:1770](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/libFunctionTypes.ts#L1770) |
| <a id="retry"></a> `retry?` | \{ `attempts?`: `number`; `delay?`: `number`; \} | Retry configuration | [packages/codeboltjs/src/types/libFunctionTypes.ts:1765](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/libFunctionTypes.ts#L1765) |
| `retry.attempts?` | `number` | - | [packages/codeboltjs/src/types/libFunctionTypes.ts:1766](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/libFunctionTypes.ts#L1766) |
| `retry.delay?` | `number` | - | [packages/codeboltjs/src/types/libFunctionTypes.ts:1767](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/libFunctionTypes.ts#L1767) |
| <a id="signal"></a> `signal?` | `AbortSignal` | Cancellation signal | [packages/codeboltjs/src/types/libFunctionTypes.ts:1772](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/libFunctionTypes.ts#L1772) |
| <a id="timeout"></a> `timeout?` | `number` | Operation timeout in milliseconds | [packages/codeboltjs/src/types/libFunctionTypes.ts:1763](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/libFunctionTypes.ts#L1763) |
