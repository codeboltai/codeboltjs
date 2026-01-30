[**@codebolt/agent**](../../README.md)

***

# Class: CoreSystemPromptModifier

Defined in: [packages/agent/src/processor-pieces/messageModifiers/coreSystemPromptModifier.ts:10](packages/agent/src/processor-pieces/messageModifiers/coreSystemPromptModifier.ts#L10)

## Extends

- `BaseMessageModifier`

## Constructors

### Constructor

```ts
new CoreSystemPromptModifier(options: CoreSystemPromptOptions): CoreSystemPromptModifier;
```

Defined in: [packages/agent/src/processor-pieces/messageModifiers/coreSystemPromptModifier.ts:13](packages/agent/src/processor-pieces/messageModifiers/coreSystemPromptModifier.ts#L13)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`CoreSystemPromptOptions`](../interfaces/CoreSystemPromptOptions.md) |

#### Returns

`CoreSystemPromptModifier`

#### Overrides

```ts
BaseMessageModifier.constructor
```

## Properties

| Property | Modifier | Type | Default value | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="context"></a> `context` | `protected` | `Record`\<`string`, `unknown`\> | `{}` | `BaseMessageModifier.context` | [packages/agent/src/processor-pieces/base/baseMessageModifier.ts:16](packages/agent/src/processor-pieces/base/baseMessageModifier.ts#L16) |

## Methods

### modify()

```ts
modify(_originalRequest: FlatUserMessage, createdMessage: ProcessedMessage): Promise<ProcessedMessage>;
```

Defined in: [packages/agent/src/processor-pieces/messageModifiers/coreSystemPromptModifier.ts:18](packages/agent/src/processor-pieces/messageModifiers/coreSystemPromptModifier.ts#L18)

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
