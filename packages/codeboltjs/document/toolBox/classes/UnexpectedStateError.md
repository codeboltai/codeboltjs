[@codebolt/codeboltjs](../README.md) / [Exports](../modules.md) / UnexpectedStateError

# Class: UnexpectedStateError

Error class for unexpected state conditions.

## Hierarchy

- `FastMCPError`

  ↳ **`UnexpectedStateError`**

  ↳↳ [`UserError`](UserError.md)

## Table of contents

### Constructors

- [constructor](UnexpectedStateError.md#constructor)

### Properties

- [extras](UnexpectedStateError.md#extras)
- [message](UnexpectedStateError.md#message)
- [name](UnexpectedStateError.md#name)
- [stack](UnexpectedStateError.md#stack)
- [prepareStackTrace](UnexpectedStateError.md#preparestacktrace)
- [stackTraceLimit](UnexpectedStateError.md#stacktracelimit)

### Methods

- [captureStackTrace](UnexpectedStateError.md#capturestacktrace)

## Constructors

### constructor

• **new UnexpectedStateError**(`message`, `extras?`): [`UnexpectedStateError`](UnexpectedStateError.md)

Creates a new UnexpectedStateError.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `message` | `string` | Error message |
| `extras?` | `Extras` | Additional context for the error |

#### Returns

[`UnexpectedStateError`](UnexpectedStateError.md)

#### Overrides

FastMCPError.constructor

#### Defined in

[src/utils/toolBox.ts:134](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L134)

## Properties

### extras

• `Optional` **extras**: `Extras`

Additional context for the error

#### Defined in

[src/utils/toolBox.ts:126](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L126)

___

### message

• **message**: `string`

#### Inherited from

FastMCPError.message

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1077

___

### name

• **name**: `string`

#### Inherited from

FastMCPError.name

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1076

___

### stack

• `Optional` **stack**: `string`

#### Inherited from

FastMCPError.stack

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1078

___

### prepareStackTrace

▪ `Static` `Optional` **prepareStackTrace**: (`err`: `Error`, `stackTraces`: `CallSite`[]) => `any`

Optional override for formatting stack traces

**`See`**

https://v8.dev/docs/stack-trace-api#customizing-stack-traces

#### Type declaration

▸ (`err`, `stackTraces`): `any`

##### Parameters

| Name | Type |
| :------ | :------ |
| `err` | `Error` |
| `stackTraces` | `CallSite`[] |

##### Returns

`any`

#### Inherited from

FastMCPError.prepareStackTrace

#### Defined in

node_modules/@types/node/globals.d.ts:98

___

### stackTraceLimit

▪ `Static` **stackTraceLimit**: `number`

#### Inherited from

FastMCPError.stackTraceLimit

#### Defined in

node_modules/@types/node/globals.d.ts:100

## Methods

### captureStackTrace

▸ **captureStackTrace**(`targetObject`, `constructorOpt?`): `void`

Create .stack property on a target object

#### Parameters

| Name | Type |
| :------ | :------ |
| `targetObject` | `object` |
| `constructorOpt?` | `Function` |

#### Returns

`void`

#### Inherited from

FastMCPError.captureStackTrace

#### Defined in

node_modules/@types/node/globals.d.ts:91
