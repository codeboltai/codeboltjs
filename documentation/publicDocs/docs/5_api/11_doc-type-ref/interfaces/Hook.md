---
title: Hook
---

[**@codebolt/codeboltjs**](../index)

***

# Interface: Hook

Defined in: [packages/codeboltjs/src/types/hook.ts:64](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/hook.ts#L64)

## Extends

- [`HookConfig`](HookConfig)

## Properties

| Property | Type | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="action"></a> `action` | [`HookAction`](../type-aliases/HookAction) | - | [`HookConfig`](HookConfig).[`action`](HookConfig.md#action) | [packages/codeboltjs/src/types/hook.ts:45](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/hook.ts#L45) |
| <a id="actionconfig"></a> `actionConfig?` | \{ `agentId?`: `string`; `command?`: `string`; `message?`: `string`; `payload?`: `Record`\<`string`, `any`\>; `url?`: `string`; \} | - | [`HookConfig`](HookConfig).[`actionConfig`](HookConfig.md#actionconfig) | [packages/codeboltjs/src/types/hook.ts:46](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/hook.ts#L46) |
| `actionConfig.agentId?` | `string` | - | - | [packages/codeboltjs/src/types/hook.ts:50](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/hook.ts#L50) |
| `actionConfig.command?` | `string` | - | - | [packages/codeboltjs/src/types/hook.ts:48](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/hook.ts#L48) |
| `actionConfig.message?` | `string` | - | - | [packages/codeboltjs/src/types/hook.ts:47](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/hook.ts#L47) |
| `actionConfig.payload?` | `Record`\<`string`, `any`\> | - | - | [packages/codeboltjs/src/types/hook.ts:51](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/hook.ts#L51) |
| `actionConfig.url?` | `string` | - | - | [packages/codeboltjs/src/types/hook.ts:49](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/hook.ts#L49) |
| <a id="conditions"></a> `conditions?` | [`HookCondition`](HookCondition)[] | - | [`HookConfig`](HookConfig).[`conditions`](HookConfig.md#conditions) | [packages/codeboltjs/src/types/hook.ts:55](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/hook.ts#L55) |
| <a id="createdat"></a> `createdAt` | `string` | - | - | [packages/codeboltjs/src/types/hook.ts:67](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/hook.ts#L67) |
| <a id="description"></a> `description?` | `string` | - | [`HookConfig`](HookConfig).[`description`](HookConfig.md#description) | [packages/codeboltjs/src/types/hook.ts:37](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/hook.ts#L37) |
| <a id="enabled"></a> `enabled` | `boolean` | [`HookConfig`](HookConfig).[`enabled`](HookConfig.md#enabled) | - | [packages/codeboltjs/src/types/hook.ts:66](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/hook.ts#L66) |
| <a id="id"></a> `id` | `string` | [`HookConfig`](HookConfig).[`id`](HookConfig.md#id) | - | [packages/codeboltjs/src/types/hook.ts:65](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/hook.ts#L65) |
| <a id="lasttriggeredat"></a> `lastTriggeredAt?` | `string` | - | - | [packages/codeboltjs/src/types/hook.ts:69](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/hook.ts#L69) |
| <a id="name"></a> `name` | `string` | - | [`HookConfig`](HookConfig).[`name`](HookConfig.md#name) | [packages/codeboltjs/src/types/hook.ts:36](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/hook.ts#L36) |
| <a id="priority"></a> `priority?` | `number` | - | [`HookConfig`](HookConfig).[`priority`](HookConfig.md#priority) | [packages/codeboltjs/src/types/hook.ts:54](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/hook.ts#L54) |
| <a id="trigger"></a> `trigger` | [`HookTrigger`](../type-aliases/HookTrigger) | - | [`HookConfig`](HookConfig).[`trigger`](HookConfig.md#trigger) | [packages/codeboltjs/src/types/hook.ts:38](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/hook.ts#L38) |
| <a id="triggerconfig"></a> `triggerConfig?` | \{ `command?`: `string`; `eventType?`: `string`; `path?`: `string`; `pattern?`: `string`; \} | - | [`HookConfig`](HookConfig).[`triggerConfig`](HookConfig.md#triggerconfig) | [packages/codeboltjs/src/types/hook.ts:39](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/hook.ts#L39) |
| `triggerConfig.command?` | `string` | - | - | [packages/codeboltjs/src/types/hook.ts:42](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/hook.ts#L42) |
| `triggerConfig.eventType?` | `string` | - | - | [packages/codeboltjs/src/types/hook.ts:43](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/hook.ts#L43) |
| `triggerConfig.path?` | `string` | - | - | [packages/codeboltjs/src/types/hook.ts:41](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/hook.ts#L41) |
| `triggerConfig.pattern?` | `string` | - | - | [packages/codeboltjs/src/types/hook.ts:40](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/hook.ts#L40) |
| <a id="triggercount"></a> `triggerCount` | `number` | - | - | [packages/codeboltjs/src/types/hook.ts:70](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/hook.ts#L70) |
| <a id="updatedat"></a> `updatedAt` | `string` | - | - | [packages/codeboltjs/src/types/hook.ts:68](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/hook.ts#L68) |
