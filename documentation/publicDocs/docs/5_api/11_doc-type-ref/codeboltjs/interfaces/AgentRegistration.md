---
title: AgentRegistration
---

[**@codebolt/codeboltjs**](../README)

***

# Interface: AgentRegistration

Defined in: packages/codeboltjs/src/types/swarm.ts:23

Agent registration data

## Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="agentid"></a> `agentId?` | `string` | [packages/codeboltjs/src/types/swarm.ts:24](packages/codeboltjs/src/types/swarm.ts#L24) |
| <a id="agenttype"></a> `agentType?` | `"internal"` \| `"external"` | [packages/codeboltjs/src/types/swarm.ts:27](packages/codeboltjs/src/types/swarm.ts#L27) |
| <a id="capabilities"></a> `capabilities?` | `string`[] | [packages/codeboltjs/src/types/swarm.ts:26](packages/codeboltjs/src/types/swarm.ts#L26) |
| <a id="connectioninfo"></a> `connectionInfo?` | \{ `endpoint`: `string`; `protocol`: `"websocket"` \| `"http"`; \} | [packages/codeboltjs/src/types/swarm.ts:28](packages/codeboltjs/src/types/swarm.ts#L28) |
| `connectionInfo.endpoint` | `string` | [packages/codeboltjs/src/types/swarm.ts:29](packages/codeboltjs/src/types/swarm.ts#L29) |
| `connectionInfo.protocol` | `"websocket"` \| `"http"` | [packages/codeboltjs/src/types/swarm.ts:30](packages/codeboltjs/src/types/swarm.ts#L30) |
| <a id="metadata"></a> `metadata?` | `Record`\<`string`, `any`\> | [packages/codeboltjs/src/types/swarm.ts:32](packages/codeboltjs/src/types/swarm.ts#L32) |
| <a id="name"></a> `name` | `string` | [packages/codeboltjs/src/types/swarm.ts:25](packages/codeboltjs/src/types/swarm.ts#L25) |
