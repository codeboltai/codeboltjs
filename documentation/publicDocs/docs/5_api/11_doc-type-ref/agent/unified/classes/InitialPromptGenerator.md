[**@codebolt/agent**](../../README.md)

***

# Class: InitialPromptGenerator

Defined in: [packages/agent/src/unified/base/initialPromptGenerator.ts:13](packages/agent/src/unified/base/initialPromptGenerator.ts#L13)

Initial prompt generator that combines message modifiers with unified processing

## Implements

- `InitialPromptGeneratorInterface`

## Constructors

### Constructor

```ts
new InitialPromptGenerator(options: {
  baseSystemPrompt?: string;
  enableLogging?: boolean;
  metaData?: Record<string, unknown>;
  processors?: MessageModifier[];
  templating?: boolean;
}): InitialPromptGenerator;
```

Defined in: [packages/agent/src/unified/base/initialPromptGenerator.ts:19](packages/agent/src/unified/base/initialPromptGenerator.ts#L19)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | \{ `baseSystemPrompt?`: `string`; `enableLogging?`: `boolean`; `metaData?`: `Record`\<`string`, `unknown`\>; `processors?`: `MessageModifier`[]; `templating?`: `boolean`; \} |
| `options.baseSystemPrompt?` | `string` |
| `options.enableLogging?` | `boolean` |
| `options.metaData?` | `Record`\<`string`, `unknown`\> |
| `options.processors?` | `MessageModifier`[] |
| `options.templating?` | `boolean` |

#### Returns

`InitialPromptGenerator`

## Methods

### clearMetaData()

```ts
clearMetaData(): void;
```

Defined in: [packages/agent/src/unified/base/initialPromptGenerator.ts:140](packages/agent/src/unified/base/initialPromptGenerator.ts#L140)

Clear all context

#### Returns

`void`

#### Implementation of

```ts
InitialPromptGeneratorInterface.clearMetaData
```

***

### getMetaData()

```ts
getMetaData(key: string): unknown;
```

Defined in: [packages/agent/src/unified/base/initialPromptGenerator.ts:133](packages/agent/src/unified/base/initialPromptGenerator.ts#L133)

Get context value

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `key` | `string` |

#### Returns

`unknown`

#### Implementation of

```ts
InitialPromptGeneratorInterface.getMetaData
```

***

### getProcessors()

```ts
getProcessors(): MessageModifier[];
```

Defined in: [packages/agent/src/unified/base/initialPromptGenerator.ts:151](packages/agent/src/unified/base/initialPromptGenerator.ts#L151)

#### Returns

`MessageModifier`[]

#### Implementation of

```ts
InitialPromptGeneratorInterface.getProcessors
```

***

### processMessage()

```ts
processMessage(input: FlatUserMessage): Promise<ProcessedMessage>;
```

Defined in: [packages/agent/src/unified/base/initialPromptGenerator.ts:37](packages/agent/src/unified/base/initialPromptGenerator.ts#L37)

Process and modify input messages using the message modifier pattern

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | `FlatUserMessage` |

#### Returns

`Promise`\<`ProcessedMessage`\>

#### Implementation of

```ts
InitialPromptGeneratorInterface.processMessage
```

***

### setMetaData()

```ts
setMetaData(key: string, value: unknown): void;
```

Defined in: [packages/agent/src/unified/base/initialPromptGenerator.ts:126](packages/agent/src/unified/base/initialPromptGenerator.ts#L126)

Set context value

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `key` | `string` |
| `value` | `unknown` |

#### Returns

`void`

#### Implementation of

```ts
InitialPromptGeneratorInterface.setMetaData
```

***

### updateProcessors()

```ts
updateProcessors(processors: MessageModifier[]): void;
```

Defined in: [packages/agent/src/unified/base/initialPromptGenerator.ts:147](packages/agent/src/unified/base/initialPromptGenerator.ts#L147)

Get all message modifiers

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `processors` | `MessageModifier`[] |

#### Returns

`void`

#### Implementation of

```ts
InitialPromptGeneratorInterface.updateProcessors
```
