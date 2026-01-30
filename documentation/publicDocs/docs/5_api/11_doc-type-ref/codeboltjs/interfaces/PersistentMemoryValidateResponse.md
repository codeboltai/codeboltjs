---
title: PersistentMemoryValidateResponse
---

[**@codebolt/codeboltjs**](../index)

***

# Interface: PersistentMemoryValidateResponse

Defined in: packages/codeboltjs/src/types/persistentMemory.ts:96

Persistent Memory Types
Type definitions for persistent memory operations

## Extends

- [`PersistentMemoryBaseResponse`](PersistentMemoryBaseResponse)

## Properties

| Property | Type | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="data"></a> `data?` | \{ `validation`: \{ `errors?`: `string`[]; `valid`: `boolean`; \}; \} | [`PersistentMemoryBaseResponse`](PersistentMemoryBaseResponse).[`data`](PersistentMemoryBaseResponse.md#data) | - | [packages/codeboltjs/src/types/persistentMemory.ts:97](packages/codeboltjs/src/types/persistentMemory.ts#L97) |
| `data.validation` | \{ `errors?`: `string`[]; `valid`: `boolean`; \} | - | - | [packages/codeboltjs/src/types/persistentMemory.ts:97](packages/codeboltjs/src/types/persistentMemory.ts#L97) |
| `data.validation.errors?` | `string`[] | - | - | [packages/codeboltjs/src/types/persistentMemory.ts:97](packages/codeboltjs/src/types/persistentMemory.ts#L97) |
| `data.validation.valid` | `boolean` | - | - | [packages/codeboltjs/src/types/persistentMemory.ts:97](packages/codeboltjs/src/types/persistentMemory.ts#L97) |
| <a id="error"></a> `error?` | `string` | - | [`PersistentMemoryBaseResponse`](PersistentMemoryBaseResponse).[`error`](PersistentMemoryBaseResponse.md#error) | [packages/codeboltjs/src/types/persistentMemory.ts:11](packages/codeboltjs/src/types/persistentMemory.ts#L11) |
| <a id="message"></a> `message?` | `string` | - | [`PersistentMemoryBaseResponse`](PersistentMemoryBaseResponse).[`message`](PersistentMemoryBaseResponse.md#message) | [packages/codeboltjs/src/types/persistentMemory.ts:10](packages/codeboltjs/src/types/persistentMemory.ts#L10) |
| <a id="requestid"></a> `requestId` | `string` | - | [`PersistentMemoryBaseResponse`](PersistentMemoryBaseResponse).[`requestId`](PersistentMemoryBaseResponse.md#requestid) | [packages/codeboltjs/src/types/persistentMemory.ts:13](packages/codeboltjs/src/types/persistentMemory.ts#L13) |
| <a id="success"></a> `success` | `boolean` | - | [`PersistentMemoryBaseResponse`](PersistentMemoryBaseResponse).[`success`](PersistentMemoryBaseResponse.md#success) | [packages/codeboltjs/src/types/persistentMemory.ts:8](packages/codeboltjs/src/types/persistentMemory.ts#L8) |
| <a id="timestamp"></a> `timestamp` | `string` | - | [`PersistentMemoryBaseResponse`](PersistentMemoryBaseResponse).[`timestamp`](PersistentMemoryBaseResponse.md#timestamp) | [packages/codeboltjs/src/types/persistentMemory.ts:12](packages/codeboltjs/src/types/persistentMemory.ts#L12) |
| <a id="type"></a> `type` | `string` | - | [`PersistentMemoryBaseResponse`](PersistentMemoryBaseResponse).[`type`](PersistentMemoryBaseResponse.md#type) | [packages/codeboltjs/src/types/persistentMemory.ts:7](packages/codeboltjs/src/types/persistentMemory.ts#L7) |
