---
title: ResponseExecutor
---

[**@codebolt/agent**](../../README)

***

# Class: ResponseExecutor

Defined in: [packages/agent/src/unified/base/responseExecutor.ts:6](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/base/responseExecutor.ts#L6)

## Implements

- `AgentResponseExecutor`

## Constructors

### Constructor

```ts
new ResponseExecutor(options: {
  postToolCallProcessors: PostToolCallProcessor[];
  preToolCallProcessors: PreToolCallProcessor[];
}): ResponseExecutor;
```

Defined in: [packages/agent/src/unified/base/responseExecutor.ts:13](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/base/responseExecutor.ts#L13)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | \{ `postToolCallProcessors`: `PostToolCallProcessor`[]; `preToolCallProcessors`: `PreToolCallProcessor`[]; \} |
| `options.postToolCallProcessors` | `PostToolCallProcessor`[] |
| `options.preToolCallProcessors` | `PreToolCallProcessor`[] |

#### Returns

`ResponseExecutor`

## Methods

### executeResponse()

```ts
executeResponse(input: ResponseInput): Promise<ResponseOutput>;
```

Defined in: [packages/agent/src/unified/base/responseExecutor.ts:23](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/base/responseExecutor.ts#L23)

Execute response processing including tool execution

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | `ResponseInput` |

#### Returns

`Promise`\<`ResponseOutput`\>

#### Implementation of

```ts
AgentResponseExecutor.executeResponse
```

***

### getPostToolCallProcessors()

```ts
getPostToolCallProcessors(): PostToolCallProcessor[];
```

Defined in: [packages/agent/src/unified/base/responseExecutor.ts:386](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/base/responseExecutor.ts#L386)

#### Returns

`PostToolCallProcessor`[]

#### Implementation of

```ts
AgentResponseExecutor.getPostToolCallProcessors
```

***

### getPreToolCallProcessors()

```ts
getPreToolCallProcessors(): PreToolCallProcessor[];
```

Defined in: [packages/agent/src/unified/base/responseExecutor.ts:383](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/base/responseExecutor.ts#L383)

#### Returns

`PreToolCallProcessor`[]

#### Implementation of

```ts
AgentResponseExecutor.getPreToolCallProcessors
```

***

### setPostToolCallProcessors()

```ts
setPostToolCallProcessors(processors: PostToolCallProcessor[]): void;
```

Defined in: [packages/agent/src/unified/base/responseExecutor.ts:379](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/base/responseExecutor.ts#L379)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `processors` | `PostToolCallProcessor`[] |

#### Returns

`void`

#### Implementation of

```ts
AgentResponseExecutor.setPostToolCallProcessors
```

***

### setPreToolCallProcessors()

```ts
setPreToolCallProcessors(processors: PreToolCallProcessor[]): void;
```

Defined in: [packages/agent/src/unified/base/responseExecutor.ts:376](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/base/responseExecutor.ts#L376)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `processors` | `PreToolCallProcessor`[] |

#### Returns

`void`

#### Implementation of

```ts
AgentResponseExecutor.setPreToolCallProcessors
```
