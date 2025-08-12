[@codebolt/codeboltjs](README.md) / Exports

# @codebolt/codeboltjs

## Table of contents

### References

- [default](modules.md#default)

### Enumerations

- [logType](enums/logType.md)

### Variables

- [debug](modules.md#debug)

## References

### default

Renames and re-exports [debug](modules.md#debug)

## Variables

### debug

• `Const` **debug**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `debug` | (`log`: `string`, `type`: [`logType`](enums/logType.md)) => `Promise`\<`DebugAddLogResponse`\> | - |
| `openDebugBrowser` | (`url`: `string`, `port`: `number`) => `Promise`\<`OpenDebugBrowserResponse`\> | - |

#### Defined in

[debug.ts:10](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/modules/debug.ts#L10)
