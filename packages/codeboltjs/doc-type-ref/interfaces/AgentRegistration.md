---
title: AgentRegistration
---

[**@codebolt/codeboltjs**](../index)

***

# Interface: AgentRegistration

Defined in: [packages/codeboltjs/src/types/swarm.ts:23](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/swarm.ts#L23)

Agent registration data

## Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="agentid"></a> `agentId?` | `string` | [packages/codeboltjs/src/types/swarm.ts:24](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/swarm.ts#L24) |
| <a id="agenttype"></a> `agentType?` | `"internal"` \| `"external"` | [packages/codeboltjs/src/types/swarm.ts:27](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/swarm.ts#L27) |
| <a id="capabilities"></a> `capabilities?` | `string`[] | [packages/codeboltjs/src/types/swarm.ts:26](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/swarm.ts#L26) |
| <a id="connectioninfo"></a> `connectionInfo?` | \{ `endpoint`: `string`; `protocol`: `"websocket"` \| `"http"`; \} | [packages/codeboltjs/src/types/swarm.ts:28](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/swarm.ts#L28) |
| `connectionInfo.endpoint` | `string` | [packages/codeboltjs/src/types/swarm.ts:29](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/swarm.ts#L29) |
| `connectionInfo.protocol` | `"websocket"` \| `"http"` | [packages/codeboltjs/src/types/swarm.ts:30](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/swarm.ts#L30) |
| <a id="metadata"></a> `metadata?` | `Record`\<`string`, `any`\> | [packages/codeboltjs/src/types/swarm.ts:32](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/swarm.ts#L32) |
| <a id="name"></a> `name` | `string` | [packages/codeboltjs/src/types/swarm.ts:25](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/swarm.ts#L25) |
