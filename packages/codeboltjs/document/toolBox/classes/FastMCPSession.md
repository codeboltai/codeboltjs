[@codebolt/codeboltjs](../README.md) / [Exports](../modules.md) / FastMCPSession

# Class: FastMCPSession\<T\>

Class representing a FastMCP session.
Manages communication between the client and server.

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `FastMCPSessionAuth` = `FastMCPSessionAuth` |

## Hierarchy

- `FastMCPSessionEventEmitter`

  ↳ **`FastMCPSession`**

## Table of contents

### Constructors

- [constructor](FastMCPSession.md#constructor)

### Properties

- [ \_emitType](FastMCPSession.md# _emittype)
- [ \_emitterType](FastMCPSession.md# _emittertype)
- [ \_eventsType](FastMCPSession.md# _eventstype)
- [#auth](FastMCPSession.md##auth)
- [#capabilities](FastMCPSession.md##capabilities)
- [#clientCapabilities](FastMCPSession.md##clientcapabilities)
- [#loggingLevel](FastMCPSession.md##logginglevel)
- [#pingInterval](FastMCPSession.md##pinginterval)
- [#prompts](FastMCPSession.md##prompts)
- [#resourceTemplates](FastMCPSession.md##resourcetemplates)
- [#resources](FastMCPSession.md##resources)
- [#roots](FastMCPSession.md##roots)
- [#server](FastMCPSession.md##server)

### Accessors

- [clientCapabilities](FastMCPSession.md#clientcapabilities)
- [loggingLevel](FastMCPSession.md#logginglevel)
- [roots](FastMCPSession.md#roots)
- [server](FastMCPSession.md#server)

### Methods

- [[captureRejectionSymbol]](FastMCPSession.md#[capturerejectionsymbol])
- [addListener](FastMCPSession.md#addlistener)
- [addPrompt](FastMCPSession.md#addprompt)
- [addResource](FastMCPSession.md#addresource)
- [addResourceTemplate](FastMCPSession.md#addresourcetemplate)
- [close](FastMCPSession.md#close)
- [connect](FastMCPSession.md#connect)
- [emit](FastMCPSession.md#emit)
- [eventNames](FastMCPSession.md#eventnames)
- [getMaxListeners](FastMCPSession.md#getmaxlisteners)
- [listenerCount](FastMCPSession.md#listenercount)
- [listeners](FastMCPSession.md#listeners)
- [off](FastMCPSession.md#off)
- [on](FastMCPSession.md#on)
- [once](FastMCPSession.md#once)
- [prependListener](FastMCPSession.md#prependlistener)
- [prependOnceListener](FastMCPSession.md#prependoncelistener)
- [rawListeners](FastMCPSession.md#rawlisteners)
- [removeAllListeners](FastMCPSession.md#removealllisteners)
- [removeListener](FastMCPSession.md#removelistener)
- [requestSampling](FastMCPSession.md#requestsampling)
- [setMaxListeners](FastMCPSession.md#setmaxlisteners)
- [setupCompleteHandlers](FastMCPSession.md#setupcompletehandlers)
- [setupErrorHandling](FastMCPSession.md#setuperrorhandling)
- [setupLoggingHandlers](FastMCPSession.md#setuplogginghandlers)
- [setupPromptHandlers](FastMCPSession.md#setupprompthandlers)
- [setupResourceHandlers](FastMCPSession.md#setupresourcehandlers)
- [setupResourceTemplateHandlers](FastMCPSession.md#setupresourcetemplatehandlers)
- [setupRootsHandlers](FastMCPSession.md#setuprootshandlers)
- [setupToolHandlers](FastMCPSession.md#setuptoolhandlers)

## Constructors

### constructor

• **new FastMCPSession**\<`T`\>(`options`): [`FastMCPSession`](FastMCPSession.md)\<`T`\>

Creates a new FastMCPSession.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `FastMCPSessionAuth` = `FastMCPSessionAuth` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | `Object` | Configuration options for the session |
| `options.auth?` | `T` | - |
| `options.name` | `string` | - |
| `options.prompts` | `Prompt`\<`Readonly`\<\{ `complete?`: `ArgumentValueCompleter` ; `description?`: `string` ; `enum?`: `string`[] ; `name`: `string` ; `required?`: `boolean`  }\>[], `PromptArgumentsToObject`\<`Readonly`\<\{ `complete?`: `ArgumentValueCompleter` ; `description?`: `string` ; `enum?`: `string`[] ; `name`: `string` ; `required?`: `boolean`  }\>[]\>\>[] | - |
| `options.resources` | `Resource`[] | - |
| `options.resourcesTemplates` | `InputResourceTemplate`\<`Readonly`\<\{ `complete?`: `ArgumentValueCompleter` ; `description?`: `string` ; `name`: `string`  }\>[]\>[] | - |
| `options.tools` | `Tool`\<`T`, `ZodTypeAny`\>[] | - |
| `options.version` | `string` | - |

#### Returns

[`FastMCPSession`](FastMCPSession.md)\<`T`\>

#### Overrides

FastMCPSessionEventEmitter.constructor

#### Defined in

[src/utils/toolBox.ts:572](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L572)

## Properties

###  \_emitType

• `Optional` ** \_emitType**: `FastMCPSessionEvents`

#### Inherited from

FastMCPSessionEventEmitter. \_emitType

#### Defined in

node_modules/strict-event-emitter-types/types/src/index.d.ts:7

___

###  \_emitterType

• `Optional` ** \_emitterType**: `EventEmitter`\<`DefaultEventMap`\>

#### Inherited from

FastMCPSessionEventEmitter. \_emitterType

#### Defined in

node_modules/strict-event-emitter-types/types/src/index.d.ts:5

___

###  \_eventsType

• `Optional` ** \_eventsType**: `FastMCPSessionEvents`

#### Inherited from

FastMCPSessionEventEmitter. \_eventsType

#### Defined in

node_modules/strict-event-emitter-types/types/src/index.d.ts:6

___

### #auth

• `Private` **#auth**: `undefined` \| `T`

#### Defined in

[src/utils/toolBox.ts:565](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L565)

___

### #capabilities

• `Private` **#capabilities**: `Object` = `{}`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `completions?` | {} | Present if the server supports sending completions to the client. |
| `experimental?` | {} | Experimental, non-standard capabilities that the server supports. |
| `logging?` | {} | Present if the server supports sending log messages to the client. |
| `prompts?` | \{ `listChanged?`: `boolean`  } | Present if the server offers any prompt templates. |
| `prompts.listChanged?` | `boolean` | Whether this server supports issuing notifications for changes to the prompt list. |
| `resources?` | \{ `listChanged?`: `boolean` ; `subscribe?`: `boolean`  } | Present if the server offers any resources to read. |
| `resources.listChanged?` | `boolean` | Whether this server supports issuing notifications for changes to the resource list. |
| `resources.subscribe?` | `boolean` | Whether this server supports clients subscribing to resource updates. |
| `tools?` | \{ `listChanged?`: `boolean`  } | Present if the server offers any tools to call. |
| `tools.listChanged?` | `boolean` | Whether this server supports issuing notifications for changes to the tool list. |

#### Defined in

[src/utils/toolBox.ts:557](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L557)

___

### #clientCapabilities

• `Private` `Optional` **#clientCapabilities**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `experimental?` | {} | Experimental, non-standard capabilities that the client supports. |
| `roots?` | \{ `listChanged?`: `boolean`  } | Present if the client supports listing roots. |
| `roots.listChanged?` | `boolean` | Whether the client supports issuing notifications for changes to the roots list. |
| `sampling?` | {} | Present if the client supports sampling from an LLM. |

#### Defined in

[src/utils/toolBox.ts:558](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L558)

___

### #loggingLevel

• `Private` **#loggingLevel**: `LoggingLevel` = `"info"`

#### Defined in

[src/utils/toolBox.ts:559](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L559)

___

### #pingInterval

• `Private` **#pingInterval**: ``null`` \| `Timeout` = `null`

#### Defined in

[src/utils/toolBox.ts:726](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L726)

___

### #prompts

• `Private` **#prompts**: `Prompt`\<`Readonly`\<\{ `complete?`: `ArgumentValueCompleter` ; `description?`: `string` ; `enum?`: `string`[] ; `name`: `string` ; `required?`: `boolean`  }\>[], `PromptArgumentsToObject`\<`Readonly`\<\{ `complete?`: `ArgumentValueCompleter` ; `description?`: `string` ; `enum?`: `string`[] ; `name`: `string` ; `required?`: `boolean`  }\>[]\>\>[] = `[]`

#### Defined in

[src/utils/toolBox.ts:560](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L560)

___

### #resourceTemplates

• `Private` **#resourceTemplates**: `ResourceTemplate`\<`Readonly`\<\{ `complete?`: `ArgumentValueCompleter` ; `description?`: `string` ; `name`: `string`  }\>[]\>[] = `[]`

#### Defined in

[src/utils/toolBox.ts:562](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L562)

___

### #resources

• `Private` **#resources**: `Resource`[] = `[]`

#### Defined in

[src/utils/toolBox.ts:561](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L561)

___

### #roots

• `Private` **#roots**: \{ `name?`: `string` ; `uri`: `string`  }[] = `[]`

#### Defined in

[src/utils/toolBox.ts:563](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L563)

___

### #server

• `Private` **#server**: `Server`\<\{ `method`: `string` ; `params?`: \{ `_meta?`: \{ `progressToken?`: `string` \| `number`  }  }  }, \{ `method`: `string` ; `params?`: \{ `_meta?`: {}  }  }, \{ `_meta?`: {}  }\>

#### Defined in

[src/utils/toolBox.ts:564](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L564)

## Accessors

### clientCapabilities

• `get` **clientCapabilities**(): ``null`` \| \{ `experimental?`: {} ; `roots?`: \{ `listChanged?`: `boolean`  } ; `sampling?`: {}  }

#### Returns

``null`` \| \{ `experimental?`: {} ; `roots?`: \{ `listChanged?`: `boolean`  } ; `sampling?`: {}  }

#### Defined in

[src/utils/toolBox.ts:718](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L718)

___

### loggingLevel

• `get` **loggingLevel**(): `LoggingLevel`

#### Returns

`LoggingLevel`

#### Defined in

[src/utils/toolBox.ts:799](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L799)

___

### roots

• `get` **roots**(): \{ `name?`: `string` ; `uri`: `string`  }[]

#### Returns

\{ `name?`: `string` ; `uri`: `string`  }[]

#### Defined in

[src/utils/toolBox.ts:777](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L777)

___

### server

• `get` **server**(): `Server`\<\{ `method`: `string` ; `params?`: \{ `_meta?`: \{ `progressToken?`: `string` \| `number`  }  }  }, \{ `method`: `string` ; `params?`: \{ `_meta?`: {}  }  }, \{ `_meta?`: {}  }\>

#### Returns

`Server`\<\{ `method`: `string` ; `params?`: \{ `_meta?`: \{ `progressToken?`: `string` \| `number`  }  }  }, \{ `method`: `string` ; `params?`: \{ `_meta?`: {}  }  }, \{ `_meta?`: {}  }\>

#### Defined in

[src/utils/toolBox.ts:722](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L722)

## Methods

### [captureRejectionSymbol]

▸ **[captureRejectionSymbol]**\<`K`\>(`error`, `event`, `...args`): `void`

#### Type parameters

| Name |
| :------ |
| `K` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `error` | `Error` |
| `event` | `string` \| `symbol` |
| `...args` | `AnyRest` |

#### Returns

`void`

#### Inherited from

FastMCPSessionEventEmitter.[captureRejectionSymbol]

#### Defined in

node_modules/@types/node/events.d.ts:136

___

### addListener

▸ **addListener**\<`P`, `T`\>(`this`, `event`, `listener`): `T`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `P` | extends keyof `FastMCPSessionEvents` |
| `T` | `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `this` | `T` |
| `event` | `P` |
| `listener` | (...`args`: `ListenerType`\<`FastMCPSessionEvents`[`P`]\>) => `void` |

#### Returns

`T`

#### Inherited from

FastMCPSessionEventEmitter.addListener

#### Defined in

node_modules/strict-event-emitter-types/types/src/index.d.ts:17

▸ **addListener**(`event`, `listener`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | typeof `assignmentCompatibilityHack` |
| `listener` | (...`args`: `any`[]) => `any` |

#### Returns

`void`

#### Inherited from

FastMCPSessionEventEmitter.addListener

#### Defined in

node_modules/strict-event-emitter-types/types/src/index.d.ts:18

___

### addPrompt

▸ **addPrompt**(`inputPrompt`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `inputPrompt` | `InputPrompt`\<`Readonly`\<\{ `complete?`: `ArgumentValueCompleter` ; `description?`: `string` ; `enum?`: `string`[] ; `name`: `string` ; `required?`: `boolean`  }\>[], `PromptArgumentsToObject`\<`Readonly`\<\{ `complete?`: `ArgumentValueCompleter` ; `description?`: `string` ; `enum?`: `string`[] ; `name`: `string` ; `required?`: `boolean`  }\>[]\>\> |

#### Returns

`void`

#### Defined in

[src/utils/toolBox.ts:675](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L675)

___

### addResource

▸ **addResource**(`inputResource`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `inputResource` | `Resource` |

#### Returns

`void`

#### Defined in

[src/utils/toolBox.ts:646](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L646)

___

### addResourceTemplate

▸ **addResourceTemplate**(`inputResourceTemplate`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `inputResourceTemplate` | `InputResourceTemplate`\<`Readonly`\<\{ `complete?`: `ArgumentValueCompleter` ; `description?`: `string` ; `name`: `string`  }\>[]\> |

#### Returns

`void`

#### Defined in

[src/utils/toolBox.ts:650](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L650)

___

### close

▸ **close**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/utils/toolBox.ts:781](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L781)

___

### connect

▸ **connect**(`transport`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `transport` | `Transport` |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/utils/toolBox.ts:734](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L734)

___

### emit

▸ **emit**\<`P`, `T`\>(`this`, `event`, `...args`): `T`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `P` | extends keyof `FastMCPSessionEvents` |
| `T` | `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `this` | `T` |
| `event` | `P` |
| `...args` | `ListenerType`\<`FastMCPSessionEvents`[`P`]\> |

#### Returns

`T`

#### Inherited from

FastMCPSessionEventEmitter.emit

#### Defined in

node_modules/strict-event-emitter-types/types/src/index.d.ts:27

▸ **emit**(`event`, `...args`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | typeof `assignmentCompatibilityHack` |
| `...args` | `any`[] |

#### Returns

`void`

#### Inherited from

FastMCPSessionEventEmitter.emit

#### Defined in

node_modules/strict-event-emitter-types/types/src/index.d.ts:28

___

### eventNames

▸ **eventNames**(): (`string` \| `symbol`)[]

Returns an array listing the events for which the emitter has registered
listeners. The values in the array are strings or `Symbol`s.

```js
import { EventEmitter } from 'node:events';

const myEE = new EventEmitter();
myEE.on('foo', () => {});
myEE.on('bar', () => {});

const sym = Symbol('symbol');
myEE.on(sym, () => {});

console.log(myEE.eventNames());
// Prints: [ 'foo', 'bar', Symbol(symbol) ]
```

#### Returns

(`string` \| `symbol`)[]

**`Since`**

v6.0.0

#### Inherited from

FastMCPSessionEventEmitter.eventNames

#### Defined in

node_modules/@types/node/events.d.ts:922

___

### getMaxListeners

▸ **getMaxListeners**(): `number`

Returns the current max listener value for the `EventEmitter` which is either
set by `emitter.setMaxListeners(n)` or defaults to EventEmitter.defaultMaxListeners.

#### Returns

`number`

**`Since`**

v1.0.0

#### Inherited from

FastMCPSessionEventEmitter.getMaxListeners

#### Defined in

node_modules/@types/node/events.d.ts:774

___

### listenerCount

▸ **listenerCount**\<`K`\>(`eventName`, `listener?`): `number`

Returns the number of listeners listening for the event named `eventName`.
If `listener` is provided, it will return how many times the listener is found
in the list of the listeners of the event.

#### Type parameters

| Name |
| :------ |
| `K` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `eventName` | `string` \| `symbol` | The name of the event being listened for |
| `listener?` | `Function` | The event handler function |

#### Returns

`number`

**`Since`**

v3.2.0

#### Inherited from

FastMCPSessionEventEmitter.listenerCount

#### Defined in

node_modules/@types/node/events.d.ts:868

___

### listeners

▸ **listeners**\<`K`\>(`eventName`): `Function`[]

Returns a copy of the array of listeners for the event named `eventName`.

```js
server.on('connection', (stream) => {
  console.log('someone connected!');
});
console.log(util.inspect(server.listeners('connection')));
// Prints: [ [Function] ]
```

#### Type parameters

| Name |
| :------ |
| `K` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `eventName` | `string` \| `symbol` |

#### Returns

`Function`[]

**`Since`**

v0.1.26

#### Inherited from

FastMCPSessionEventEmitter.listeners

#### Defined in

node_modules/@types/node/events.d.ts:787

___

### off

▸ **off**\<`K`\>(`eventName`, `listener`): `this`

Alias for `emitter.removeListener()`.

#### Type parameters

| Name |
| :------ |
| `K` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `eventName` | `string` \| `symbol` |
| `listener` | (...`args`: `any`[]) => `void` |

#### Returns

`this`

**`Since`**

v10.0.0

#### Inherited from

FastMCPSessionEventEmitter.off

#### Defined in

node_modules/@types/node/events.d.ts:747

___

### on

▸ **on**\<`P`, `T`\>(`this`, `event`, `listener`): `T`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `P` | extends keyof `FastMCPSessionEvents` |
| `T` | `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `this` | `T` |
| `event` | `P` |
| `listener` | (...`args`: `ListenerType`\<`FastMCPSessionEvents`[`P`]\>) => `void` |

#### Returns

`T`

#### Inherited from

FastMCPSessionEventEmitter.on

#### Defined in

node_modules/strict-event-emitter-types/types/src/index.d.ts:15

▸ **on**(`event`, `listener`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | typeof `assignmentCompatibilityHack` |
| `listener` | (...`args`: `any`[]) => `any` |

#### Returns

`void`

#### Inherited from

FastMCPSessionEventEmitter.on

#### Defined in

node_modules/strict-event-emitter-types/types/src/index.d.ts:16

___

### once

▸ **once**\<`P`, `T`\>(`this`, `event`, `listener`): `T`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `P` | extends keyof `FastMCPSessionEvents` |
| `T` | `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `this` | `T` |
| `event` | `P` |
| `listener` | (...`args`: `ListenerType`\<`FastMCPSessionEvents`[`P`]\>) => `void` |

#### Returns

`T`

#### Inherited from

FastMCPSessionEventEmitter.once

#### Defined in

node_modules/strict-event-emitter-types/types/src/index.d.ts:25

▸ **once**(`event`, `listener`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | typeof `assignmentCompatibilityHack` |
| `listener` | (...`args`: `any`[]) => `any` |

#### Returns

`void`

#### Inherited from

FastMCPSessionEventEmitter.once

#### Defined in

node_modules/strict-event-emitter-types/types/src/index.d.ts:26

___

### prependListener

▸ **prependListener**\<`K`\>(`eventName`, `listener`): `this`

Adds the `listener` function to the _beginning_ of the listeners array for the
event named `eventName`. No checks are made to see if the `listener` has
already been added. Multiple calls passing the same combination of `eventName`
and `listener` will result in the `listener` being added, and called, multiple times.

```js
server.prependListener('connection', (stream) => {
  console.log('someone connected!');
});
```

Returns a reference to the `EventEmitter`, so that calls can be chained.

#### Type parameters

| Name |
| :------ |
| `K` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `eventName` | `string` \| `symbol` | The name of the event. |
| `listener` | (...`args`: `any`[]) => `void` | The callback function |

#### Returns

`this`

**`Since`**

v6.0.0

#### Inherited from

FastMCPSessionEventEmitter.prependListener

#### Defined in

node_modules/@types/node/events.d.ts:886

___

### prependOnceListener

▸ **prependOnceListener**\<`K`\>(`eventName`, `listener`): `this`

Adds a **one-time**`listener` function for the event named `eventName` to the _beginning_ of the listeners array. The next time `eventName` is triggered, this
listener is removed, and then invoked.

```js
server.prependOnceListener('connection', (stream) => {
  console.log('Ah, we have our first user!');
});
```

Returns a reference to the `EventEmitter`, so that calls can be chained.

#### Type parameters

| Name |
| :------ |
| `K` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `eventName` | `string` \| `symbol` | The name of the event. |
| `listener` | (...`args`: `any`[]) => `void` | The callback function |

#### Returns

`this`

**`Since`**

v6.0.0

#### Inherited from

FastMCPSessionEventEmitter.prependOnceListener

#### Defined in

node_modules/@types/node/events.d.ts:902

___

### rawListeners

▸ **rawListeners**\<`K`\>(`eventName`): `Function`[]

Returns a copy of the array of listeners for the event named `eventName`,
including any wrappers (such as those created by `.once()`).

```js
import { EventEmitter } from 'node:events';
const emitter = new EventEmitter();
emitter.once('log', () => console.log('log once'));

// Returns a new Array with a function `onceWrapper` which has a property
// `listener` which contains the original listener bound above
const listeners = emitter.rawListeners('log');
const logFnWrapper = listeners[0];

// Logs "log once" to the console and does not unbind the `once` event
logFnWrapper.listener();

// Logs "log once" to the console and removes the listener
logFnWrapper();

emitter.on('log', () => console.log('log persistently'));
// Will return a new Array with a single function bound by `.on()` above
const newListeners = emitter.rawListeners('log');

// Logs "log persistently" twice
newListeners[0]();
emitter.emit('log');
```

#### Type parameters

| Name |
| :------ |
| `K` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `eventName` | `string` \| `symbol` |

#### Returns

`Function`[]

**`Since`**

v9.4.0

#### Inherited from

FastMCPSessionEventEmitter.rawListeners

#### Defined in

node_modules/@types/node/events.d.ts:818

___

### removeAllListeners

▸ **removeAllListeners**(`eventName?`): `this`

Removes all listeners, or those of the specified `eventName`.

It is bad practice to remove listeners added elsewhere in the code,
particularly when the `EventEmitter` instance was created by some other
component or module (e.g. sockets or file streams).

Returns a reference to the `EventEmitter`, so that calls can be chained.

#### Parameters

| Name | Type |
| :------ | :------ |
| `eventName?` | `string` \| `symbol` |

#### Returns

`this`

**`Since`**

v0.1.26

#### Inherited from

FastMCPSessionEventEmitter.removeAllListeners

#### Defined in

node_modules/@types/node/events.d.ts:758

___

### removeListener

▸ **removeListener**\<`P`, `T`\>(`this`, `event`, `listener`): `T`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `P` | extends keyof `FastMCPSessionEvents` |
| `T` | `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `this` | `T` |
| `event` | `P` |
| `listener` | (...`args`: `any`[]) => `any` |

#### Returns

`T`

#### Inherited from

FastMCPSessionEventEmitter.removeListener

#### Defined in

node_modules/strict-event-emitter-types/types/src/index.d.ts:21

▸ **removeListener**(`event`, `listener`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | typeof `assignmentCompatibilityHack` |
| `listener` | (...`args`: `any`[]) => `any` |

#### Returns

`void`

#### Inherited from

FastMCPSessionEventEmitter.removeListener

#### Defined in

node_modules/strict-event-emitter-types/types/src/index.d.ts:22

___

### requestSampling

▸ **requestSampling**(`message`): `Promise`\<`SamplingResponse`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | \{ `_meta?`: `objectOutputType`\<\{ `progressToken`: `ZodOptional`\<`ZodUnion`\<[`ZodString`, `ZodNumber`]\>\>  }, `ZodTypeAny`, ``"passthrough"``\> ; `includeContext?`: ``"none"`` \| ``"thisServer"`` \| ``"allServers"`` ; `maxTokens`: `number` ; `messages`: `objectOutputType`\<\{ `content`: `ZodUnion`\<[`ZodObject`\<\{ `text`: `ZodString` ; `type`: `ZodLiteral`\<``"text"``\>  }, ``"passthrough"``, `ZodTypeAny`, `objectOutputType`\<\{ `text`: `ZodString` ; `type`: `ZodLiteral`\<...\>  }, `ZodTypeAny`, ``"passthrough"``\>, `objectInputType`\<\{ `text`: `ZodString` ; `type`: `ZodLiteral`\<...\>  }, `ZodTypeAny`, ``"passthrough"``\>\>, `ZodObject`\<\{ `data`: `ZodString` ; `mimeType`: `ZodString` ; `type`: `ZodLiteral`\<``"image"``\>  }, ``"passthrough"``, `ZodTypeAny`, `objectOutputType`\<\{ `data`: `ZodString` ; `mimeType`: `ZodString` ; `type`: `ZodLiteral`\<...\>  }, `ZodTypeAny`, ``"passthrough"``\>, `objectInputType`\<\{ `data`: `ZodString` ; `mimeType`: `ZodString` ; `type`: `ZodLiteral`\<...\>  }, `ZodTypeAny`, ``"passthrough"``\>\>, `ZodObject`\<\{ `data`: `ZodString` ; `mimeType`: `ZodString` ; `type`: `ZodLiteral`\<``"audio"``\>  }, ``"passthrough"``, `ZodTypeAny`, `objectOutputType`\<\{ `data`: `ZodString` ; `mimeType`: `ZodString` ; `type`: `ZodLiteral`\<...\>  }, `ZodTypeAny`, ``"passthrough"``\>, `objectInputType`\<\{ `data`: `ZodString` ; `mimeType`: `ZodString` ; `type`: `ZodLiteral`\<...\>  }, `ZodTypeAny`, ``"passthrough"``\>\>]\> ; `role`: `ZodEnum`\<[``"user"``, ``"assistant"``]\>  }, `ZodTypeAny`, ``"passthrough"``\>[] ; `metadata?`: `objectOutputType`\<{}, `ZodTypeAny`, ``"passthrough"``\> ; `modelPreferences?`: `objectOutputType`\<\{ `costPriority`: `ZodOptional`\<`ZodNumber`\> ; `hints`: `ZodOptional`\<`ZodArray`\<`ZodObject`\<\{ `name`: `ZodOptional`\<`ZodString`\>  }, ``"passthrough"``, `ZodTypeAny`, `objectOutputType`\<\{ `name`: `ZodOptional`\<...\>  }, `ZodTypeAny`, ``"passthrough"``\>, `objectInputType`\<\{ `name`: `ZodOptional`\<...\>  }, `ZodTypeAny`, ``"passthrough"``\>\>, ``"many"``\>\> ; `intelligencePriority`: `ZodOptional`\<`ZodNumber`\> ; `speedPriority`: `ZodOptional`\<`ZodNumber`\>  }, `ZodTypeAny`, ``"passthrough"``\> ; `stopSequences?`: `string`[] ; `systemPrompt?`: `string` ; `temperature?`: `number`  } & \{ `[k: string]`: `unknown`;  } |

#### Returns

`Promise`\<`SamplingResponse`\>

#### Defined in

[src/utils/toolBox.ts:728](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L728)

___

### setMaxListeners

▸ **setMaxListeners**(`n`): `this`

By default `EventEmitter`s will print a warning if more than `10` listeners are
added for a particular event. This is a useful default that helps finding
memory leaks. The `emitter.setMaxListeners()` method allows the limit to be
modified for this specific `EventEmitter` instance. The value can be set to `Infinity` (or `0`) to indicate an unlimited number of listeners.

Returns a reference to the `EventEmitter`, so that calls can be chained.

#### Parameters

| Name | Type |
| :------ | :------ |
| `n` | `number` |

#### Returns

`this`

**`Since`**

v0.3.5

#### Inherited from

FastMCPSessionEventEmitter.setMaxListeners

#### Defined in

node_modules/@types/node/events.d.ts:768

___

### setupCompleteHandlers

▸ **setupCompleteHandlers**(): `void`

#### Returns

`void`

#### Defined in

[src/utils/toolBox.ts:803](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L803)

___

### setupErrorHandling

▸ **setupErrorHandling**(): `void`

#### Returns

`void`

#### Defined in

[src/utils/toolBox.ts:793](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L793)

___

### setupLoggingHandlers

▸ **setupLoggingHandlers**(): `void`

#### Returns

`void`

#### Defined in

[src/utils/toolBox.ts:891](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L891)

___

### setupPromptHandlers

▸ **setupPromptHandlers**(`prompts`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `prompts` | `Prompt`\<`Readonly`\<\{ `complete?`: `ArgumentValueCompleter` ; `description?`: `string` ; `enum?`: `string`[] ; `name`: `string` ; `required?`: `boolean`  }\>[], `PromptArgumentsToObject`\<`Readonly`\<\{ `complete?`: `ArgumentValueCompleter` ; `description?`: `string` ; `enum?`: `string`[] ; `name`: `string` ; `required?`: `boolean`  }\>[]\>\>[] |

#### Returns

`void`

#### Defined in

[src/utils/toolBox.ts:1148](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L1148)

___

### setupResourceHandlers

▸ **setupResourceHandlers**(`resources`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `resources` | `Resource`[] |

#### Returns

`void`

#### Defined in

[src/utils/toolBox.ts:1028](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L1028)

___

### setupResourceTemplateHandlers

▸ **setupResourceTemplateHandlers**(`resourceTemplates`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `resourceTemplates` | `ResourceTemplate`\<`Readonly`\<\{ `complete?`: `ArgumentValueCompleter` ; `description?`: `string` ; `name`: `string`  }\>[]\>[] |

#### Returns

`void`

#### Defined in

[src/utils/toolBox.ts:1132](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L1132)

___

### setupRootsHandlers

▸ **setupRootsHandlers**(): `void`

#### Returns

`void`

#### Defined in

[src/utils/toolBox.ts:876](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L876)

___

### setupToolHandlers

▸ **setupToolHandlers**(`tools`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `tools` | `Tool`\<`T`, `ZodTypeAny`\>[] |

#### Returns

`void`

#### Defined in

[src/utils/toolBox.ts:899](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L899)
