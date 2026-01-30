---
title: Agent
---

[**@codebolt/agent**](../../README)

***

# Class: Agent

Defined in: [packages/agent/src/unified/agent/agent.ts:9](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/agent/agent.ts#L9)

## Implements

- `AgentInterface`

## Constructors

### Constructor

```ts
new Agent(config: AgentConfig): Agent;
```

Defined in: [packages/agent/src/unified/agent/agent.ts:18](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/agent/agent.ts#L18)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `config` | `AgentConfig` |

#### Returns

`Agent`

## Methods

### execute()

```ts
execute(reqMessage: FlatUserMessage): Promise<{
  error?: string;
  result: any;
  success: boolean;
}>;
```

Defined in: [packages/agent/src/unified/agent/agent.ts:28](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/agent/agent.ts#L28)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `reqMessage` | `FlatUserMessage` |

#### Returns

`Promise`\<\{
  `error?`: `string`;
  `result`: `any`;
  `success`: `boolean`;
\}\>

#### Implementation of

```ts
AgentInterface.execute
```
