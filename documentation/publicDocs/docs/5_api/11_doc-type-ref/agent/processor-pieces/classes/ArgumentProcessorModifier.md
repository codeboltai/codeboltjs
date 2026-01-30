---
title: ArgumentProcessorModifier
---

[**@codebolt/agent**](../../README)

***

# Class: ArgumentProcessorModifier

Defined in: [packages/agent/src/processor-pieces/messageModifiers/argumentProcessorModifier.ts:11](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/processor-pieces/messageModifiers/argumentProcessorModifier.ts#L11)

## Extends

- `BaseMessageModifier`

## Constructors

### Constructor

```ts
new ArgumentProcessorModifier(options: ArgumentProcessorOptions): ArgumentProcessorModifier;
```

Defined in: [packages/agent/src/processor-pieces/messageModifiers/argumentProcessorModifier.ts:14](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/processor-pieces/messageModifiers/argumentProcessorModifier.ts#L14)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`ArgumentProcessorOptions`](../interfaces/ArgumentProcessorOptions) |

#### Returns

`ArgumentProcessorModifier`

#### Overrides

```ts
BaseMessageModifier.constructor
```

## Properties

| Property | Modifier | Type | Default value | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="context"></a> `context` | `protected` | `Record`\<`string`, `unknown`\> | `{}` | `BaseMessageModifier.context` | [packages/agent/src/processor-pieces/base/baseMessageModifier.ts:16](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/processor-pieces/base/baseMessageModifier.ts#L16) |

## Methods

### modify()

```ts
modify(_originalRequest: FlatUserMessage, createdMessage: ProcessedMessage): Promise<ProcessedMessage>;
```

Defined in: [packages/agent/src/processor-pieces/messageModifiers/argumentProcessorModifier.ts:23](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/processor-pieces/messageModifiers/argumentProcessorModifier.ts#L23)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `_originalRequest` | `FlatUserMessage` |
| `createdMessage` | `ProcessedMessage` |

#### Returns

`Promise`\<`ProcessedMessage`\>

#### Overrides

```ts
BaseMessageModifier.modify
```
