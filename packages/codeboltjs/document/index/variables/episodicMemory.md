[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / episodicMemory

# Variable: episodicMemory

> `const` **episodicMemory**: `object`

Defined in: [packages/codeboltjs/src/modules/episodicMemory.ts:184](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/episodicMemory.ts#L184)

## Type Declaration

### appendEvent()

> **appendEvent**: (`params`) => `Promise`\<[`IAppendEventResponse`](../interfaces/IAppendEventResponse.md)\>

Append an event to an episodic memory

#### Parameters

##### params

[`IAppendEventParams`](../interfaces/IAppendEventParams.md)

Event parameters including memoryId, event_type, emitting_agent_id, and payload

#### Returns

`Promise`\<[`IAppendEventResponse`](../interfaces/IAppendEventResponse.md)\>

Promise resolving to the created event

### archiveMemory()

> **archiveMemory**: (`params`) => `Promise`\<[`IArchiveMemoryResponse`](../interfaces/IArchiveMemoryResponse.md)\>

Archive an episodic memory

#### Parameters

##### params

[`IArchiveMemoryParams`](../interfaces/IArchiveMemoryParams.md)

Parameters including memoryId

#### Returns

`Promise`\<[`IArchiveMemoryResponse`](../interfaces/IArchiveMemoryResponse.md)\>

Promise resolving to archive confirmation

### createMemory()

> **createMemory**: (`params`) => `Promise`\<[`ICreateMemoryResponse`](../interfaces/ICreateMemoryResponse.md)\>

Create a new episodic memory

#### Parameters

##### params

[`ICreateMemoryParams`](../interfaces/ICreateMemoryParams.md)

Memory creation parameters (title)

#### Returns

`Promise`\<[`ICreateMemoryResponse`](../interfaces/ICreateMemoryResponse.md)\>

Promise resolving to the created memory

### getAgents()

> **getAgents**: (`params`) => `Promise`\<[`IGetAgentsResponse`](../interfaces/IGetAgentsResponse.md)\>

Get unique agent IDs from an episodic memory

#### Parameters

##### params

[`IGetAgentsParams`](../interfaces/IGetAgentsParams.md)

Parameters including memoryId

#### Returns

`Promise`\<[`IGetAgentsResponse`](../interfaces/IGetAgentsResponse.md)\>

Promise resolving to list of unique agent IDs

### getEventTypes()

> **getEventTypes**: (`params`) => `Promise`\<[`IGetEventTypesResponse`](../interfaces/IGetEventTypesResponse.md)\>

Get unique event types from an episodic memory

#### Parameters

##### params

[`IGetEventTypesParams`](../interfaces/IGetEventTypesParams.md)

Parameters including memoryId

#### Returns

`Promise`\<[`IGetEventTypesResponse`](../interfaces/IGetEventTypesResponse.md)\>

Promise resolving to list of unique event types

### getMemory()

> **getMemory**: (`params`) => `Promise`\<[`IGetMemoryResponse`](../interfaces/IGetMemoryResponse.md)\>

Get a specific episodic memory by ID

#### Parameters

##### params

[`IGetMemoryParams`](../interfaces/IGetMemoryParams.md)

Parameters including memoryId

#### Returns

`Promise`\<[`IGetMemoryResponse`](../interfaces/IGetMemoryResponse.md)\>

Promise resolving to the memory

### getTags()

> **getTags**: (`params`) => `Promise`\<[`IGetTagsResponse`](../interfaces/IGetTagsResponse.md)\>

Get unique tags from an episodic memory

#### Parameters

##### params

[`IGetTagsParams`](../interfaces/IGetTagsParams.md)

Parameters including memoryId

#### Returns

`Promise`\<[`IGetTagsResponse`](../interfaces/IGetTagsResponse.md)\>

Promise resolving to list of unique tags

### listMemories()

> **listMemories**: () => `Promise`\<[`IListMemoriesResponse`](../interfaces/IListMemoriesResponse.md)\>

List all episodic memories

#### Returns

`Promise`\<[`IListMemoriesResponse`](../interfaces/IListMemoriesResponse.md)\>

Promise resolving to list of memories

### queryEvents()

> **queryEvents**: (`params`) => `Promise`\<[`IQueryEventsResponse`](../interfaces/IQueryEventsResponse.md)\>

Query events from an episodic memory with optional filters

#### Parameters

##### params

[`IQueryEventsParams`](../interfaces/IQueryEventsParams.md)

Query parameters including memoryId and optional filters

#### Returns

`Promise`\<[`IQueryEventsResponse`](../interfaces/IQueryEventsResponse.md)\>

Promise resolving to filtered events

### unarchiveMemory()

> **unarchiveMemory**: (`params`) => `Promise`\<[`IUnarchiveMemoryResponse`](../interfaces/IUnarchiveMemoryResponse.md)\>

Unarchive an episodic memory

#### Parameters

##### params

[`IUnarchiveMemoryParams`](../interfaces/IUnarchiveMemoryParams.md)

Parameters including memoryId

#### Returns

`Promise`\<[`IUnarchiveMemoryResponse`](../interfaces/IUnarchiveMemoryResponse.md)\>

Promise resolving to unarchive confirmation

### updateTitle()

> **updateTitle**: (`params`) => `Promise`\<[`IUpdateTitleResponse`](../interfaces/IUpdateTitleResponse.md)\>

Update the title of an episodic memory

#### Parameters

##### params

[`IUpdateTitleParams`](../interfaces/IUpdateTitleParams.md)

Parameters including memoryId and new title

#### Returns

`Promise`\<[`IUpdateTitleResponse`](../interfaces/IUpdateTitleResponse.md)\>

Promise resolving to update confirmation
