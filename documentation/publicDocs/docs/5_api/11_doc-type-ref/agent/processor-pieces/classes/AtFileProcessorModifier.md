---
title: AtFileProcessorModifier
---

[**@codebolt/agent**](../../README)

***

# Class: AtFileProcessorModifier

Defined in: [packages/agent/src/processor-pieces/messageModifiers/atFileProcessorModifier.ts:14](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/processor-pieces/messageModifiers/atFileProcessorModifier.ts#L14)

## Extends

- `BaseMessageModifier`

## Constructors

### Constructor

```ts
new AtFileProcessorModifier(options: AtFileProcessorOptions): AtFileProcessorModifier;
```

Defined in: [packages/agent/src/processor-pieces/messageModifiers/atFileProcessorModifier.ts:17](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/processor-pieces/messageModifiers/atFileProcessorModifier.ts#L17)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`AtFileProcessorOptions`](../interfaces/AtFileProcessorOptions) |

#### Returns

`AtFileProcessorModifier`

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
modify(originalRequest: FlatUserMessage, createdMessage: ProcessedMessage): Promise<ProcessedMessage>;
```

Defined in: [packages/agent/src/processor-pieces/messageModifiers/atFileProcessorModifier.ts:26](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/processor-pieces/messageModifiers/atFileProcessorModifier.ts#L26)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `originalRequest` | `FlatUserMessage` |
| `createdMessage` | `ProcessedMessage` |

#### Returns

`Promise`\<`ProcessedMessage`\>

#### Overrides

```ts
BaseMessageModifier.modify
```
