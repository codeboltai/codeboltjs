[@codebolt/codeboltjs](README.md) / Exports

# @codebolt/codeboltjs

## Table of contents

### Enumerations

- [AgentLocation](enums/AgentLocation.md)
- [Agents](enums/Agents.md)
- [FilterUsing](enums/FilterUsing.md)

### Variables

- [default](modules.md#default)

## Variables

### default

• `Const` **default**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `findAgent` | (`task`: `string`, `maxResult`: `number`, `agents`: `never`[], `agentLocaltion`: [`AgentLocation`](enums/AgentLocation.md), `getFrom`: [`USE_VECTOR_DB`](enums/FilterUsing.md#use_vector_db)) => `Promise`\<`any`\> | - |
| `getAgentsDetail` | (`agentList`: `never`[]) => `Promise`\<`any`\> | - |
| `getAgentsList` | (`type`: [`Agents`](enums/Agents.md)) => `Promise`\<`any`\> | - |
| `startAgent` | (`agentId`: `string`, `task`: `string`) => `Promise`\<`any`\> | - |

#### Defined in

[agent.ts:26](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/modules/agent.ts#L26)
