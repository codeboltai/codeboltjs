[**@codebolt/agent**](../../README.md)

***

# Class: DirectoryContextModifier

Defined in: [packages/agent/src/processor-pieces/messageModifiers/directoryContextModifier.ts:66](packages/agent/src/processor-pieces/messageModifiers/directoryContextModifier.ts#L66)

## Extends

- `BaseMessageModifier`

## Constructors

### Constructor

```ts
new DirectoryContextModifier(options: DirectoryContextOptions): DirectoryContextModifier;
```

Defined in: [packages/agent/src/processor-pieces/messageModifiers/directoryContextModifier.ts:71](packages/agent/src/processor-pieces/messageModifiers/directoryContextModifier.ts#L71)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`DirectoryContextOptions`](../interfaces/DirectoryContextOptions.md) |

#### Returns

`DirectoryContextModifier`

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

Defined in: [packages/agent/src/processor-pieces/messageModifiers/directoryContextModifier.ts:78](packages/agent/src/processor-pieces/messageModifiers/directoryContextModifier.ts#L78)

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
