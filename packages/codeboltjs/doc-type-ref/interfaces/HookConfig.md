---
title: HookConfig
---

[**@codebolt/codeboltjs**](../index)

***

# Interface: HookConfig

Defined in: [packages/codeboltjs/src/types/hook.ts:34](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/hook.ts#L34)

## Extended by

- [`Hook`](Hook)

## Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="action"></a> `action` | [`HookAction`](../type-aliases/HookAction) | [packages/codeboltjs/src/types/hook.ts:45](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/hook.ts#L45) |
| <a id="actionconfig"></a> `actionConfig?` | \{ `agentId?`: `string`; `command?`: `string`; `message?`: `string`; `payload?`: `Record`\<`string`, `any`\>; `url?`: `string`; \} | [packages/codeboltjs/src/types/hook.ts:46](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/hook.ts#L46) |
| `actionConfig.agentId?` | `string` | [packages/codeboltjs/src/types/hook.ts:50](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/hook.ts#L50) |
| `actionConfig.command?` | `string` | [packages/codeboltjs/src/types/hook.ts:48](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/hook.ts#L48) |
| `actionConfig.message?` | `string` | [packages/codeboltjs/src/types/hook.ts:47](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/hook.ts#L47) |
| `actionConfig.payload?` | `Record`\<`string`, `any`\> | [packages/codeboltjs/src/types/hook.ts:51](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/hook.ts#L51) |
| `actionConfig.url?` | `string` | [packages/codeboltjs/src/types/hook.ts:49](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/hook.ts#L49) |
| <a id="conditions"></a> `conditions?` | [`HookCondition`](HookCondition)[] | [packages/codeboltjs/src/types/hook.ts:55](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/hook.ts#L55) |
| <a id="description"></a> `description?` | `string` | [packages/codeboltjs/src/types/hook.ts:37](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/hook.ts#L37) |
| <a id="enabled"></a> `enabled?` | `boolean` | [packages/codeboltjs/src/types/hook.ts:53](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/hook.ts#L53) |
| <a id="id"></a> `id?` | `string` | [packages/codeboltjs/src/types/hook.ts:35](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/hook.ts#L35) |
| <a id="name"></a> `name` | `string` | [packages/codeboltjs/src/types/hook.ts:36](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/hook.ts#L36) |
| <a id="priority"></a> `priority?` | `number` | [packages/codeboltjs/src/types/hook.ts:54](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/hook.ts#L54) |
| <a id="trigger"></a> `trigger` | [`HookTrigger`](../type-aliases/HookTrigger) | [packages/codeboltjs/src/types/hook.ts:38](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/hook.ts#L38) |
| <a id="triggerconfig"></a> `triggerConfig?` | \{ `command?`: `string`; `eventType?`: `string`; `path?`: `string`; `pattern?`: `string`; \} | [packages/codeboltjs/src/types/hook.ts:39](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/hook.ts#L39) |
| `triggerConfig.command?` | `string` | [packages/codeboltjs/src/types/hook.ts:42](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/hook.ts#L42) |
| `triggerConfig.eventType?` | `string` | [packages/codeboltjs/src/types/hook.ts:43](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/hook.ts#L43) |
| `triggerConfig.path?` | `string` | [packages/codeboltjs/src/types/hook.ts:41](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/hook.ts#L41) |
| `triggerConfig.pattern?` | `string` | [packages/codeboltjs/src/types/hook.ts:40](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/hook.ts#L40) |
