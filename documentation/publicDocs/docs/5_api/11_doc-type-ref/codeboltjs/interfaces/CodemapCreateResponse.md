---
title: CodemapCreateResponse
---

[**@codebolt/codeboltjs**](../README)

***

# Interface: CodemapCreateResponse

Defined in: [packages/codeboltjs/src/types/codemap.ts:88](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/codemap.ts#L88)

## Extends

- `CodemapBaseResponse`

## Properties

| Property | Type | Inherited from | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="code"></a> `code?` | `string` | `CodemapBaseResponse.code` | [packages/codeboltjs/src/types/codemap.ts:66](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/codemap.ts#L66) |
| <a id="data"></a> `data?` | \{ `codemap`: [`CodemapInfo`](CodemapInfo); \} | - | [packages/codeboltjs/src/types/codemap.ts:89](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/codemap.ts#L89) |
| `data.codemap` | [`CodemapInfo`](CodemapInfo) | - | [packages/codeboltjs/src/types/codemap.ts:90](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/codemap.ts#L90) |
| <a id="error"></a> `error?` | \{ `code`: `string`; `details?`: `any`; `message`: `string`; \} | `CodemapBaseResponse.error` | [packages/codeboltjs/src/types/codemap.ts:68](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/codemap.ts#L68) |
| `error.code` | `string` | - | [packages/codeboltjs/src/types/codemap.ts:69](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/codemap.ts#L69) |
| `error.details?` | `any` | - | [packages/codeboltjs/src/types/codemap.ts:71](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/codemap.ts#L71) |
| `error.message` | `string` | - | [packages/codeboltjs/src/types/codemap.ts:70](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/codemap.ts#L70) |
| <a id="message"></a> `message?` | `string` | `CodemapBaseResponse.message` | [packages/codeboltjs/src/types/codemap.ts:67](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/codemap.ts#L67) |
| <a id="success"></a> `success` | `boolean` | `CodemapBaseResponse.success` | [packages/codeboltjs/src/types/codemap.ts:65](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/codemap.ts#L65) |
