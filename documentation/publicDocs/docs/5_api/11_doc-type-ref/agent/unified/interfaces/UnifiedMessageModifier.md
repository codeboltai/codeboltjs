---
title: UnifiedMessageModifier
---

[**@codebolt/agent**](../../README)

***

# Interface: UnifiedMessageModifier

Defined in: [packages/agent/src/unified/types/types.ts:174](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/types.ts#L174)

Unified message modifier interface

## Methods

### addProcessor()

```ts
addProcessor(processor: Processor): void;
```

Defined in: [packages/agent/src/unified/types/types.ts:178](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/types.ts#L178)

Add a processor to the modifier

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `processor` | `Processor` |

#### Returns

`void`

***

### clearContext()

```ts
clearContext(): void;
```

Defined in: [packages/agent/src/unified/types/types.ts:184](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/types.ts#L184)

Clear all context

#### Returns

`void`

***

### getContext()

```ts
getContext(key: string): any;
```

Defined in: [packages/agent/src/unified/types/types.ts:182](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/types.ts#L182)

Get context value

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `key` | `string` |

#### Returns

`any`

***

### processMessage()

```ts
processMessage(input: any): Promise<UnifiedMessageOutput>;
```

Defined in: [packages/agent/src/unified/types/types.ts:176](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/types.ts#L176)

Process and modify input messages

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | `any` |

#### Returns

`Promise`\<[`UnifiedMessageOutput`](UnifiedMessageOutput)\>

***

### setContext()

```ts
setContext(key: string, value: any): void;
```

Defined in: [packages/agent/src/unified/types/types.ts:180](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/types/types.ts#L180)

Set context value

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `key` | `string` |
| `value` | `any` |

#### Returns

`void`
