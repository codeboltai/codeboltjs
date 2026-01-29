[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / MessageManager

# Class: MessageManager

Defined in: [packages/codeboltjs/src/core/messageManager.ts:9](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/messageManager.ts#L9)

Centralized message manager for handling WebSocket communications

## Extends

- `EventEmitter`

## Constructors

### Constructor

> **new MessageManager**(`options?`): `MessageManager`

Defined in: node\_modules/.pnpm/@types+node@20.19.19/node\_modules/@types/node/events.d.ts:101

#### Parameters

##### options?

`EventEmitterOptions`

#### Returns

`MessageManager`

#### Inherited from

`EventEmitter.constructor`

## Properties

### pendingRequests

> **pendingRequests**: `Map`\<`string`, `PendingRequest`\>

Defined in: [packages/codeboltjs/src/core/messageManager.ts:10](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/messageManager.ts#L10)

***

### routes

> `private` **routes**: `MessageRoute`[] = `[]`

Defined in: [packages/codeboltjs/src/core/messageManager.ts:12](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/messageManager.ts#L12)

***

### subscriptions

> `private` **subscriptions**: `Map`\<`string`, `EventEmitter`\<`DefaultEventMap`\>\>

Defined in: [packages/codeboltjs/src/core/messageManager.ts:13](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/messageManager.ts#L13)

***

### websocket

> **websocket**: `null` \| `WebSocket` = `null`

Defined in: [packages/codeboltjs/src/core/messageManager.ts:11](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/messageManager.ts#L11)

***

### captureRejections

> `static` **captureRejections**: `boolean`

Defined in: node\_modules/.pnpm/@types+node@20.19.19/node\_modules/@types/node/events.d.ts:426

Value: [boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type)

Change the default `captureRejections` option on all new `EventEmitter` objects.

#### Since

v13.4.0, v12.16.0

#### Inherited from

`EventEmitter.captureRejections`

***

### captureRejectionSymbol

> `readonly` `static` **captureRejectionSymbol**: *typeof* [`captureRejectionSymbol`](#capturerejectionsymbol)

Defined in: node\_modules/.pnpm/@types+node@20.19.19/node\_modules/@types/node/events.d.ts:419

Value: `Symbol.for('nodejs.rejection')`

See how to write a custom `rejection handler`.

#### Since

v13.4.0, v12.16.0

#### Inherited from

`EventEmitter.captureRejectionSymbol`

***

### defaultMaxListeners

> `static` **defaultMaxListeners**: `number`

Defined in: node\_modules/.pnpm/@types+node@20.19.19/node\_modules/@types/node/events.d.ts:465

By default, a maximum of `10` listeners can be registered for any single
event. This limit can be changed for individual `EventEmitter` instances
using the `emitter.setMaxListeners(n)` method. To change the default
for _all_`EventEmitter` instances, the `events.defaultMaxListeners` property
can be used. If this value is not a positive number, a `RangeError` is thrown.

Take caution when setting the `events.defaultMaxListeners` because the
change affects _all_ `EventEmitter` instances, including those created before
the change is made. However, calling `emitter.setMaxListeners(n)` still has
precedence over `events.defaultMaxListeners`.

This is not a hard limit. The `EventEmitter` instance will allow
more listeners to be added but will output a trace warning to stderr indicating
that a "possible EventEmitter memory leak" has been detected. For any single
`EventEmitter`, the `emitter.getMaxListeners()` and `emitter.setMaxListeners()` methods can be used to
temporarily avoid this warning:

```js
import { EventEmitter } from 'node:events';
const emitter = new EventEmitter();
emitter.setMaxListeners(emitter.getMaxListeners() + 1);
emitter.once('event', () => {
  // do stuff
  emitter.setMaxListeners(Math.max(emitter.getMaxListeners() - 1, 0));
});
```

The `--trace-warnings` command-line flag can be used to display the
stack trace for such warnings.

The emitted warning can be inspected with `process.on('warning')` and will
have the additional `emitter`, `type`, and `count` properties, referring to
the event emitter instance, the event's name and the number of attached
listeners, respectively.
Its `name` property is set to `'MaxListenersExceededWarning'`.

#### Since

v0.11.2

#### Inherited from

`EventEmitter.defaultMaxListeners`

***

### errorMonitor

> `readonly` `static` **errorMonitor**: *typeof* [`errorMonitor`](#errormonitor)

Defined in: node\_modules/.pnpm/@types+node@20.19.19/node\_modules/@types/node/events.d.ts:412

This symbol shall be used to install a listener for only monitoring `'error'` events. Listeners installed using this symbol are called before the regular `'error'` listeners are called.

Installing a listener using this symbol does not change the behavior once an `'error'` event is emitted. Therefore, the process will still crash if no
regular `'error'` listener is installed.

#### Since

v13.6.0, v12.17.0

#### Inherited from

`EventEmitter.errorMonitor`

## Methods

### \[captureRejectionSymbol\]()?

> `optional` **\[captureRejectionSymbol\]**\<`K`\>(`error`, `event`, ...`args`): `void`

Defined in: node\_modules/.pnpm/@types+node@20.19.19/node\_modules/@types/node/events.d.ts:103

#### Type Parameters

##### K

`K`

#### Parameters

##### error

`Error`

##### event

`string` | `symbol`

##### args

...`AnyRest`

#### Returns

`void`

#### Inherited from

`EventEmitter.[captureRejectionSymbol]`

***

### addListener()

> **addListener**\<`K`\>(`eventName`, `listener`): `this`

Defined in: node\_modules/.pnpm/@types+node@20.19.19/node\_modules/@types/node/events.d.ts:643

Alias for `emitter.on(eventName, listener)`.

#### Type Parameters

##### K

`K`

#### Parameters

##### eventName

`string` | `symbol`

##### listener

(...`args`) => `void`

#### Returns

`this`

#### Since

v0.1.26

#### Inherited from

`EventEmitter.addListener`

***

### cleanup()

> **cleanup**(): `void`

Defined in: [packages/codeboltjs/src/core/messageManager.ts:211](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/messageManager.ts#L211)

Clean up all pending requests

#### Returns

`void`

***

### emit()

> **emit**\<`K`\>(`eventName`, ...`args`): `boolean`

Defined in: node\_modules/.pnpm/@types+node@20.19.19/node\_modules/@types/node/events.d.ts:905

Synchronously calls each of the listeners registered for the event named `eventName`, in the order they were registered, passing the supplied arguments
to each.

Returns `true` if the event had listeners, `false` otherwise.

```js
import { EventEmitter } from 'node:events';
const myEmitter = new EventEmitter();

// First listener
myEmitter.on('event', function firstListener() {
  console.log('Helloooo! first listener');
});
// Second listener
myEmitter.on('event', function secondListener(arg1, arg2) {
  console.log(`event with parameters ${arg1}, ${arg2} in second listener`);
});
// Third listener
myEmitter.on('event', function thirdListener(...args) {
  const parameters = args.join(', ');
  console.log(`event with parameters ${parameters} in third listener`);
});

console.log(myEmitter.listeners('event'));

myEmitter.emit('event', 1, 2, 3, 4, 5);

// Prints:
// [
//   [Function: firstListener],
//   [Function: secondListener],
//   [Function: thirdListener]
// ]
// Helloooo! first listener
// event with parameters 1, 2 in second listener
// event with parameters 1, 2, 3, 4, 5 in third listener
```

#### Type Parameters

##### K

`K`

#### Parameters

##### eventName

`string` | `symbol`

##### args

...`AnyRest`

#### Returns

`boolean`

#### Since

v0.1.26

#### Inherited from

`EventEmitter.emit`

***

### eventNames()

> **eventNames**(): (`string` \| `symbol`)[]

Defined in: node\_modules/.pnpm/@types+node@20.19.19/node\_modules/@types/node/events.d.ts:968

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

#### Since

v6.0.0

#### Inherited from

`EventEmitter.eventNames`

***

### getMaxListeners()

> **getMaxListeners**(): `number`

Defined in: node\_modules/.pnpm/@types+node@20.19.19/node\_modules/@types/node/events.d.ts:820

Returns the current max listener value for the `EventEmitter` which is either
set by `emitter.setMaxListeners(n)` or defaults to [EventEmitter.defaultMaxListeners](#defaultmaxlisteners).

#### Returns

`number`

#### Since

v1.0.0

#### Inherited from

`EventEmitter.getMaxListeners`

***

### getWebSocket()

> **getWebSocket**(): `null` \| `WebSocket`

Defined in: [packages/codeboltjs/src/core/messageManager.ts:204](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/messageManager.ts#L204)

Get the WebSocket instance

#### Returns

`null` \| `WebSocket`

***

### handleMessage()

> **handleMessage**(`response`): `void`

Defined in: [packages/codeboltjs/src/core/messageManager.ts:96](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/messageManager.ts#L96)

Handle incoming messages and resolve pending requests

#### Parameters

##### response

`any`

#### Returns

`void`

***

### initialize()

> **initialize**(`websocket`): `void`

Defined in: [packages/codeboltjs/src/core/messageManager.ts:72](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/messageManager.ts#L72)

Initialize the message manager with a WebSocket instance

#### Parameters

##### websocket

`WebSocket`

#### Returns

`void`

***

### listenerCount()

> **listenerCount**\<`K`\>(`eventName`, `listener?`): `number`

Defined in: node\_modules/.pnpm/@types+node@20.19.19/node\_modules/@types/node/events.d.ts:914

Returns the number of listeners listening for the event named `eventName`.
If `listener` is provided, it will return how many times the listener is found
in the list of the listeners of the event.

#### Type Parameters

##### K

`K`

#### Parameters

##### eventName

The name of the event being listened for

`string` | `symbol`

##### listener?

`Function`

The event handler function

#### Returns

`number`

#### Since

v3.2.0

#### Inherited from

`EventEmitter.listenerCount`

***

### listeners()

> **listeners**\<`K`\>(`eventName`): `Function`[]

Defined in: node\_modules/.pnpm/@types+node@20.19.19/node\_modules/@types/node/events.d.ts:833

Returns a copy of the array of listeners for the event named `eventName`.

```js
server.on('connection', (stream) => {
  console.log('someone connected!');
});
console.log(util.inspect(server.listeners('connection')));
// Prints: [ [Function] ]
```

#### Type Parameters

##### K

`K`

#### Parameters

##### eventName

`string` | `symbol`

#### Returns

`Function`[]

#### Since

v0.1.26

#### Inherited from

`EventEmitter.listeners`

***

### off()

> **off**\<`K`\>(`eventName`, `listener`): `this`

Defined in: node\_modules/.pnpm/@types+node@20.19.19/node\_modules/@types/node/events.d.ts:793

Alias for `emitter.removeListener()`.

#### Type Parameters

##### K

`K`

#### Parameters

##### eventName

`string` | `symbol`

##### listener

(...`args`) => `void`

#### Returns

`this`

#### Since

v10.0.0

#### Inherited from

`EventEmitter.off`

***

### on()

> **on**\<`K`\>(`eventName`, `listener`): `this`

Defined in: node\_modules/.pnpm/@types+node@20.19.19/node\_modules/@types/node/events.d.ts:675

Adds the `listener` function to the end of the listeners array for the event
named `eventName`. No checks are made to see if the `listener` has already
been added. Multiple calls passing the same combination of `eventName` and
`listener` will result in the `listener` being added, and called, multiple times.

```js
server.on('connection', (stream) => {
  console.log('someone connected!');
});
```

Returns a reference to the `EventEmitter`, so that calls can be chained.

By default, event listeners are invoked in the order they are added. The `emitter.prependListener()` method can be used as an alternative to add the
event listener to the beginning of the listeners array.

```js
import { EventEmitter } from 'node:events';
const myEE = new EventEmitter();
myEE.on('foo', () => console.log('a'));
myEE.prependListener('foo', () => console.log('b'));
myEE.emit('foo');
// Prints:
//   b
//   a
```

#### Type Parameters

##### K

`K`

#### Parameters

##### eventName

The name of the event.

`string` | `symbol`

##### listener

(...`args`) => `void`

The callback function

#### Returns

`this`

#### Since

v0.1.101

#### Inherited from

`EventEmitter.on`

***

### once()

> **once**\<`K`\>(`eventName`, `listener`): `this`

Defined in: node\_modules/.pnpm/@types+node@20.19.19/node\_modules/@types/node/events.d.ts:705

Adds a **one-time** `listener` function for the event named `eventName`. The
next time `eventName` is triggered, this listener is removed and then invoked.

```js
server.once('connection', (stream) => {
  console.log('Ah, we have our first user!');
});
```

Returns a reference to the `EventEmitter`, so that calls can be chained.

By default, event listeners are invoked in the order they are added. The `emitter.prependOnceListener()` method can be used as an alternative to add the
event listener to the beginning of the listeners array.

```js
import { EventEmitter } from 'node:events';
const myEE = new EventEmitter();
myEE.once('foo', () => console.log('a'));
myEE.prependOnceListener('foo', () => console.log('b'));
myEE.emit('foo');
// Prints:
//   b
//   a
```

#### Type Parameters

##### K

`K`

#### Parameters

##### eventName

The name of the event.

`string` | `symbol`

##### listener

(...`args`) => `void`

The callback function

#### Returns

`this`

#### Since

v0.3.0

#### Inherited from

`EventEmitter.once`

***

### prependListener()

> **prependListener**\<`K`\>(`eventName`, `listener`): `this`

Defined in: node\_modules/.pnpm/@types+node@20.19.19/node\_modules/@types/node/events.d.ts:932

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

#### Type Parameters

##### K

`K`

#### Parameters

##### eventName

The name of the event.

`string` | `symbol`

##### listener

(...`args`) => `void`

The callback function

#### Returns

`this`

#### Since

v6.0.0

#### Inherited from

`EventEmitter.prependListener`

***

### prependOnceListener()

> **prependOnceListener**\<`K`\>(`eventName`, `listener`): `this`

Defined in: node\_modules/.pnpm/@types+node@20.19.19/node\_modules/@types/node/events.d.ts:948

Adds a **one-time**`listener` function for the event named `eventName` to the _beginning_ of the listeners array. The next time `eventName` is triggered, this
listener is removed, and then invoked.

```js
server.prependOnceListener('connection', (stream) => {
  console.log('Ah, we have our first user!');
});
```

Returns a reference to the `EventEmitter`, so that calls can be chained.

#### Type Parameters

##### K

`K`

#### Parameters

##### eventName

The name of the event.

`string` | `symbol`

##### listener

(...`args`) => `void`

The callback function

#### Returns

`this`

#### Since

v6.0.0

#### Inherited from

`EventEmitter.prependOnceListener`

***

### rawListeners()

> **rawListeners**\<`K`\>(`eventName`): `Function`[]

Defined in: node\_modules/.pnpm/@types+node@20.19.19/node\_modules/@types/node/events.d.ts:864

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

#### Type Parameters

##### K

`K`

#### Parameters

##### eventName

`string` | `symbol`

#### Returns

`Function`[]

#### Since

v9.4.0

#### Inherited from

`EventEmitter.rawListeners`

***

### registerRoute()

> **registerRoute**(`route`): () => `void`

Defined in: [packages/codeboltjs/src/core/messageManager.ts:61](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/messageManager.ts#L61)

Register a message route handler for specific message types

#### Parameters

##### route

`MessageRoute`

The route configuration with message types and handler

#### Returns

A cleanup function to unregister the route

> (): `void`

##### Returns

`void`

***

### removeAllListeners()

> **removeAllListeners**(`eventName?`): `this`

Defined in: node\_modules/.pnpm/@types+node@20.19.19/node\_modules/@types/node/events.d.ts:804

Removes all listeners, or those of the specified `eventName`.

It is bad practice to remove listeners added elsewhere in the code,
particularly when the `EventEmitter` instance was created by some other
component or module (e.g. sockets or file streams).

Returns a reference to the `EventEmitter`, so that calls can be chained.

#### Parameters

##### eventName?

`string` | `symbol`

#### Returns

`this`

#### Since

v0.1.26

#### Inherited from

`EventEmitter.removeAllListeners`

***

### removeListener()

> **removeListener**\<`K`\>(`eventName`, `listener`): `this`

Defined in: node\_modules/.pnpm/@types+node@20.19.19/node\_modules/@types/node/events.d.ts:788

Removes the specified `listener` from the listener array for the event named `eventName`.

```js
const callback = (stream) => {
  console.log('someone connected!');
};
server.on('connection', callback);
// ...
server.removeListener('connection', callback);
```

`removeListener()` will remove, at most, one instance of a listener from the
listener array. If any single listener has been added multiple times to the
listener array for the specified `eventName`, then `removeListener()` must be
called multiple times to remove each instance.

Once an event is emitted, all listeners attached to it at the
time of emitting are called in order. This implies that any `removeListener()` or `removeAllListeners()` calls _after_ emitting and _before_ the last listener finishes execution
will not remove them from`emit()` in progress. Subsequent events behave as expected.

```js
import { EventEmitter } from 'node:events';
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

const callbackA = () => {
  console.log('A');
  myEmitter.removeListener('event', callbackB);
};

const callbackB = () => {
  console.log('B');
};

myEmitter.on('event', callbackA);

myEmitter.on('event', callbackB);

// callbackA removes listener callbackB but it will still be called.
// Internal listener array at time of emit [callbackA, callbackB]
myEmitter.emit('event');
// Prints:
//   A
//   B

// callbackB is now removed.
// Internal listener array [callbackA]
myEmitter.emit('event');
// Prints:
//   A
```

Because listeners are managed using an internal array, calling this will
change the position indices of any listener registered _after_ the listener
being removed. This will not impact the order in which listeners are called,
but it means that any copies of the listener array as returned by
the `emitter.listeners()` method will need to be recreated.

When a single function has been added as a handler multiple times for a single
event (as in the example below), `removeListener()` will remove the most
recently added instance. In the example the `once('ping')` listener is removed:

```js
import { EventEmitter } from 'node:events';
const ee = new EventEmitter();

function pong() {
  console.log('pong');
}

ee.on('ping', pong);
ee.once('ping', pong);
ee.removeListener('ping', pong);

ee.emit('ping');
ee.emit('ping');
```

Returns a reference to the `EventEmitter`, so that calls can be chained.

#### Type Parameters

##### K

`K`

#### Parameters

##### eventName

`string` | `symbol`

##### listener

(...`args`) => `void`

#### Returns

`this`

#### Since

v0.1.26

#### Inherited from

`EventEmitter.removeListener`

***

### send()

> **send**(`message`): `void`

Defined in: [packages/codeboltjs/src/core/messageManager.ts:192](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/messageManager.ts#L192)

Send a message without waiting for response

#### Parameters

##### message

`any`

#### Returns

`void`

***

### sendAndWaitForResponse()

> **sendAndWaitForResponse**\<`T`\>(`message`, `expectedResponseType`, `timeout`): `Promise`\<`T`\>

Defined in: [packages/codeboltjs/src/core/messageManager.ts:134](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/messageManager.ts#L134)

Send a message and wait for a specific response type

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### message

`any`

The message to send

##### expectedResponseType

`string`

The type of response to wait for

##### timeout

`number` = `0`

Optional timeout in milliseconds. If not provided or set to 0, will wait indefinitely

#### Returns

`Promise`\<`T`\>

***

### setMaxListeners()

> **setMaxListeners**(`n`): `this`

Defined in: node\_modules/.pnpm/@types+node@20.19.19/node\_modules/@types/node/events.d.ts:814

By default `EventEmitter`s will print a warning if more than `10` listeners are
added for a particular event. This is a useful default that helps finding
memory leaks. The `emitter.setMaxListeners()` method allows the limit to be
modified for this specific `EventEmitter` instance. The value can be set to `Infinity` (or `0`) to indicate an unlimited number of listeners.

Returns a reference to the `EventEmitter`, so that calls can be chained.

#### Parameters

##### n

`number`

#### Returns

`this`

#### Since

v0.3.5

#### Inherited from

`EventEmitter.setMaxListeners`

***

### setupMessageListener()

> **setupMessageListener**(): `void`

Defined in: [packages/codeboltjs/src/core/messageManager.ts:80](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/messageManager.ts#L80)

Setup the centralized message listener

#### Returns

`void`

***

### subscribe()

> **subscribe**(`messageType`): `EventEmitter`\<`DefaultEventMap`\> & `object`

Defined in: [packages/codeboltjs/src/core/messageManager.ts:20](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/messageManager.ts#L20)

Subscribe to specific message types and get an EventEmitter that emits messages of those types.

#### Parameters

##### messageType

`string`

The message type to subscribe to

#### Returns

`EventEmitter`\<`DefaultEventMap`\> & `object`

An EventEmitter that emits 'message' events for the specified type, with an unsubscribe method

***

### unsubscribe()

> **unsubscribe**(`messageType`): `void`

Defined in: [packages/codeboltjs/src/core/messageManager.ts:45](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/messageManager.ts#L45)

Unsubscribe from a message type

#### Parameters

##### messageType

`string`

The message type to unsubscribe from

#### Returns

`void`

***

### addAbortListener()

> `static` **addAbortListener**(`signal`, `resource`): `Disposable`

Defined in: node\_modules/.pnpm/@types+node@20.19.19/node\_modules/@types/node/events.d.ts:404

**`Experimental`**

Listens once to the `abort` event on the provided `signal`.

Listening to the `abort` event on abort signals is unsafe and may
lead to resource leaks since another third party with the signal can
call `e.stopImmediatePropagation()`. Unfortunately Node.js cannot change
this since it would violate the web standard. Additionally, the original
API makes it easy to forget to remove listeners.

This API allows safely using `AbortSignal`s in Node.js APIs by solving these
two issues by listening to the event such that `stopImmediatePropagation` does
not prevent the listener from running.

Returns a disposable so that it may be unsubscribed from more easily.

```js
import { addAbortListener } from 'node:events';

function example(signal) {
  let disposable;
  try {
    signal.addEventListener('abort', (e) => e.stopImmediatePropagation());
    disposable = addAbortListener(signal, (e) => {
      // Do something when signal is aborted.
    });
  } finally {
    disposable?.[Symbol.dispose]();
  }
}
```

#### Parameters

##### signal

`AbortSignal`

##### resource

(`event`) => `void`

#### Returns

`Disposable`

Disposable that removes the `abort` listener.

#### Since

v20.5.0

#### Inherited from

`EventEmitter.addAbortListener`

***

### getEventListeners()

> `static` **getEventListeners**(`emitter`, `name`): `Function`[]

Defined in: node\_modules/.pnpm/@types+node@20.19.19/node\_modules/@types/node/events.d.ts:325

Returns a copy of the array of listeners for the event named `eventName`.

For `EventEmitter`s this behaves exactly the same as calling `.listeners` on
the emitter.

For `EventTarget`s this is the only way to get the event listeners for the
event target. This is useful for debugging and diagnostic purposes.

```js
import { getEventListeners, EventEmitter } from 'node:events';

{
  const ee = new EventEmitter();
  const listener = () => console.log('Events are fun');
  ee.on('foo', listener);
  console.log(getEventListeners(ee, 'foo')); // [ [Function: listener] ]
}
{
  const et = new EventTarget();
  const listener = () => console.log('Events are fun');
  et.addEventListener('foo', listener);
  console.log(getEventListeners(et, 'foo')); // [ [Function: listener] ]
}
```

#### Parameters

##### emitter

`EventEmitter`\<`DefaultEventMap`\> | `EventTarget`

##### name

`string` | `symbol`

#### Returns

`Function`[]

#### Since

v15.2.0, v14.17.0

#### Inherited from

`EventEmitter.getEventListeners`

***

### getMaxListeners()

> `static` **getMaxListeners**(`emitter`): `number`

Defined in: node\_modules/.pnpm/@types+node@20.19.19/node\_modules/@types/node/events.d.ts:354

Returns the currently set max amount of listeners.

For `EventEmitter`s this behaves exactly the same as calling `.getMaxListeners` on
the emitter.

For `EventTarget`s this is the only way to get the max event listeners for the
event target. If the number of event handlers on a single EventTarget exceeds
the max set, the EventTarget will print a warning.

```js
import { getMaxListeners, setMaxListeners, EventEmitter } from 'node:events';

{
  const ee = new EventEmitter();
  console.log(getMaxListeners(ee)); // 10
  setMaxListeners(11, ee);
  console.log(getMaxListeners(ee)); // 11
}
{
  const et = new EventTarget();
  console.log(getMaxListeners(et)); // 10
  setMaxListeners(11, et);
  console.log(getMaxListeners(et)); // 11
}
```

#### Parameters

##### emitter

`EventEmitter`\<`DefaultEventMap`\> | `EventTarget`

#### Returns

`number`

#### Since

v19.9.0

#### Inherited from

`EventEmitter.getMaxListeners`

***

### ~~listenerCount()~~

> `static` **listenerCount**(`emitter`, `eventName`): `number`

Defined in: node\_modules/.pnpm/@types+node@20.19.19/node\_modules/@types/node/events.d.ts:297

A class method that returns the number of listeners for the given `eventName` registered on the given `emitter`.

```js
import { EventEmitter, listenerCount } from 'node:events';

const myEmitter = new EventEmitter();
myEmitter.on('event', () => {});
myEmitter.on('event', () => {});
console.log(listenerCount(myEmitter, 'event'));
// Prints: 2
```

#### Parameters

##### emitter

`EventEmitter`

The emitter to query

##### eventName

The event name

`string` | `symbol`

#### Returns

`number`

#### Since

v0.9.12

#### Deprecated

Since v3.2.0 - Use `listenerCount` instead.

#### Inherited from

`EventEmitter.listenerCount`

***

### on()

#### Call Signature

> `static` **on**(`emitter`, `eventName`, `options?`): `AsyncIterator`\<`any`[]\>

Defined in: node\_modules/.pnpm/@types+node@20.19.19/node\_modules/@types/node/events.d.ts:270

```js
import { on, EventEmitter } from 'node:events';
import process from 'node:process';

const ee = new EventEmitter();

// Emit later on
process.nextTick(() => {
  ee.emit('foo', 'bar');
  ee.emit('foo', 42);
});

for await (const event of on(ee, 'foo')) {
  // The execution of this inner block is synchronous and it
  // processes one event at a time (even with await). Do not use
  // if concurrent execution is required.
  console.log(event); // prints ['bar'] [42]
}
// Unreachable here
```

Returns an `AsyncIterator` that iterates `eventName` events. It will throw
if the `EventEmitter` emits `'error'`. It removes all listeners when
exiting the loop. The `value` returned by each iteration is an array
composed of the emitted event arguments.

An `AbortSignal` can be used to cancel waiting on events:

```js
import { on, EventEmitter } from 'node:events';
import process from 'node:process';

const ac = new AbortController();

(async () => {
  const ee = new EventEmitter();

  // Emit later on
  process.nextTick(() => {
    ee.emit('foo', 'bar');
    ee.emit('foo', 42);
  });

  for await (const event of on(ee, 'foo', { signal: ac.signal })) {
    // The execution of this inner block is synchronous and it
    // processes one event at a time (even with await). Do not use
    // if concurrent execution is required.
    console.log(event); // prints ['bar'] [42]
  }
  // Unreachable here
})();

process.nextTick(() => ac.abort());
```

Use the `close` option to specify an array of event names that will end the iteration:

```js
import { on, EventEmitter } from 'node:events';
import process from 'node:process';

const ee = new EventEmitter();

// Emit later on
process.nextTick(() => {
  ee.emit('foo', 'bar');
  ee.emit('foo', 42);
  ee.emit('close');
});

for await (const event of on(ee, 'foo', { close: ['close'] })) {
  console.log(event); // prints ['bar'] [42]
}
// the loop will exit after 'close' is emitted
console.log('done'); // prints 'done'
```

##### Parameters

###### emitter

`EventEmitter`

###### eventName

`string` | `symbol`

###### options?

`StaticEventEmitterIteratorOptions`

##### Returns

`AsyncIterator`\<`any`[]\>

An `AsyncIterator` that iterates `eventName` events emitted by the `emitter`

##### Since

v13.6.0, v12.16.0

##### Inherited from

`EventEmitter.on`

#### Call Signature

> `static` **on**(`emitter`, `eventName`, `options?`): `AsyncIterator`\<`any`[]\>

Defined in: node\_modules/.pnpm/@types+node@20.19.19/node\_modules/@types/node/events.d.ts:275

```js
import { on, EventEmitter } from 'node:events';
import process from 'node:process';

const ee = new EventEmitter();

// Emit later on
process.nextTick(() => {
  ee.emit('foo', 'bar');
  ee.emit('foo', 42);
});

for await (const event of on(ee, 'foo')) {
  // The execution of this inner block is synchronous and it
  // processes one event at a time (even with await). Do not use
  // if concurrent execution is required.
  console.log(event); // prints ['bar'] [42]
}
// Unreachable here
```

Returns an `AsyncIterator` that iterates `eventName` events. It will throw
if the `EventEmitter` emits `'error'`. It removes all listeners when
exiting the loop. The `value` returned by each iteration is an array
composed of the emitted event arguments.

An `AbortSignal` can be used to cancel waiting on events:

```js
import { on, EventEmitter } from 'node:events';
import process from 'node:process';

const ac = new AbortController();

(async () => {
  const ee = new EventEmitter();

  // Emit later on
  process.nextTick(() => {
    ee.emit('foo', 'bar');
    ee.emit('foo', 42);
  });

  for await (const event of on(ee, 'foo', { signal: ac.signal })) {
    // The execution of this inner block is synchronous and it
    // processes one event at a time (even with await). Do not use
    // if concurrent execution is required.
    console.log(event); // prints ['bar'] [42]
  }
  // Unreachable here
})();

process.nextTick(() => ac.abort());
```

Use the `close` option to specify an array of event names that will end the iteration:

```js
import { on, EventEmitter } from 'node:events';
import process from 'node:process';

const ee = new EventEmitter();

// Emit later on
process.nextTick(() => {
  ee.emit('foo', 'bar');
  ee.emit('foo', 42);
  ee.emit('close');
});

for await (const event of on(ee, 'foo', { close: ['close'] })) {
  console.log(event); // prints ['bar'] [42]
}
// the loop will exit after 'close' is emitted
console.log('done'); // prints 'done'
```

##### Parameters

###### emitter

`EventTarget`

###### eventName

`string`

###### options?

`StaticEventEmitterIteratorOptions`

##### Returns

`AsyncIterator`\<`any`[]\>

An `AsyncIterator` that iterates `eventName` events emitted by the `emitter`

##### Since

v13.6.0, v12.16.0

##### Inherited from

`EventEmitter.on`

***

### once()

#### Call Signature

> `static` **once**(`emitter`, `eventName`, `options?`): `Promise`\<`any`[]\>

Defined in: node\_modules/.pnpm/@types+node@20.19.19/node\_modules/@types/node/events.d.ts:184

Creates a `Promise` that is fulfilled when the `EventEmitter` emits the given
event or that is rejected if the `EventEmitter` emits `'error'` while waiting.
The `Promise` will resolve with an array of all the arguments emitted to the
given event.

This method is intentionally generic and works with the web platform [EventTarget](https://dom.spec.whatwg.org/#interface-eventtarget) interface, which has no special`'error'` event
semantics and does not listen to the `'error'` event.

```js
import { once, EventEmitter } from 'node:events';
import process from 'node:process';

const ee = new EventEmitter();

process.nextTick(() => {
  ee.emit('myevent', 42);
});

const [value] = await once(ee, 'myevent');
console.log(value);

const err = new Error('kaboom');
process.nextTick(() => {
  ee.emit('error', err);
});

try {
  await once(ee, 'myevent');
} catch (err) {
  console.error('error happened', err);
}
```

The special handling of the `'error'` event is only used when `events.once()` is used to wait for another event. If `events.once()` is used to wait for the
'`error'` event itself, then it is treated as any other kind of event without
special handling:

```js
import { EventEmitter, once } from 'node:events';

const ee = new EventEmitter();

once(ee, 'error')
  .then(([err]) => console.log('ok', err.message))
  .catch((err) => console.error('error', err.message));

ee.emit('error', new Error('boom'));

// Prints: ok boom
```

An `AbortSignal` can be used to cancel waiting for the event:

```js
import { EventEmitter, once } from 'node:events';

const ee = new EventEmitter();
const ac = new AbortController();

async function foo(emitter, event, signal) {
  try {
    await once(emitter, event, { signal });
    console.log('event emitted!');
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Waiting for the event was canceled!');
    } else {
      console.error('There was an error', error.message);
    }
  }
}

foo(ee, 'foo', ac.signal);
ac.abort(); // Abort waiting for the event
ee.emit('foo'); // Prints: Waiting for the event was canceled!
```

##### Parameters

###### emitter

`EventEmitter`

###### eventName

`string` | `symbol`

###### options?

`StaticEventEmitterOptions`

##### Returns

`Promise`\<`any`[]\>

##### Since

v11.13.0, v10.16.0

##### Inherited from

`EventEmitter.once`

#### Call Signature

> `static` **once**(`emitter`, `eventName`, `options?`): `Promise`\<`any`[]\>

Defined in: node\_modules/.pnpm/@types+node@20.19.19/node\_modules/@types/node/events.d.ts:189

Creates a `Promise` that is fulfilled when the `EventEmitter` emits the given
event or that is rejected if the `EventEmitter` emits `'error'` while waiting.
The `Promise` will resolve with an array of all the arguments emitted to the
given event.

This method is intentionally generic and works with the web platform [EventTarget](https://dom.spec.whatwg.org/#interface-eventtarget) interface, which has no special`'error'` event
semantics and does not listen to the `'error'` event.

```js
import { once, EventEmitter } from 'node:events';
import process from 'node:process';

const ee = new EventEmitter();

process.nextTick(() => {
  ee.emit('myevent', 42);
});

const [value] = await once(ee, 'myevent');
console.log(value);

const err = new Error('kaboom');
process.nextTick(() => {
  ee.emit('error', err);
});

try {
  await once(ee, 'myevent');
} catch (err) {
  console.error('error happened', err);
}
```

The special handling of the `'error'` event is only used when `events.once()` is used to wait for another event. If `events.once()` is used to wait for the
'`error'` event itself, then it is treated as any other kind of event without
special handling:

```js
import { EventEmitter, once } from 'node:events';

const ee = new EventEmitter();

once(ee, 'error')
  .then(([err]) => console.log('ok', err.message))
  .catch((err) => console.error('error', err.message));

ee.emit('error', new Error('boom'));

// Prints: ok boom
```

An `AbortSignal` can be used to cancel waiting for the event:

```js
import { EventEmitter, once } from 'node:events';

const ee = new EventEmitter();
const ac = new AbortController();

async function foo(emitter, event, signal) {
  try {
    await once(emitter, event, { signal });
    console.log('event emitted!');
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Waiting for the event was canceled!');
    } else {
      console.error('There was an error', error.message);
    }
  }
}

foo(ee, 'foo', ac.signal);
ac.abort(); // Abort waiting for the event
ee.emit('foo'); // Prints: Waiting for the event was canceled!
```

##### Parameters

###### emitter

`EventTarget`

###### eventName

`string`

###### options?

`StaticEventEmitterOptions`

##### Returns

`Promise`\<`any`[]\>

##### Since

v11.13.0, v10.16.0

##### Inherited from

`EventEmitter.once`

***

### setMaxListeners()

> `static` **setMaxListeners**(`n?`, ...`eventTargets?`): `void`

Defined in: node\_modules/.pnpm/@types+node@20.19.19/node\_modules/@types/node/events.d.ts:369

```js
import { setMaxListeners, EventEmitter } from 'node:events';

const target = new EventTarget();
const emitter = new EventEmitter();

setMaxListeners(5, target, emitter);
```

#### Parameters

##### n?

`number`

A non-negative number. The maximum number of listeners per `EventTarget` event.

##### eventTargets?

...(`EventEmitter`\<`DefaultEventMap`\> \| `EventTarget`)[]

Zero or more {EventTarget} or {EventEmitter} instances. If none are specified, `n` is set as the default max for all newly created {EventTarget} and {EventEmitter}
objects.

#### Returns

`void`

#### Since

v15.4.0

#### Inherited from

`EventEmitter.setMaxListeners`
