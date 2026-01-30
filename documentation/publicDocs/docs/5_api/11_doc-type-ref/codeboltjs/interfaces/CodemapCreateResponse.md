---
title: CodemapCreateResponse
---

[**@codebolt/codeboltjs**](../index)

***

# Interface: CodemapCreateResponse

Defined in: packages/codeboltjs/src/types/codemap.ts:88

## Extends

- `CodemapBaseResponse`

## Properties

| Property | Type | Inherited from | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="code"></a> `code?` | `string` | `CodemapBaseResponse.code` | [packages/codeboltjs/src/types/codemap.ts:66](packages/codeboltjs/src/types/codemap.ts#L66) |
| <a id="data"></a> `data?` | \{ `codemap`: [`CodemapInfo`](CodemapInfo); \} | - | [packages/codeboltjs/src/types/codemap.ts:89](packages/codeboltjs/src/types/codemap.ts#L89) |
| `data.codemap` | [`CodemapInfo`](CodemapInfo) | - | [packages/codeboltjs/src/types/codemap.ts:90](packages/codeboltjs/src/types/codemap.ts#L90) |
| <a id="error"></a> `error?` | \{ `code`: `string`; `details?`: `any`; `message`: `string`; \} | `CodemapBaseResponse.error` | [packages/codeboltjs/src/types/codemap.ts:68](packages/codeboltjs/src/types/codemap.ts#L68) |
| `error.code` | `string` | - | [packages/codeboltjs/src/types/codemap.ts:69](packages/codeboltjs/src/types/codemap.ts#L69) |
| `error.details?` | `any` | - | [packages/codeboltjs/src/types/codemap.ts:71](packages/codeboltjs/src/types/codemap.ts#L71) |
| `error.message` | `string` | - | [packages/codeboltjs/src/types/codemap.ts:70](packages/codeboltjs/src/types/codemap.ts#L70) |
| <a id="message"></a> `message?` | `string` | `CodemapBaseResponse.message` | [packages/codeboltjs/src/types/codemap.ts:67](packages/codeboltjs/src/types/codemap.ts#L67) |
| <a id="success"></a> `success` | `boolean` | `CodemapBaseResponse.success` | [packages/codeboltjs/src/types/codemap.ts:65](packages/codeboltjs/src/types/codemap.ts#L65) |
