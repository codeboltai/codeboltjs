---
title: ProviderEventHandlers
---

[**@codebolt/provider**](../README)

***

# Interface: ProviderEventHandlers

Defined in: [ProviderTypes.ts:65](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/provider/src/lib/ProviderTypes.ts#L65)

## Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="onclosesignal"></a> `onCloseSignal` | () => `Promise`\<`void`\> | [ProviderTypes.ts:70](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/provider/src/lib/ProviderTypes.ts#L70) |
| <a id="ongetdifffiles"></a> `onGetDiffFiles` | () => `Promise`\<`any`\> | [ProviderTypes.ts:69](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/provider/src/lib/ProviderTypes.ts#L69) |
| <a id="onprovideragentstart"></a> `onProviderAgentStart` | (`message`: `AgentStartMessage`) => `Promise`\<`void`\> | [ProviderTypes.ts:67](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/provider/src/lib/ProviderTypes.ts#L67) |
| <a id="onproviderstart"></a> `onProviderStart` | (`vars`: `ProviderInitVars`) => `Promise`\<[`ProviderStartResult`](ProviderStartResult)\> | [ProviderTypes.ts:66](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/provider/src/lib/ProviderTypes.ts#L66) |
| <a id="onproviderstop"></a> `onProviderStop` | (`vars`: `ProviderInitVars`) => `Promise`\<`void`\> | [ProviderTypes.ts:68](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/provider/src/lib/ProviderTypes.ts#L68) |
| <a id="onrawmessage"></a> `onRawMessage` | (`message`: `RawMessageForAgent`) => `Promise`\<`void`\> | [ProviderTypes.ts:71](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/provider/src/lib/ProviderTypes.ts#L71) |
