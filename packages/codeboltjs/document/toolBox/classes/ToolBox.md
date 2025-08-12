[@codebolt/codeboltjs](../README.md) / [Exports](../modules.md) / ToolBox

# Class: ToolBox\<T\>

Class representing a toolbox for FastMCP.
Manages tools, resources, and prompts for a Model Context Protocol server.

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Record`\<`string`, `unknown`\> \| `undefined` = `undefined` |

## Hierarchy

- `FastMCPEventEmitter`

  ↳ **`ToolBox`**

## Table of contents

### Constructors

- [constructor](ToolBox.md#constructor)

### Properties

- [ \_emitType](ToolBox.md# _emittype)
- [ \_emitterType](ToolBox.md# _emittertype)
- [ \_eventsType](ToolBox.md# _eventstype)
- [#authenticate](ToolBox.md##authenticate)
- [#options](ToolBox.md##options)
- [#prompts](ToolBox.md##prompts)
- [#resources](ToolBox.md##resources)
- [#resourcesTemplates](ToolBox.md##resourcestemplates)
- [#sessions](ToolBox.md##sessions)
- [#sseServer](ToolBox.md##sseserver)
- [#tools](ToolBox.md##tools)
- [options](ToolBox.md#options)

### Accessors

- [sessions](ToolBox.md#sessions)

### Methods

- [[captureRejectionSymbol]](ToolBox.md#[capturerejectionsymbol])
- [activate](ToolBox.md#activate)
- [addListener](ToolBox.md#addlistener)
- [addPrompt](ToolBox.md#addprompt)
- [addResource](ToolBox.md#addresource)
- [addResourceTemplate](ToolBox.md#addresourcetemplate)
- [addTool](ToolBox.md#addtool)
- [emit](ToolBox.md#emit)
- [eventNames](ToolBox.md#eventnames)
- [getMaxListeners](ToolBox.md#getmaxlisteners)
- [listenerCount](ToolBox.md#listenercount)
- [listeners](ToolBox.md#listeners)
- [off](ToolBox.md#off)
- [on](ToolBox.md#on)
- [once](ToolBox.md#once)
- [prependListener](ToolBox.md#prependlistener)
- [prependOnceListener](ToolBox.md#prependoncelistener)
- [rawListeners](ToolBox.md#rawlisteners)
- [removeAllListeners](ToolBox.md#removealllisteners)
- [removeListener](ToolBox.md#removelistener)
- [setMaxListeners](ToolBox.md#setmaxlisteners)
- [start](ToolBox.md#start)
- [stop](ToolBox.md#stop)

## Constructors

### constructor

• **new ToolBox**\<`T`\>(`options`): [`ToolBox`](ToolBox.md)\<`T`\>

Creates a new ToolBox instance.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `undefined` \| `Record`\<`string`, `unknown`\> = `undefined` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | `ServerOptions`\<`T`\> | Configuration options for the toolbox |

#### Returns

[`ToolBox`](ToolBox.md)\<`T`\>

#### Overrides

FastMCPEventEmitter.constructor

#### Defined in

[src/utils/toolBox.ts:1236](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L1236)

## Properties

###  \_emitType

• `Optional` ** \_emitType**: `FastMCPEvents`\<`FastMCPSessionAuth`\>

#### Inherited from

FastMCPEventEmitter. \_emitType

#### Defined in

node_modules/strict-event-emitter-types/types/src/index.d.ts:7

___

###  \_emitterType

• `Optional` ** \_emitterType**: `EventEmitter`\<`DefaultEventMap`\>

#### Inherited from

FastMCPEventEmitter. \_emitterType

#### Defined in

node_modules/strict-event-emitter-types/types/src/index.d.ts:5

___

###  \_eventsType

• `Optional` ** \_eventsType**: `FastMCPEvents`\<`FastMCPSessionAuth`\>

#### Inherited from

FastMCPEventEmitter. \_eventsType

#### Defined in

node_modules/strict-event-emitter-types/types/src/index.d.ts:6

___

### #authenticate

• `Private` **#authenticate**: `undefined` \| `Authenticate`\<`T`\>

#### Defined in

[src/utils/toolBox.ts:1229](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L1229)

___

### #options

• `Private` **#options**: `ServerOptions`\<`T`\>

#### Defined in

[src/utils/toolBox.ts:1222](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L1222)

___

### #prompts

• `Private` **#prompts**: `InputPrompt`\<`Readonly`\<\{ `complete?`: `ArgumentValueCompleter` ; `description?`: `string` ; `enum?`: `string`[] ; `name`: `string` ; `required?`: `boolean`  }\>[], `PromptArgumentsToObject`\<`Readonly`\<\{ `complete?`: `ArgumentValueCompleter` ; `description?`: `string` ; `enum?`: `string`[] ; `name`: `string` ; `required?`: `boolean`  }\>[]\>\>[] = `[]`

#### Defined in

[src/utils/toolBox.ts:1223](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L1223)

___

### #resources

• `Private` **#resources**: `Resource`[] = `[]`

#### Defined in

[src/utils/toolBox.ts:1224](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L1224)

___

### #resourcesTemplates

• `Private` **#resourcesTemplates**: `InputResourceTemplate`\<`Readonly`\<\{ `complete?`: `ArgumentValueCompleter` ; `description?`: `string` ; `name`: `string`  }\>[]\>[] = `[]`

#### Defined in

[src/utils/toolBox.ts:1225](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L1225)

___

### #sessions

• `Private` **#sessions**: [`FastMCPSession`](FastMCPSession.md)\<`T`\>[] = `[]`

#### Defined in

[src/utils/toolBox.ts:1226](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L1226)

___

### #sseServer

• `Private` **#sseServer**: ``null`` \| [`SSEServer`](../modules.md#sseserver) = `null`

#### Defined in

[src/utils/toolBox.ts:1227](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L1227)

___

### #tools

• `Private` **#tools**: `Tool`\<`T`, `ZodTypeAny`\>[] = `[]`

#### Defined in

[src/utils/toolBox.ts:1228](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L1228)

___

### options

• **options**: `ServerOptions`\<`T`\>

Configuration options for the toolbox

#### Defined in

[src/utils/toolBox.ts:1236](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L1236)

## Accessors

### sessions

• `get` **sessions**(): [`FastMCPSession`](FastMCPSession.md)\<`T`\>[]

Gets all active sessions.

#### Returns

[`FastMCPSession`](FastMCPSession.md)\<`T`\>[]

#### Defined in

[src/utils/toolBox.ts:1246](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L1246)

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

FastMCPEventEmitter.[captureRejectionSymbol]

#### Defined in

node_modules/@types/node/events.d.ts:136

___

### activate

▸ **activate**(`options?`): `Promise`\<`void`\>

Activates the server.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | \{ `transportType`: ``"stdio"``  } \| \{ `sse`: \{ `endpoint`: \`/$\{string}\` ; `port`: `number`  } ; `transportType`: ``"sse"``  } | Options for the server transport |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/utils/toolBox.ts:1346](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L1346)

___

### addListener

▸ **addListener**\<`P`, `T`\>(`this`, `event`, `listener`): `T`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `P` | extends keyof `FastMCPEvents`\<`FastMCPSessionAuth`\> |
| `T` | `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `this` | `T` |
| `event` | `P` |
| `listener` | (...`args`: `ListenerType`\<`FastMCPEvents`\<`FastMCPSessionAuth`\>[`P`]\>) => `void` |

#### Returns

`T`

#### Inherited from

FastMCPEventEmitter.addListener

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

FastMCPEventEmitter.addListener

#### Defined in

node_modules/strict-event-emitter-types/types/src/index.d.ts:18

___

### addPrompt

▸ **addPrompt**\<`Args`\>(`prompt`): `void`

Adds a prompt to the server.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Args` | extends `Readonly`\<\{ `complete?`: `ArgumentValueCompleter` ; `description?`: `string` ; `enum?`: `string`[] ; `name`: `string` ; `required?`: `boolean`  }\>[] |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `prompt` | `InputPrompt`\<`Args`, `PromptArgumentsToObject`\<`Args`\>\> | The prompt to add |

#### Returns

`void`

#### Defined in

[src/utils/toolBox.ts:1284](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L1284)

___

### addResource

▸ **addResource**(`resource`): `void`

Adds a resource to the server.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `resource` | `Resource` | The resource to add |

#### Returns

`void`

#### Defined in

[src/utils/toolBox.ts:1264](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L1264)

___

### addResourceTemplate

▸ **addResourceTemplate**\<`Args`\>(`resource`): `void`

Adds a resource template to the server.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Args` | extends `Readonly`\<\{ `complete?`: `ArgumentValueCompleter` ; `description?`: `string` ; `name`: `string`  }\>[] |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `resource` | `InputResourceTemplate`\<`Args`\> | The resource template to add |

#### Returns

`void`

#### Defined in

[src/utils/toolBox.ts:1273](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L1273)

___

### addTool

▸ **addTool**\<`Params`\>(`tool`): `void`

Adds a tool to the server.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Params` | extends `ZodTypeAny` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tool` | `Tool`\<`T`, `Params`\> | The tool to add |

#### Returns

`void`

#### Defined in

[src/utils/toolBox.ts:1255](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L1255)

___

### emit

▸ **emit**\<`P`, `T`\>(`this`, `event`, `...args`): `T`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `P` | extends keyof `FastMCPEvents`\<`FastMCPSessionAuth`\> |
| `T` | `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `this` | `T` |
| `event` | `P` |
| `...args` | `ListenerType`\<`FastMCPEvents`\<`FastMCPSessionAuth`\>[`P`]\> |

#### Returns

`T`

#### Inherited from

FastMCPEventEmitter.emit

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

FastMCPEventEmitter.emit

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

FastMCPEventEmitter.eventNames

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

FastMCPEventEmitter.getMaxListeners

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

FastMCPEventEmitter.listenerCount

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

FastMCPEventEmitter.listeners

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

FastMCPEventEmitter.off

#### Defined in

node_modules/@types/node/events.d.ts:747

___

### on

▸ **on**\<`P`, `T`\>(`this`, `event`, `listener`): `T`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `P` | extends keyof `FastMCPEvents`\<`FastMCPSessionAuth`\> |
| `T` | `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `this` | `T` |
| `event` | `P` |
| `listener` | (...`args`: `ListenerType`\<`FastMCPEvents`\<`FastMCPSessionAuth`\>[`P`]\>) => `void` |

#### Returns

`T`

#### Inherited from

FastMCPEventEmitter.on

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

FastMCPEventEmitter.on

#### Defined in

node_modules/strict-event-emitter-types/types/src/index.d.ts:16

___

### once

▸ **once**\<`P`, `T`\>(`this`, `event`, `listener`): `T`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `P` | extends keyof `FastMCPEvents`\<`FastMCPSessionAuth`\> |
| `T` | `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `this` | `T` |
| `event` | `P` |
| `listener` | (...`args`: `ListenerType`\<`FastMCPEvents`\<`FastMCPSessionAuth`\>[`P`]\>) => `void` |

#### Returns

`T`

#### Inherited from

FastMCPEventEmitter.once

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

FastMCPEventEmitter.once

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

FastMCPEventEmitter.prependListener

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

FastMCPEventEmitter.prependOnceListener

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

FastMCPEventEmitter.rawListeners

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

FastMCPEventEmitter.removeAllListeners

#### Defined in

node_modules/@types/node/events.d.ts:758

___

### removeListener

▸ **removeListener**\<`P`, `T`\>(`this`, `event`, `listener`): `T`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `P` | extends keyof `FastMCPEvents`\<`FastMCPSessionAuth`\> |
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

FastMCPEventEmitter.removeListener

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

FastMCPEventEmitter.removeListener

#### Defined in

node_modules/strict-event-emitter-types/types/src/index.d.ts:22

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

FastMCPEventEmitter.setMaxListeners

#### Defined in

node_modules/@types/node/events.d.ts:768

___

### start

▸ **start**(`options?`): `Promise`\<`void`\>

Starts the server.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | \{ `transportType`: ``"stdio"``  } \| \{ `sse`: \{ `endpoint`: \`/$\{string}\` ; `port`: `number`  } ; `transportType`: ``"sse"``  } | Options for the server transport |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/utils/toolBox.ts:1295](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L1295)

___

### stop

▸ **stop**(): `Promise`\<`void`\>

Stops the server.

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/utils/toolBox.ts:1335](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L1335)
