[**@codebolt/agent**](../../README.md)

***

# Interface: UnifiedResponseExecutor

Defined in: [packages/agent/src/unified/types/types.ts:192](packages/agent/src/unified/types/types.ts#L192)

Unified response executor interface

## Methods

### addFollowUpConversationProcessor()

```ts
addFollowUpConversationProcessor(processor: Processor): void;
```

Defined in: [packages/agent/src/unified/types/types.ts:208](packages/agent/src/unified/types/types.ts#L208)

Add a follow-up conversation processor

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `processor` | `Processor` |

#### Returns

`void`

***

### addPreToolCallProcessor()

```ts
addPreToolCallProcessor(processor: Processor): void;
```

Defined in: [packages/agent/src/unified/types/types.ts:216](packages/agent/src/unified/types/types.ts#L216)

Add a pre-tool call processor

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `processor` | `Processor` |

#### Returns

`void`

***

### buildFollowUpConversation()

```ts
buildFollowUpConversation(
   conversationHistory: OpenAIMessage[], 
   toolResults: ToolResult[], 
llmResponse: any): Promise<OpenAIMessage[]>;
```

Defined in: [packages/agent/src/unified/types/types.ts:198](packages/agent/src/unified/types/types.ts#L198)

Build follow-up conversation

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `conversationHistory` | [`OpenAIMessage`](OpenAIMessage.md)[] |
| `toolResults` | [`ToolResult`](ToolResult.md)[] |
| `llmResponse` | `any` |

#### Returns

`Promise`\<[`OpenAIMessage`](OpenAIMessage.md)[]\>

***

### clearFollowUpConversationProcessors()

```ts
clearFollowUpConversationProcessors(): void;
```

Defined in: [packages/agent/src/unified/types/types.ts:214](packages/agent/src/unified/types/types.ts#L214)

Clear all follow-up conversation processors

#### Returns

`void`

***

### clearPreToolCallProcessors()

```ts
clearPreToolCallProcessors(): void;
```

Defined in: [packages/agent/src/unified/types/types.ts:222](packages/agent/src/unified/types/types.ts#L222)

Clear all pre-tool call processors

#### Returns

`void`

***

### executeResponse()

```ts
executeResponse(input: UnifiedResponseInput): Promise<UnifiedResponseOutput>;
```

Defined in: [packages/agent/src/unified/types/types.ts:194](packages/agent/src/unified/types/types.ts#L194)

Execute response processing including tool execution

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`UnifiedResponseInput`](UnifiedResponseInput.md) |

#### Returns

`Promise`\<[`UnifiedResponseOutput`](UnifiedResponseOutput.md)\>

***

### executeTools()

```ts
executeTools(
   llmResponse: any, 
   tools: OpenAITool[], 
context?: Record<string, any>): Promise<ToolResult[]>;
```

Defined in: [packages/agent/src/unified/types/types.ts:196](packages/agent/src/unified/types/types.ts#L196)

Execute tools from LLM response

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `llmResponse` | `any` |
| `tools` | [`OpenAITool`](OpenAITool.md)[] |
| `context?` | `Record`\<`string`, `any`\> |

#### Returns

`Promise`\<[`ToolResult`](ToolResult.md)[]\>

***

### getFollowUpConversationProcessors()

```ts
getFollowUpConversationProcessors(): Processor[];
```

Defined in: [packages/agent/src/unified/types/types.ts:212](packages/agent/src/unified/types/types.ts#L212)

Get all follow-up conversation processors

#### Returns

`Processor`[]

***

### getPreToolCallProcessors()

```ts
getPreToolCallProcessors(): Processor[];
```

Defined in: [packages/agent/src/unified/types/types.ts:220](packages/agent/src/unified/types/types.ts#L220)

Get all pre-tool call processors

#### Returns

`Processor`[]

***

### removeFollowUpConversationProcessor()

```ts
removeFollowUpConversationProcessor(processor: Processor): boolean;
```

Defined in: [packages/agent/src/unified/types/types.ts:210](packages/agent/src/unified/types/types.ts#L210)

Remove a follow-up conversation processor

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `processor` | `Processor` |

#### Returns

`boolean`

***

### removePreToolCallProcessor()

```ts
removePreToolCallProcessor(processor: Processor): boolean;
```

Defined in: [packages/agent/src/unified/types/types.ts:218](packages/agent/src/unified/types/types.ts#L218)

Remove a pre-tool call processor

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `processor` | `Processor` |

#### Returns

`boolean`

***

### shouldSummarizeConversation()

```ts
shouldSummarizeConversation(conversationHistory: OpenAIMessage[]): boolean;
```

Defined in: [packages/agent/src/unified/types/types.ts:204](packages/agent/src/unified/types/types.ts#L204)

Check if conversation needs summarization

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `conversationHistory` | [`OpenAIMessage`](OpenAIMessage.md)[] |

#### Returns

`boolean`

***

### summarizeConversation()

```ts
summarizeConversation(conversationHistory: OpenAIMessage[]): Promise<OpenAIMessage[]>;
```

Defined in: [packages/agent/src/unified/types/types.ts:206](packages/agent/src/unified/types/types.ts#L206)

Summarize conversation

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `conversationHistory` | [`OpenAIMessage`](OpenAIMessage.md)[] |

#### Returns

`Promise`\<[`OpenAIMessage`](OpenAIMessage.md)[]\>
