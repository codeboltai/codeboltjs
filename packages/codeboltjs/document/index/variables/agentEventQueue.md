[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / agentEventQueue

# Variable: agentEventQueue

> `const` **agentEventQueue**: `object`

Defined in: [packages/codeboltjs/src/modules/agentEventQueue.ts:143](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/agentEventQueue.ts#L143)

## Type Declaration

### \_acknowledgeEvent()

> **\_acknowledgeEvent**: (`eventId`, `success`, `errorMessage?`) => `Promise`\<[`AgentEventQueueResponse`](../interfaces/AgentEventQueueResponse.md)\<`any`\>\>

Acknowledge an event at the backend

#### Parameters

##### eventId

`string`

ID of the event to acknowledge

##### success

`boolean` = `true`

Whether processing was successful

##### errorMessage?

`string`

Optional error message

#### Returns

`Promise`\<[`AgentEventQueueResponse`](../interfaces/AgentEventQueueResponse.md)\<`any`\>\>

### \_fetchPendingFromBackend()

> **\_fetchPendingFromBackend**: (`params`) => `Promise`\<[`AgentEventMessage`](../interfaces/AgentEventMessage.md)[]\>

Fetch pending events from backend

#### Parameters

##### params

[`GetPendingEventsInput`](../interfaces/GetPendingEventsInput.md) = `{}`

Query parameters

#### Returns

`Promise`\<[`AgentEventMessage`](../interfaces/AgentEventMessage.md)[]\>

### acknowledgeEvent()

> **acknowledgeEvent**: (`eventId`, `success`, `errorMessage?`) => `Promise`\<[`AgentEventQueueResponse`](../interfaces/AgentEventQueueResponse.md)\<`any`\>\>

Manually acknowledge an event.
Use this when handling events via onQueueEvent.

#### Parameters

##### eventId

`string`

ID of the event to acknowledge

##### success

`boolean` = `true`

Whether processing was successful

##### errorMessage?

`string`

Optional error message if failed

#### Returns

`Promise`\<[`AgentEventQueueResponse`](../interfaces/AgentEventQueueResponse.md)\<`any`\>\>

### addEvent()

> **addEvent**: (`params`) => `Promise`\<[`AgentEventQueueResponse`](../interfaces/AgentEventQueueResponse.md)\<[`AddEventResponseData`](../interfaces/AddEventResponseData.md)\>\>

Add an event to a target agent's queue

#### Parameters

##### params

[`AddEventInput`](../interfaces/AddEventInput.md)

Event creation parameters

#### Returns

`Promise`\<[`AgentEventQueueResponse`](../interfaces/AgentEventQueueResponse.md)\<[`AddEventResponseData`](../interfaces/AddEventResponseData.md)\>\>

Promise resolving to the created event

### checkForPendingExternalEvent()

> **checkForPendingExternalEvent**: () => `null` \| `UnifiedExternalEvent`

Check for any pending external events without waiting.
Returns the first pending event or null if none available.

#### Returns

`null` \| `UnifiedExternalEvent`

The first pending event or null

### clearLocalCache()

> **clearLocalCache**: () => `void`

Clear the local event cache (does not affect backend)

#### Returns

`void`

### clearQueue()

> **clearQueue**: (`agentId?`) => `Promise`\<[`AgentEventQueueResponse`](../interfaces/AgentEventQueueResponse.md)\<`any`\>\>

Clear the queue for an agent

#### Parameters

##### agentId?

`string`

Optional agent ID (defaults to current agent)

#### Returns

`Promise`\<[`AgentEventQueueResponse`](../interfaces/AgentEventQueueResponse.md)\<`any`\>\>

Promise resolving to success confirmation

### getLocalCacheSize()

> **getLocalCacheSize**: () => `number`

Get the number of events in the local cache

#### Returns

`number`

Number of cached events

### getPendingExternalEventCount()

> **getPendingExternalEventCount**: () => `number`

Get the count of pending external events.

#### Returns

`number`

Number of pending events

### getPendingExternalEvents()

> **getPendingExternalEvents**: () => `UnifiedExternalEvent`[]

Get all pending external events.
Returns all pending events and clears the cache.

#### Returns

`UnifiedExternalEvent`[]

Array of pending events

### getPendingQueueEvents()

> **getPendingQueueEvents**: (`maxDepth?`) => `Promise`\<[`AgentEventMessage`](../interfaces/AgentEventMessage.md)[]\>

Get pending events from local cache.
Sends acknowledgement for each event and removes from local cache.
If no local events, fetches from backend.

#### Parameters

##### maxDepth?

`number`

Maximum number of events to return (default: all)

#### Returns

`Promise`\<[`AgentEventMessage`](../interfaces/AgentEventMessage.md)[]\>

Promise resolving to array of events

### getQueueStats()

> **getQueueStats**: () => `Promise`\<[`AgentEventQueueResponse`](../interfaces/AgentEventQueueResponse.md)\<[`QueueStatsResponseData`](../interfaces/QueueStatsResponseData.md)\>\>

Get queue statistics

#### Returns

`Promise`\<[`AgentEventQueueResponse`](../interfaces/AgentEventQueueResponse.md)\<[`QueueStatsResponseData`](../interfaces/QueueStatsResponseData.md)\>\>

Promise resolving to queue statistics

### onQueueEvent()

> **onQueueEvent**: (`handler`) => () => `void`

Register an event handler that will be called when events are received.
The handler receives events as they arrive via WebSocket.
Note: This does NOT automatically acknowledge events.

#### Parameters

##### handler

[`QueueEventHandler`](../type-aliases/QueueEventHandler.md)

Function to call when an event is received

#### Returns

Unsubscribe function

> (): `void`

##### Returns

`void`

### peekLocalCache()

> **peekLocalCache**: () => [`AgentEventMessage`](../interfaces/AgentEventMessage.md)[]

Get all events currently in the local cache without removing them

#### Returns

[`AgentEventMessage`](../interfaces/AgentEventMessage.md)[]

Array of cached events

### sendAgentMessage()

> **sendAgentMessage**: (`params`) => `Promise`\<[`AgentEventQueueResponse`](../interfaces/AgentEventQueueResponse.md)\<[`AddEventResponseData`](../interfaces/AddEventResponseData.md)\>\>

Send an inter-agent message (convenience wrapper)

#### Parameters

##### params

[`SendAgentMessageInput`](../interfaces/SendAgentMessageInput.md)

Message parameters

#### Returns

`Promise`\<[`AgentEventQueueResponse`](../interfaces/AgentEventQueueResponse.md)\<[`AddEventResponseData`](../interfaces/AddEventResponseData.md)\>\>

Promise resolving to the created event

### waitForAnyExternalEvent()

> **waitForAnyExternalEvent**: () => `Promise`\<`UnifiedExternalEvent`\>

Waits for any external event from multiple sources:
- Agent queue events (from local cache or WebSocket)
- Background agent completions
- Grouped agent completions

Returns the first event that occurs from any source.

#### Returns

`Promise`\<`UnifiedExternalEvent`\>

A promise that resolves with the event type and data

### waitForNextQueueEvent()

> **waitForNextQueueEvent**: (`maxDepth`) => `Promise`\<[`AgentEventMessage`](../interfaces/AgentEventMessage.md) \| [`AgentEventMessage`](../interfaces/AgentEventMessage.md)[]\>

Wait for the next event(s) from the queue.
First checks local cache, then waits for WebSocket events.
Sends acknowledgement and removes from cache before resolving.

#### Parameters

##### maxDepth

`number` = `1`

Maximum number of events to return (default: 1)

#### Returns

`Promise`\<[`AgentEventMessage`](../interfaces/AgentEventMessage.md) \| [`AgentEventMessage`](../interfaces/AgentEventMessage.md)[]\>

Promise resolving to event(s)
