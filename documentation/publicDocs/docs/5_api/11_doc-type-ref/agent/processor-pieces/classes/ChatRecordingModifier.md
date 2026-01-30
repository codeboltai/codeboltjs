---
title: ChatRecordingModifier
---

[**@codebolt/agent**](../../README)

***

# Class: ChatRecordingModifier

Defined in: [packages/agent/src/processor-pieces/messageModifiers/chatRecordingModifier.ts:24](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/processor-pieces/messageModifiers/chatRecordingModifier.ts#L24)

## Extends

- `BaseMessageModifier`

## Constructors

### Constructor

```ts
new ChatRecordingModifier(options: ChatRecordingOptions): ChatRecordingModifier;
```

Defined in: [packages/agent/src/processor-pieces/messageModifiers/chatRecordingModifier.ts:28](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/processor-pieces/messageModifiers/chatRecordingModifier.ts#L28)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`ChatRecordingOptions`](../interfaces/ChatRecordingOptions) |

#### Returns

`ChatRecordingModifier`

#### Overrides

```ts
BaseMessageModifier.constructor
```

## Properties

| Property | Modifier | Type | Default value | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="context"></a> `context` | `protected` | `Record`\<`string`, `unknown`\> | `{}` | `BaseMessageModifier.context` | [packages/agent/src/processor-pieces/base/baseMessageModifier.ts:16](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/processor-pieces/base/baseMessageModifier.ts#L16) |

## Methods

### getRecordingFile()

```ts
getRecordingFile(): string | undefined;
```

Defined in: [packages/agent/src/processor-pieces/messageModifiers/chatRecordingModifier.ts:163](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/processor-pieces/messageModifiers/chatRecordingModifier.ts#L163)

#### Returns

`string` \| `undefined`

***

### isRecording()

```ts
isRecording(): boolean;
```

Defined in: [packages/agent/src/processor-pieces/messageModifiers/chatRecordingModifier.ts:167](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/processor-pieces/messageModifiers/chatRecordingModifier.ts#L167)

#### Returns

`boolean`

***

### modify()

```ts
modify(originalRequest: FlatUserMessage, createdMessage: ProcessedMessage): Promise<ProcessedMessage>;
```

Defined in: [packages/agent/src/processor-pieces/messageModifiers/chatRecordingModifier.ts:43](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/processor-pieces/messageModifiers/chatRecordingModifier.ts#L43)

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

### startRecording()

```ts
startRecording(customPath?: string): void;
```

Defined in: [packages/agent/src/processor-pieces/messageModifiers/chatRecordingModifier.ts:147](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/processor-pieces/messageModifiers/chatRecordingModifier.ts#L147)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `customPath?` | `string` |

#### Returns

`void`

***

### stopRecording()

```ts
stopRecording(): void;
```

Defined in: [packages/agent/src/processor-pieces/messageModifiers/chatRecordingModifier.ts:155](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/processor-pieces/messageModifiers/chatRecordingModifier.ts#L155)

#### Returns

`void`
