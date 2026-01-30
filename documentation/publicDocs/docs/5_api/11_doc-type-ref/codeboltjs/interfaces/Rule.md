---
title: Rule
---

[**@codebolt/codeboltjs**](../README)

***

# Interface: Rule

Defined in: packages/codeboltjs/src/types/contextRuleEngine.ts:37

## Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="action"></a> `action` | [`RuleAction`](../type-aliases/RuleAction) | [packages/codeboltjs/src/types/contextRuleEngine.ts:43](packages/codeboltjs/src/types/contextRuleEngine.ts#L43) |
| <a id="action_config"></a> `action_config?` | \{ `memory_ids?`: `string`[]; `priority?`: `number`; \} | [packages/codeboltjs/src/types/contextRuleEngine.ts:44](packages/codeboltjs/src/types/contextRuleEngine.ts#L44) |
| `action_config.memory_ids?` | `string`[] | [packages/codeboltjs/src/types/contextRuleEngine.ts:45](packages/codeboltjs/src/types/contextRuleEngine.ts#L45) |
| `action_config.priority?` | `number` | [packages/codeboltjs/src/types/contextRuleEngine.ts:46](packages/codeboltjs/src/types/contextRuleEngine.ts#L46) |
| <a id="condition_logic"></a> `condition_logic?` | `"and"` \| `"or"` | [packages/codeboltjs/src/types/contextRuleEngine.ts:42](packages/codeboltjs/src/types/contextRuleEngine.ts#L42) |
| <a id="conditions"></a> `conditions` | [`RuleCondition`](RuleCondition)[] | [packages/codeboltjs/src/types/contextRuleEngine.ts:41](packages/codeboltjs/src/types/contextRuleEngine.ts#L41) |
| <a id="description"></a> `description?` | `string` | [packages/codeboltjs/src/types/contextRuleEngine.ts:40](packages/codeboltjs/src/types/contextRuleEngine.ts#L40) |
| <a id="enabled"></a> `enabled?` | `boolean` | [packages/codeboltjs/src/types/contextRuleEngine.ts:48](packages/codeboltjs/src/types/contextRuleEngine.ts#L48) |
| <a id="id"></a> `id?` | `string` | [packages/codeboltjs/src/types/contextRuleEngine.ts:38](packages/codeboltjs/src/types/contextRuleEngine.ts#L38) |
| <a id="name"></a> `name` | `string` | [packages/codeboltjs/src/types/contextRuleEngine.ts:39](packages/codeboltjs/src/types/contextRuleEngine.ts#L39) |
| <a id="order"></a> `order?` | `number` | [packages/codeboltjs/src/types/contextRuleEngine.ts:49](packages/codeboltjs/src/types/contextRuleEngine.ts#L49) |
