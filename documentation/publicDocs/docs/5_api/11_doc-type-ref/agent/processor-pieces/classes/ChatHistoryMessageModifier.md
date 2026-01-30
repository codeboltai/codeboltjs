---
title: ChatHistoryMessageModifier
---

[**@codebolt/agent**](../../README)

***

# Class: ChatHistoryMessageModifier

Defined in: [packages/agent/src/processor-pieces/messageModifiers/chatHistoryMessageModifier.ts:15](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/processor-pieces/messageModifiers/chatHistoryMessageModifier.ts#L15)

## Extends

- `BaseMessageModifier`

## Constructors

### Constructor

```ts
new ChatHistoryMessageModifier(options: ChatHistoryMessageModifierOptions): ChatHistoryMessageModifier;
```

Defined in: [packages/agent/src/processor-pieces/messageModifiers/chatHistoryMessageModifier.ts:20](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/processor-pieces/messageModifiers/chatHistoryMessageModifier.ts#L20)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`ChatHistoryMessageModifierOptions`](../interfaces/ChatHistoryMessageModifierOptions) |

#### Returns

`ChatHistoryMessageModifier`

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

Defined in: [packages/agent/src/processor-pieces/messageModifiers/chatHistoryMessageModifier.ts:27](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/processor-pieces/messageModifiers/chatHistoryMessageModifier.ts#L27)

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

***

### setMaxHistoryMessages()

```ts
setMaxHistoryMessages(max: number): void;
```

Defined in: [packages/agent/src/processor-pieces/messageModifiers/chatHistoryMessageModifier.ts:126](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/processor-pieces/messageModifiers/chatHistoryMessageModifier.ts#L126)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `max` | `number` |

#### Returns

`void`
