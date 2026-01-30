---
title: EvaluateRulesResponse
---

[**@codebolt/codeboltjs**](../index)

***

# Interface: EvaluateRulesResponse

Defined in: packages/codeboltjs/src/types/contextRuleEngine.ts:106

Context Rule Engine Types
Type definitions for context rule engine operations

## Extends

- [`ContextRuleEngineBaseResponse`](ContextRuleEngineBaseResponse)

## Properties

| Property | Type | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="data"></a> `data?` | \{ `excluded_memories`: `string`[]; `forced_memories`: `string`[]; `included_memories`: `string`[]; `matched_rules`: `string`[]; \} | [`ContextRuleEngineBaseResponse`](ContextRuleEngineBaseResponse).[`data`](ContextRuleEngineBaseResponse.md#data) | - | [packages/codeboltjs/src/types/contextRuleEngine.ts:107](packages/codeboltjs/src/types/contextRuleEngine.ts#L107) |
| `data.excluded_memories` | `string`[] | - | - | [packages/codeboltjs/src/types/contextRuleEngine.ts:109](packages/codeboltjs/src/types/contextRuleEngine.ts#L109) |
| `data.forced_memories` | `string`[] | - | - | [packages/codeboltjs/src/types/contextRuleEngine.ts:111](packages/codeboltjs/src/types/contextRuleEngine.ts#L111) |
| `data.included_memories` | `string`[] | - | - | [packages/codeboltjs/src/types/contextRuleEngine.ts:110](packages/codeboltjs/src/types/contextRuleEngine.ts#L110) |
| `data.matched_rules` | `string`[] | - | - | [packages/codeboltjs/src/types/contextRuleEngine.ts:108](packages/codeboltjs/src/types/contextRuleEngine.ts#L108) |
| <a id="error"></a> `error?` | `string` | - | [`ContextRuleEngineBaseResponse`](ContextRuleEngineBaseResponse).[`error`](ContextRuleEngineBaseResponse.md#error) | [packages/codeboltjs/src/types/contextRuleEngine.ts:11](packages/codeboltjs/src/types/contextRuleEngine.ts#L11) |
| <a id="message"></a> `message?` | `string` | - | [`ContextRuleEngineBaseResponse`](ContextRuleEngineBaseResponse).[`message`](ContextRuleEngineBaseResponse.md#message) | [packages/codeboltjs/src/types/contextRuleEngine.ts:10](packages/codeboltjs/src/types/contextRuleEngine.ts#L10) |
| <a id="requestid"></a> `requestId` | `string` | - | [`ContextRuleEngineBaseResponse`](ContextRuleEngineBaseResponse).[`requestId`](ContextRuleEngineBaseResponse.md#requestid) | [packages/codeboltjs/src/types/contextRuleEngine.ts:13](packages/codeboltjs/src/types/contextRuleEngine.ts#L13) |
| <a id="success"></a> `success` | `boolean` | - | [`ContextRuleEngineBaseResponse`](ContextRuleEngineBaseResponse).[`success`](ContextRuleEngineBaseResponse.md#success) | [packages/codeboltjs/src/types/contextRuleEngine.ts:8](packages/codeboltjs/src/types/contextRuleEngine.ts#L8) |
| <a id="timestamp"></a> `timestamp` | `string` | - | [`ContextRuleEngineBaseResponse`](ContextRuleEngineBaseResponse).[`timestamp`](ContextRuleEngineBaseResponse.md#timestamp) | [packages/codeboltjs/src/types/contextRuleEngine.ts:12](packages/codeboltjs/src/types/contextRuleEngine.ts#L12) |
| <a id="type"></a> `type` | `string` | - | [`ContextRuleEngineBaseResponse`](ContextRuleEngineBaseResponse).[`type`](ContextRuleEngineBaseResponse.md#type) | [packages/codeboltjs/src/types/contextRuleEngine.ts:7](packages/codeboltjs/src/types/contextRuleEngine.ts#L7) |
