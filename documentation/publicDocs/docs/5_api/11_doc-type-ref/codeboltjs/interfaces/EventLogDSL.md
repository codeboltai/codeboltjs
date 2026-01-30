---
title: EventLogDSL
---

[**@codebolt/codeboltjs**](../README)

***

# Interface: EventLogDSL

Defined in: [packages/codeboltjs/src/types/eventLog.ts:36](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/eventLog.ts#L36)

## Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="from"></a> `from` | \{ `instance`: `string`; `stream?`: `string`; \} | [packages/codeboltjs/src/types/eventLog.ts:37](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/eventLog.ts#L37) |
| `from.instance` | `string` | [packages/codeboltjs/src/types/eventLog.ts:38](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/eventLog.ts#L38) |
| `from.stream?` | `string` | [packages/codeboltjs/src/types/eventLog.ts:39](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/eventLog.ts#L39) |
| <a id="limit"></a> `limit?` | `number` | [packages/codeboltjs/src/types/eventLog.ts:47](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/eventLog.ts#L47) |
| <a id="offset"></a> `offset?` | `number` | [packages/codeboltjs/src/types/eventLog.ts:48](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/eventLog.ts#L48) |
| <a id="orderby"></a> `orderBy?` | \{ `direction`: `"asc"` \| `"desc"`; `field`: `string`; \} | [packages/codeboltjs/src/types/eventLog.ts:43](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/eventLog.ts#L43) |
| `orderBy.direction` | `"asc"` \| `"desc"` | [packages/codeboltjs/src/types/eventLog.ts:45](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/eventLog.ts#L45) |
| `orderBy.field` | `string` | [packages/codeboltjs/src/types/eventLog.ts:44](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/eventLog.ts#L44) |
| <a id="reduce"></a> `reduce?` | \{ `field?`: `string`; `groupBy?`: `string`[]; `type`: `"count"` \| `"sum"` \| `"avg"` \| `"min"` \| `"max"` \| `"collect"`; \} | [packages/codeboltjs/src/types/eventLog.ts:49](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/eventLog.ts#L49) |
| `reduce.field?` | `string` | [packages/codeboltjs/src/types/eventLog.ts:51](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/eventLog.ts#L51) |
| `reduce.groupBy?` | `string`[] | [packages/codeboltjs/src/types/eventLog.ts:52](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/eventLog.ts#L52) |
| `reduce.type` | `"count"` \| `"sum"` \| `"avg"` \| `"min"` \| `"max"` \| `"collect"` | [packages/codeboltjs/src/types/eventLog.ts:50](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/eventLog.ts#L50) |
| <a id="select"></a> `select?` | `string`[] | [packages/codeboltjs/src/types/eventLog.ts:42](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/eventLog.ts#L42) |
| <a id="where"></a> `where?` | [`EventLogCondition`](EventLogCondition)[] | [packages/codeboltjs/src/types/eventLog.ts:41](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/eventLog.ts#L41) |
