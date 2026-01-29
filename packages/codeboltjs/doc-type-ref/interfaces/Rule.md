---
title: Rule
---

[**@codebolt/codeboltjs**](../index)

***

# Interface: Rule

Defined in: [packages/codeboltjs/src/types/contextRuleEngine.ts:37](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/contextRuleEngine.ts#L37)

## Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="action"></a> `action` | [`RuleAction`](../type-aliases/RuleAction) | [packages/codeboltjs/src/types/contextRuleEngine.ts:43](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/contextRuleEngine.ts#L43) |
| <a id="action_config"></a> `action_config?` | \{ `memory_ids?`: `string`[]; `priority?`: `number`; \} | [packages/codeboltjs/src/types/contextRuleEngine.ts:44](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/contextRuleEngine.ts#L44) |
| `action_config.memory_ids?` | `string`[] | [packages/codeboltjs/src/types/contextRuleEngine.ts:45](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/contextRuleEngine.ts#L45) |
| `action_config.priority?` | `number` | [packages/codeboltjs/src/types/contextRuleEngine.ts:46](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/contextRuleEngine.ts#L46) |
| <a id="condition_logic"></a> `condition_logic?` | `"and"` \| `"or"` | [packages/codeboltjs/src/types/contextRuleEngine.ts:42](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/contextRuleEngine.ts#L42) |
| <a id="conditions"></a> `conditions` | [`RuleCondition`](RuleCondition)[] | [packages/codeboltjs/src/types/contextRuleEngine.ts:41](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/contextRuleEngine.ts#L41) |
| <a id="description"></a> `description?` | `string` | [packages/codeboltjs/src/types/contextRuleEngine.ts:40](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/contextRuleEngine.ts#L40) |
| <a id="enabled"></a> `enabled?` | `boolean` | [packages/codeboltjs/src/types/contextRuleEngine.ts:48](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/contextRuleEngine.ts#L48) |
| <a id="id"></a> `id?` | `string` | [packages/codeboltjs/src/types/contextRuleEngine.ts:38](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/contextRuleEngine.ts#L38) |
| <a id="name"></a> `name` | `string` | [packages/codeboltjs/src/types/contextRuleEngine.ts:39](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/contextRuleEngine.ts#L39) |
| <a id="order"></a> `order?` | `number` | [packages/codeboltjs/src/types/contextRuleEngine.ts:49](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/contextRuleEngine.ts#L49) |
