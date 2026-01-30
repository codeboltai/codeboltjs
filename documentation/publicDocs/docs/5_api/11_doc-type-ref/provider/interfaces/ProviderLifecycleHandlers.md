---
title: ProviderLifecycleHandlers
---

[**@codebolt/provider**](../README)

***

# Interface: ProviderLifecycleHandlers

Defined in: [ProviderTypes.ts:51](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/provider/src/lib/ProviderTypes.ts#L51)

## Methods

### onCloseSignal()

```ts
onCloseSignal(): Promise<void>;
```

Defined in: [ProviderTypes.ts:56](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/provider/src/lib/ProviderTypes.ts#L56)

#### Returns

`Promise`\<`void`\>

***

### onGetDiffFiles()

```ts
onGetDiffFiles(): Promise<any>;
```

Defined in: [ProviderTypes.ts:55](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/provider/src/lib/ProviderTypes.ts#L55)

#### Returns

`Promise`\<`any`\>

***

### onProviderAgentStart()

```ts
onProviderAgentStart(message: AgentStartMessage): Promise<void>;
```

Defined in: [ProviderTypes.ts:53](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/provider/src/lib/ProviderTypes.ts#L53)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `AgentStartMessage` |

#### Returns

`Promise`\<`void`\>

***

### onProviderStart()

```ts
onProviderStart(initVars: ProviderInitVars): Promise<ProviderStartResult>;
```

Defined in: [ProviderTypes.ts:52](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/provider/src/lib/ProviderTypes.ts#L52)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `initVars` | `ProviderInitVars` |

#### Returns

`Promise`\<[`ProviderStartResult`](ProviderStartResult)\>

***

### onProviderStop()

```ts
onProviderStop(initVars: ProviderInitVars): Promise<void>;
```

Defined in: [ProviderTypes.ts:54](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/provider/src/lib/ProviderTypes.ts#L54)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `initVars` | `ProviderInitVars` |

#### Returns

`Promise`\<`void`\>

***

### onRawMessage()

```ts
onRawMessage(message: RawMessageForAgent): Promise<void>;
```

Defined in: [ProviderTypes.ts:57](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/provider/src/lib/ProviderTypes.ts#L57)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `RawMessageForAgent` |

#### Returns

`Promise`\<`void`\>
