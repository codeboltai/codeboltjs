---
title: KVGetResponse
---

[**@codebolt/codeboltjs**](../README)

***

# Interface: KVGetResponse

Defined in: packages/codeboltjs/src/types/kvStore.ts:109

KV Store Types
Type definitions for Key-Value store operations

## Extends

- [`KVStoreBaseResponse`](KVStoreBaseResponse)

## Properties

| Property | Type | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="data"></a> `data?` | \{ `exists`: `boolean`; `value`: `any`; \} | [`KVStoreBaseResponse`](KVStoreBaseResponse).[`data`](KVStoreBaseResponse.md#data) | - | [packages/codeboltjs/src/types/kvStore.ts:110](packages/codeboltjs/src/types/kvStore.ts#L110) |
| `data.exists` | `boolean` | - | - | [packages/codeboltjs/src/types/kvStore.ts:110](packages/codeboltjs/src/types/kvStore.ts#L110) |
| `data.value` | `any` | - | - | [packages/codeboltjs/src/types/kvStore.ts:110](packages/codeboltjs/src/types/kvStore.ts#L110) |
| <a id="error"></a> `error?` | `string` | - | [`KVStoreBaseResponse`](KVStoreBaseResponse).[`error`](KVStoreBaseResponse.md#error) | [packages/codeboltjs/src/types/kvStore.ts:12](packages/codeboltjs/src/types/kvStore.ts#L12) |
| <a id="message"></a> `message?` | `string` | - | [`KVStoreBaseResponse`](KVStoreBaseResponse).[`message`](KVStoreBaseResponse.md#message) | [packages/codeboltjs/src/types/kvStore.ts:11](packages/codeboltjs/src/types/kvStore.ts#L11) |
| <a id="requestid"></a> `requestId` | `string` | - | [`KVStoreBaseResponse`](KVStoreBaseResponse).[`requestId`](KVStoreBaseResponse.md#requestid) | [packages/codeboltjs/src/types/kvStore.ts:14](packages/codeboltjs/src/types/kvStore.ts#L14) |
| <a id="success"></a> `success` | `boolean` | - | [`KVStoreBaseResponse`](KVStoreBaseResponse).[`success`](KVStoreBaseResponse.md#success) | [packages/codeboltjs/src/types/kvStore.ts:9](packages/codeboltjs/src/types/kvStore.ts#L9) |
| <a id="timestamp"></a> `timestamp` | `string` | - | [`KVStoreBaseResponse`](KVStoreBaseResponse).[`timestamp`](KVStoreBaseResponse.md#timestamp) | [packages/codeboltjs/src/types/kvStore.ts:13](packages/codeboltjs/src/types/kvStore.ts#L13) |
| <a id="type"></a> `type` | `string` | - | [`KVStoreBaseResponse`](KVStoreBaseResponse).[`type`](KVStoreBaseResponse.md#type) | [packages/codeboltjs/src/types/kvStore.ts:8](packages/codeboltjs/src/types/kvStore.ts#L8) |
