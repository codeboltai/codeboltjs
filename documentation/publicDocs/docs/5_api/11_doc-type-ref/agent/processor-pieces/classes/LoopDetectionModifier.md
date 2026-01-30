[**@codebolt/agent**](../../README.md)

***

# Class: LoopDetectionModifier

Defined in: [packages/agent/src/processor-pieces/postInferenceProcessors/loopDetectionModifier.ts:18](packages/agent/src/processor-pieces/postInferenceProcessors/loopDetectionModifier.ts#L18)

## Extends

- `BasePostInferenceProcessor`

## Constructors

### Constructor

```ts
new LoopDetectionModifier(options: LoopDetectionOptions): LoopDetectionModifier;
```

Defined in: [packages/agent/src/processor-pieces/postInferenceProcessors/loopDetectionModifier.ts:23](packages/agent/src/processor-pieces/postInferenceProcessors/loopDetectionModifier.ts#L23)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`LoopDetectionOptions`](../interfaces/LoopDetectionOptions.md) |

#### Returns

`LoopDetectionModifier`

#### Overrides

```ts
BasePostInferenceProcessor.constructor
```

## Properties

| Property | Modifier | Type | Default value | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="context"></a> `context` | `protected` | `Record`\<`string`, `unknown`\> | `{}` | `BasePostInferenceProcessor.context` | [packages/agent/src/processor-pieces/base/basePostInferenceProcessor.ts:16](packages/agent/src/processor-pieces/base/basePostInferenceProcessor.ts#L16) |

## Methods

### getMessageHistory()

```ts
getMessageHistory(): MessageHistory[];
```

Defined in: [packages/agent/src/processor-pieces/postInferenceProcessors/loopDetectionModifier.ts:232](packages/agent/src/processor-pieces/postInferenceProcessors/loopDetectionModifier.ts#L232)

#### Returns

`MessageHistory`[]

***

### modify()

```ts
modify(
   llmMessageSent: ProcessedMessage, 
   llmResponseMessage: LLMResponse, 
nextPrompt: ProcessedMessage): Promise<ProcessedMessage>;
```

Defined in: [packages/agent/src/processor-pieces/postInferenceProcessors/loopDetectionModifier.ts:33](packages/agent/src/processor-pieces/postInferenceProcessors/loopDetectionModifier.ts#L33)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `llmMessageSent` | `ProcessedMessage` |
| `llmResponseMessage` | `LLMResponse` |
| `nextPrompt` | `ProcessedMessage` |

#### Returns

`Promise`\<`ProcessedMessage`\>

#### Overrides

```ts
BasePostInferenceProcessor.modify
```

***

### resetLoopDetection()

```ts
resetLoopDetection(): void;
```

Defined in: [packages/agent/src/processor-pieces/postInferenceProcessors/loopDetectionModifier.ts:227](packages/agent/src/processor-pieces/postInferenceProcessors/loopDetectionModifier.ts#L227)

#### Returns

`void`
