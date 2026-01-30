[**@codebolt/agent**](../../README.md)

***

# Class: ShellProcessorModifier

Defined in: [packages/agent/src/processor-pieces/postToolCallProcessors/shellProcessorModifier.ts:15](packages/agent/src/processor-pieces/postToolCallProcessors/shellProcessorModifier.ts#L15)

## Extends

- `BasePostToolCallProcessor`

## Constructors

### Constructor

```ts
new ShellProcessorModifier(options: ShellProcessorOptions): ShellProcessorModifier;
```

Defined in: [packages/agent/src/processor-pieces/postToolCallProcessors/shellProcessorModifier.ts:22](packages/agent/src/processor-pieces/postToolCallProcessors/shellProcessorModifier.ts#L22)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | `ShellProcessorOptions` |

#### Returns

`ShellProcessorModifier`

#### Overrides

```ts
BasePostToolCallProcessor.constructor
```

## Properties

| Property | Modifier | Type | Default value | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="context"></a> `context` | `protected` | `Record`\<`string`, `unknown`\> | `{}` | `BasePostToolCallProcessor.context` | [packages/agent/src/processor-pieces/base/basePostToolCallProcessor.ts:16](packages/agent/src/processor-pieces/base/basePostToolCallProcessor.ts#L16) |

## Methods

### clearContext()

```ts
clearContext(): void;
```

Defined in: [packages/agent/src/processor-pieces/base/basePostToolCallProcessor.ts:32](packages/agent/src/processor-pieces/base/basePostToolCallProcessor.ts#L32)

#### Returns

`void`

#### Inherited from

```ts
BasePostToolCallProcessor.clearContext
```

***

### getContext()

```ts
getContext(key: string): unknown;
```

Defined in: [packages/agent/src/processor-pieces/base/basePostToolCallProcessor.ts:28](packages/agent/src/processor-pieces/base/basePostToolCallProcessor.ts#L28)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `key` | `string` |

#### Returns

`unknown`

#### Inherited from

```ts
BasePostToolCallProcessor.getContext
```

***

### modify()

```ts
modify(input: PostToolCallProcessorInput): Promise<PostToolCallProcessorOutput>;
```

Defined in: [packages/agent/src/processor-pieces/postToolCallProcessors/shellProcessorModifier.ts:33](packages/agent/src/processor-pieces/postToolCallProcessors/shellProcessorModifier.ts#L33)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | `PostToolCallProcessorInput` |

#### Returns

`Promise`\<`PostToolCallProcessorOutput`\>

#### Overrides

```ts
BasePostToolCallProcessor.modify
```

***

### setContext()

```ts
setContext(key: string, value: unknown): void;
```

Defined in: [packages/agent/src/processor-pieces/base/basePostToolCallProcessor.ts:24](packages/agent/src/processor-pieces/base/basePostToolCallProcessor.ts#L24)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `key` | `string` |
| `value` | `unknown` |

#### Returns

`void`

#### Inherited from

```ts
BasePostToolCallProcessor.setContext
```
