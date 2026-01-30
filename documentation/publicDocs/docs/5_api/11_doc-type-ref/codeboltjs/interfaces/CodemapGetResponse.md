---
title: CodemapGetResponse
---

[**@codebolt/codeboltjs**](../index)

***

# Interface: CodemapGetResponse

Defined in: packages/codeboltjs/src/types/codemap.ts:82

## Extends

- `CodemapBaseResponse`

## Properties

| Property | Type | Inherited from | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="code"></a> `code?` | `string` | `CodemapBaseResponse.code` | [packages/codeboltjs/src/types/codemap.ts:66](packages/codeboltjs/src/types/codemap.ts#L66) |
| <a id="data"></a> `data?` | \{ `codemap`: [`Codemap`](Codemap) \| [`CodemapInfo`](CodemapInfo); \} | - | [packages/codeboltjs/src/types/codemap.ts:83](packages/codeboltjs/src/types/codemap.ts#L83) |
| `data.codemap` | [`Codemap`](Codemap) \| [`CodemapInfo`](CodemapInfo) | - | [packages/codeboltjs/src/types/codemap.ts:84](packages/codeboltjs/src/types/codemap.ts#L84) |
| <a id="error"></a> `error?` | \{ `code`: `string`; `details?`: `any`; `message`: `string`; \} | `CodemapBaseResponse.error` | [packages/codeboltjs/src/types/codemap.ts:68](packages/codeboltjs/src/types/codemap.ts#L68) |
| `error.code` | `string` | - | [packages/codeboltjs/src/types/codemap.ts:69](packages/codeboltjs/src/types/codemap.ts#L69) |
| `error.details?` | `any` | - | [packages/codeboltjs/src/types/codemap.ts:71](packages/codeboltjs/src/types/codemap.ts#L71) |
| `error.message` | `string` | - | [packages/codeboltjs/src/types/codemap.ts:70](packages/codeboltjs/src/types/codemap.ts#L70) |
| <a id="message"></a> `message?` | `string` | `CodemapBaseResponse.message` | [packages/codeboltjs/src/types/codemap.ts:67](packages/codeboltjs/src/types/codemap.ts#L67) |
| <a id="success"></a> `success` | `boolean` | `CodemapBaseResponse.success` | [packages/codeboltjs/src/types/codemap.ts:65](packages/codeboltjs/src/types/codemap.ts#L65) |
