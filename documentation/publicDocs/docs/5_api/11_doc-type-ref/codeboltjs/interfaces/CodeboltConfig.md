---
title: CodeboltConfig
---

[**@codebolt/codeboltjs**](../README)

***

# Interface: CodeboltConfig

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:1791](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/libFunctionTypes.ts#L1791)

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="features"></a> `features?` | \{ `autoRetry?`: `boolean`; `caching?`: `boolean`; `compression?`: `boolean`; \} | Feature flags | [packages/codeboltjs/src/types/libFunctionTypes.ts:1815](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/libFunctionTypes.ts#L1815) |
| `features.autoRetry?` | `boolean` | - | [packages/codeboltjs/src/types/libFunctionTypes.ts:1816](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/libFunctionTypes.ts#L1816) |
| `features.caching?` | `boolean` | - | [packages/codeboltjs/src/types/libFunctionTypes.ts:1817](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/libFunctionTypes.ts#L1817) |
| `features.compression?` | `boolean` | - | [packages/codeboltjs/src/types/libFunctionTypes.ts:1818](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/libFunctionTypes.ts#L1818) |
| <a id="logging"></a> `logging?` | \{ `enabled?`: `boolean`; `format?`: `"text"` \| `"json"`; `level?`: `"info"` \| `"error"` \| `"debug"` \| `"warn"`; \} | Logging configuration | [packages/codeboltjs/src/types/libFunctionTypes.ts:1801](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/libFunctionTypes.ts#L1801) |
| `logging.enabled?` | `boolean` | - | [packages/codeboltjs/src/types/libFunctionTypes.ts:1803](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/libFunctionTypes.ts#L1803) |
| `logging.format?` | `"text"` \| `"json"` | - | [packages/codeboltjs/src/types/libFunctionTypes.ts:1804](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/libFunctionTypes.ts#L1804) |
| `logging.level?` | `"info"` \| `"error"` \| `"debug"` \| `"warn"` | - | [packages/codeboltjs/src/types/libFunctionTypes.ts:1802](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/libFunctionTypes.ts#L1802) |
| <a id="timeouts"></a> `timeouts?` | \{ `browser?`: `number`; `default?`: `number`; `fileSystem?`: `number`; `llm?`: `number`; `terminal?`: `number`; \} | Default timeouts for operations | [packages/codeboltjs/src/types/libFunctionTypes.ts:1807](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/libFunctionTypes.ts#L1807) |
| `timeouts.browser?` | `number` | - | [packages/codeboltjs/src/types/libFunctionTypes.ts:1810](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/libFunctionTypes.ts#L1810) |
| `timeouts.default?` | `number` | - | [packages/codeboltjs/src/types/libFunctionTypes.ts:1808](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/libFunctionTypes.ts#L1808) |
| `timeouts.fileSystem?` | `number` | - | [packages/codeboltjs/src/types/libFunctionTypes.ts:1812](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/libFunctionTypes.ts#L1812) |
| `timeouts.llm?` | `number` | - | [packages/codeboltjs/src/types/libFunctionTypes.ts:1809](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/libFunctionTypes.ts#L1809) |
| `timeouts.terminal?` | `number` | - | [packages/codeboltjs/src/types/libFunctionTypes.ts:1811](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/libFunctionTypes.ts#L1811) |
| <a id="websocket"></a> `websocket?` | \{ `autoReconnect?`: `boolean`; `maxReconnectAttempts?`: `number`; `reconnectInterval?`: `number`; `timeout?`: `number`; `url?`: `string`; \} | WebSocket configuration | [packages/codeboltjs/src/types/libFunctionTypes.ts:1793](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/libFunctionTypes.ts#L1793) |
| `websocket.autoReconnect?` | `boolean` | - | [packages/codeboltjs/src/types/libFunctionTypes.ts:1798](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/libFunctionTypes.ts#L1798) |
| `websocket.maxReconnectAttempts?` | `number` | - | [packages/codeboltjs/src/types/libFunctionTypes.ts:1797](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/libFunctionTypes.ts#L1797) |
| `websocket.reconnectInterval?` | `number` | - | [packages/codeboltjs/src/types/libFunctionTypes.ts:1796](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/libFunctionTypes.ts#L1796) |
| `websocket.timeout?` | `number` | - | [packages/codeboltjs/src/types/libFunctionTypes.ts:1795](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/libFunctionTypes.ts#L1795) |
| `websocket.url?` | `string` | - | [packages/codeboltjs/src/types/libFunctionTypes.ts:1794](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/libFunctionTypes.ts#L1794) |
