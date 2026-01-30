---
title: ProviderTransport
---

[**@codebolt/provider**](../README)

***

# Interface: ProviderTransport

Defined in: [ProviderTypes.ts:60](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/provider/src/lib/ProviderTypes.ts#L60)

## Methods

### ensureTransportConnection()

```ts
ensureTransportConnection(initVars: ProviderInitVars): Promise<void>;
```

Defined in: [ProviderTypes.ts:61](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/provider/src/lib/ProviderTypes.ts#L61)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `initVars` | `ProviderInitVars` |

#### Returns

`Promise`\<`void`\>

***

### sendToAgentServer()

```ts
sendToAgentServer(message: AgentStartMessage | RawMessageForAgent): Promise<boolean>;
```

Defined in: [ProviderTypes.ts:62](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/provider/src/lib/ProviderTypes.ts#L62)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `AgentStartMessage` \| `RawMessageForAgent` |

#### Returns

`Promise`\<`boolean`\>
