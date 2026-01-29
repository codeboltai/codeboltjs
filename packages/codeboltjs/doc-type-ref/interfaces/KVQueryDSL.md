---
title: KVQueryDSL
---

[**@codebolt/codeboltjs**](../index)

***

# Interface: KVQueryDSL

Defined in: [packages/codeboltjs/src/types/kvStore.ts:36](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/kvStore.ts#L36)

## Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="from"></a> `from` | \{ `instance`: `string`; `namespace?`: `string`; \} | [packages/codeboltjs/src/types/kvStore.ts:37](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/kvStore.ts#L37) |
| `from.instance` | `string` | [packages/codeboltjs/src/types/kvStore.ts:38](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/kvStore.ts#L38) |
| `from.namespace?` | `string` | [packages/codeboltjs/src/types/kvStore.ts:39](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/kvStore.ts#L39) |
| <a id="limit"></a> `limit?` | `number` | [packages/codeboltjs/src/types/kvStore.ts:47](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/kvStore.ts#L47) |
| <a id="offset"></a> `offset?` | `number` | [packages/codeboltjs/src/types/kvStore.ts:48](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/kvStore.ts#L48) |
| <a id="orderby"></a> `orderBy?` | \{ `direction`: `"asc"` \| `"desc"`; `field`: `string`; \} | [packages/codeboltjs/src/types/kvStore.ts:43](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/kvStore.ts#L43) |
| `orderBy.direction` | `"asc"` \| `"desc"` | [packages/codeboltjs/src/types/kvStore.ts:45](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/kvStore.ts#L45) |
| `orderBy.field` | `string` | [packages/codeboltjs/src/types/kvStore.ts:44](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/kvStore.ts#L44) |
| <a id="select"></a> `select?` | `string`[] | [packages/codeboltjs/src/types/kvStore.ts:42](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/kvStore.ts#L42) |
| <a id="where"></a> `where?` | [`KVQueryCondition`](KVQueryCondition)[] | [packages/codeboltjs/src/types/kvStore.ts:41](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/kvStore.ts#L41) |
