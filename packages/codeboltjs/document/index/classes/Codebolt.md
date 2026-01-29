[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / Codebolt

# Class: Codebolt

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:71](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L71)

Codebolt

## Description

This class provides a unified interface to interact with various modules.

## Constructors

### Constructor

> **new Codebolt**(): `Codebolt`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:84](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L84)

#### Returns

`Codebolt`

#### Description

Initializes the websocket connection.

## Properties

### actionBlock

> **actionBlock**: `object` = `cbactionBlock`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:170](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L170)

#### getDetail()

> **getDetail**: (`actionBlockName`) => `Promise`\<[`GetActionBlockDetailResponse`](../interfaces/GetActionBlockDetailResponse.md)\>

Get detailed information about a specific ActionBlock

##### Parameters

###### actionBlockName

`string`

Name of the ActionBlock to retrieve

##### Returns

`Promise`\<[`GetActionBlockDetailResponse`](../interfaces/GetActionBlockDetailResponse.md)\>

Promise resolving to ActionBlock details

#### list()

> **list**: (`filter?`) => `Promise`\<[`ActionBlockListResponse`](../interfaces/ActionBlockListResponse.md)\>

List all available ActionBlocks

##### Parameters

###### filter?

[`ActionBlockFilter`](../interfaces/ActionBlockFilter.md)

Optional filter to narrow results by type

##### Returns

`Promise`\<[`ActionBlockListResponse`](../interfaces/ActionBlockListResponse.md)\>

Promise resolving to list of ActionBlocks

#### start()

> **start**: (`actionBlockName`, `params?`) => `Promise`\<[`StartActionBlockResponse`](../interfaces/StartActionBlockResponse.md)\>

Start an ActionBlock by name

##### Parameters

###### actionBlockName

`string`

Name of the ActionBlock to start

###### params?

`Record`\<`string`, `any`\>

Optional parameters to pass to the ActionBlock

##### Returns

`Promise`\<[`StartActionBlockResponse`](../interfaces/StartActionBlockResponse.md)\>

Promise resolving to execution result

***

### actionPlan

> **actionPlan**: `object` = `codeboltActionPlans`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:164](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L164)

#### addGroupToActionPlan()

> **addGroupToActionPlan**: (`planId`, `group`) => `Promise`\<`any`\>

Add a group to an action plan

##### Parameters

###### planId

`string`

The ID of the action plan

###### group

`ActionPlanGroup`

Group data to add (type, name, groupItems/loopTasks/ifTasks/waitTasks, etc.)

##### Returns

`Promise`\<`any`\>

Promise with added group and updated action plan

#### addTaskToActionPlan()

> **addTaskToActionPlan**: (`planId`, `task`) => `Promise`\<`any`\>

Add a task to an action plan

##### Parameters

###### planId

`string`

The ID of the action plan

###### task

`ActionPlanTask`

Task data to add (name, description, priority, taskType, etc.)

##### Returns

`Promise`\<`any`\>

Promise with added task and updated action plan

#### createActionPlan()

> **createActionPlan**: (`payload`) => `Promise`\<`any`\>

Create a new action plan

##### Parameters

###### payload

Action plan creation data (name, description, agentId, agentName, status, planId)

###### agentId?

`string`

###### agentName?

`string`

###### description?

`string`

###### name

`string`

###### planId?

`string`

###### status?

`string`

##### Returns

`Promise`\<`any`\>

Promise with created action plan

#### getActionPlanDetail()

> **getActionPlanDetail**: (`planId`) => `Promise`\<`any`\>

Get action plan detail by ID (alternative method)

##### Parameters

###### planId

`string`

The ID of the action plan

##### Returns

`Promise`\<`any`\>

Promise with action plan details

#### getAllPlans()

> **getAllPlans**: () => `Promise`\<`any`\>

Get all action plans

##### Returns

`Promise`\<`any`\>

Promise with all action plans

#### getPlanDetail()

> **getPlanDetail**: (`planId`) => `Promise`\<`any`\>

Get action plan detail by ID

##### Parameters

###### planId

`string`

The ID of the action plan

##### Returns

`Promise`\<`any`\>

Promise with action plan details

#### startTaskStep()

> **startTaskStep**: (`planId`, `taskId`) => `Promise`\<`any`\>

Start/execute a task step in an action plan

##### Parameters

###### planId

`string`

The ID of the action plan

###### taskId

`string`

The ID of the task to start

##### Returns

`Promise`\<`any`\>

Promise with task execution status

#### startTaskStepWithListener()

> **startTaskStepWithListener**: (`planId`, `taskId`, `onResponse`) => () => `void`

Start/execute a task step in an action plan with event listener

##### Parameters

###### planId

`string`

The ID of the action plan

###### taskId

`string`

The ID of the task to start

###### onResponse

(`response`) => `void`

Callback function that will be called when receiving responses for this task

##### Returns

Cleanup function to remove the event listener

> (): `void`

###### Returns

`void`

#### updateActionPlan()

> **updateActionPlan**: (`planId`, `updateData`) => `Promise`\<`any`\>

Update an existing action plan

##### Parameters

###### planId

`string`

The ID of the action plan to update

###### updateData

`ActionPlanUpdateData`

Data to update in the action plan

##### Returns

`Promise`\<`any`\>

Promise with updated action plan

***

### agent

> **agent**: `object` = `cbagent`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:160](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L160)

#### findAgent()

> **findAgent**: (`task`, `maxResult`, `agents`, `agentLocaltion`, `getFrom`) => `Promise`\<`FindAgentByTaskResponse`\>

Retrieves an agent based on the specified task.

##### Parameters

###### task

`string`

The task for which an agent is needed.

###### maxResult

`number` = `1`

###### agents

`never`[] = `[]`

###### agentLocaltion

`AgentLocation` = `AgentLocation.ALL`

###### getFrom

`USE_VECTOR_DB`

##### Returns

`Promise`\<`FindAgentByTaskResponse`\>

A promise that resolves with the agent details.

#### getAgentsDetail()

> **getAgentsDetail**: (`agentList?`) => `Promise`\<`AgentsDetailResponse`\>

Lists all available agents.

##### Parameters

###### agentList?

`string`[]

##### Returns

`Promise`\<`AgentsDetailResponse`\>

A promise that resolves with the list of agents.

#### getAgentsList()

> **getAgentsList**: (`type`) => `Promise`\<`ListAgentsResponse`\>

Lists all available agents.

##### Parameters

###### type

`Agents` = `Agents.DOWNLOADED`

##### Returns

`Promise`\<`ListAgentsResponse`\>

A promise that resolves with the list of agents.

#### startAgent()

> **startAgent**: (`agentId`, `task`) => `Promise`\<`TaskCompletionResponse`\>

Starts an agent for the specified task.

##### Parameters

###### agentId

`string`

###### task

`string`

The task for which the agent should be started.

##### Returns

`Promise`\<`TaskCompletionResponse`\>

A promise that resolves when the agent has been successfully started.

***

### agentDeliberation

> **agentDeliberation**: `object` = `cbagentDeliberation`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:140](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L140)

#### create()

> **create**: (`params`) => `Promise`\<[`ICreateDeliberationResponse`](../interfaces/ICreateDeliberationResponse.md)\>

##### Parameters

###### params

[`ICreateDeliberationParams`](../interfaces/ICreateDeliberationParams.md)

##### Returns

`Promise`\<[`ICreateDeliberationResponse`](../interfaces/ICreateDeliberationResponse.md)\>

#### get()

> **get**: (`params`) => `Promise`\<[`IGetDeliberationResponse`](../interfaces/IGetDeliberationResponse.md)\>

##### Parameters

###### params

[`IGetDeliberationParams`](../interfaces/IGetDeliberationParams.md)

##### Returns

`Promise`\<[`IGetDeliberationResponse`](../interfaces/IGetDeliberationResponse.md)\>

#### getWinner()

> **getWinner**: (`params`) => `Promise`\<[`IGetWinnerResponse`](../interfaces/IGetWinnerResponse.md)\>

##### Parameters

###### params

[`IGetWinnerParams`](../interfaces/IGetWinnerParams.md)

##### Returns

`Promise`\<[`IGetWinnerResponse`](../interfaces/IGetWinnerResponse.md)\>

#### list()

> **list**: (`params?`) => `Promise`\<[`IListDeliberationsResponse`](../interfaces/IListDeliberationsResponse.md)\>

##### Parameters

###### params?

[`IListDeliberationsParams`](../interfaces/IListDeliberationsParams.md)

##### Returns

`Promise`\<[`IListDeliberationsResponse`](../interfaces/IListDeliberationsResponse.md)\>

#### respond()

> **respond**: (`params`) => `Promise`\<[`IDeliberationRespondResponse`](../interfaces/IDeliberationRespondResponse.md)\>

##### Parameters

###### params

[`IDeliberationRespondParams`](../interfaces/IDeliberationRespondParams.md)

##### Returns

`Promise`\<[`IDeliberationRespondResponse`](../interfaces/IDeliberationRespondResponse.md)\>

#### summary()

> **summary**: (`params`) => `Promise`\<`ISummaryResponse`\>

##### Parameters

###### params

`ISummaryParams`

##### Returns

`Promise`\<`ISummaryResponse`\>

#### update()

> **update**: (`params`) => `Promise`\<[`IUpdateDeliberationResponse`](../interfaces/IUpdateDeliberationResponse.md)\>

##### Parameters

###### params

[`IUpdateDeliberationParams`](../interfaces/IUpdateDeliberationParams.md)

##### Returns

`Promise`\<[`IUpdateDeliberationResponse`](../interfaces/IUpdateDeliberationResponse.md)\>

#### vote()

> **vote**: (`params`) => `Promise`\<[`IVoteResponse`](../interfaces/IVoteResponse.md)\>

##### Parameters

###### params

[`IVoteParams`](../interfaces/IVoteParams.md)

##### Returns

`Promise`\<[`IVoteResponse`](../interfaces/IVoteResponse.md)\>

***

### agentEventQueue

> **agentEventQueue**: `object` = `cbagentEventQueue`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:193](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L193)

#### \_acknowledgeEvent()

> **\_acknowledgeEvent**: (`eventId`, `success`, `errorMessage?`) => `Promise`\<[`AgentEventQueueResponse`](../interfaces/AgentEventQueueResponse.md)\<`any`\>\>

Acknowledge an event at the backend

##### Parameters

###### eventId

`string`

ID of the event to acknowledge

###### success

`boolean` = `true`

Whether processing was successful

###### errorMessage?

`string`

Optional error message

##### Returns

`Promise`\<[`AgentEventQueueResponse`](../interfaces/AgentEventQueueResponse.md)\<`any`\>\>

#### \_fetchPendingFromBackend()

> **\_fetchPendingFromBackend**: (`params`) => `Promise`\<[`AgentEventMessage`](../interfaces/AgentEventMessage.md)[]\>

Fetch pending events from backend

##### Parameters

###### params

[`GetPendingEventsInput`](../interfaces/GetPendingEventsInput.md) = `{}`

Query parameters

##### Returns

`Promise`\<[`AgentEventMessage`](../interfaces/AgentEventMessage.md)[]\>

#### acknowledgeEvent()

> **acknowledgeEvent**: (`eventId`, `success`, `errorMessage?`) => `Promise`\<[`AgentEventQueueResponse`](../interfaces/AgentEventQueueResponse.md)\<`any`\>\>

Manually acknowledge an event.
Use this when handling events via onQueueEvent.

##### Parameters

###### eventId

`string`

ID of the event to acknowledge

###### success

`boolean` = `true`

Whether processing was successful

###### errorMessage?

`string`

Optional error message if failed

##### Returns

`Promise`\<[`AgentEventQueueResponse`](../interfaces/AgentEventQueueResponse.md)\<`any`\>\>

#### addEvent()

> **addEvent**: (`params`) => `Promise`\<[`AgentEventQueueResponse`](../interfaces/AgentEventQueueResponse.md)\<[`AddEventResponseData`](../interfaces/AddEventResponseData.md)\>\>

Add an event to a target agent's queue

##### Parameters

###### params

[`AddEventInput`](../interfaces/AddEventInput.md)

Event creation parameters

##### Returns

`Promise`\<[`AgentEventQueueResponse`](../interfaces/AgentEventQueueResponse.md)\<[`AddEventResponseData`](../interfaces/AddEventResponseData.md)\>\>

Promise resolving to the created event

#### checkForPendingExternalEvent()

> **checkForPendingExternalEvent**: () => `null` \| `UnifiedExternalEvent`

Check for any pending external events without waiting.
Returns the first pending event or null if none available.

##### Returns

`null` \| `UnifiedExternalEvent`

The first pending event or null

#### clearLocalCache()

> **clearLocalCache**: () => `void`

Clear the local event cache (does not affect backend)

##### Returns

`void`

#### clearQueue()

> **clearQueue**: (`agentId?`) => `Promise`\<[`AgentEventQueueResponse`](../interfaces/AgentEventQueueResponse.md)\<`any`\>\>

Clear the queue for an agent

##### Parameters

###### agentId?

`string`

Optional agent ID (defaults to current agent)

##### Returns

`Promise`\<[`AgentEventQueueResponse`](../interfaces/AgentEventQueueResponse.md)\<`any`\>\>

Promise resolving to success confirmation

#### getLocalCacheSize()

> **getLocalCacheSize**: () => `number`

Get the number of events in the local cache

##### Returns

`number`

Number of cached events

#### getPendingExternalEventCount()

> **getPendingExternalEventCount**: () => `number`

Get the count of pending external events.

##### Returns

`number`

Number of pending events

#### getPendingExternalEvents()

> **getPendingExternalEvents**: () => `UnifiedExternalEvent`[]

Get all pending external events.
Returns all pending events and clears the cache.

##### Returns

`UnifiedExternalEvent`[]

Array of pending events

#### getPendingQueueEvents()

> **getPendingQueueEvents**: (`maxDepth?`) => `Promise`\<[`AgentEventMessage`](../interfaces/AgentEventMessage.md)[]\>

Get pending events from local cache.
Sends acknowledgement for each event and removes from local cache.
If no local events, fetches from backend.

##### Parameters

###### maxDepth?

`number`

Maximum number of events to return (default: all)

##### Returns

`Promise`\<[`AgentEventMessage`](../interfaces/AgentEventMessage.md)[]\>

Promise resolving to array of events

#### getQueueStats()

> **getQueueStats**: () => `Promise`\<[`AgentEventQueueResponse`](../interfaces/AgentEventQueueResponse.md)\<[`QueueStatsResponseData`](../interfaces/QueueStatsResponseData.md)\>\>

Get queue statistics

##### Returns

`Promise`\<[`AgentEventQueueResponse`](../interfaces/AgentEventQueueResponse.md)\<[`QueueStatsResponseData`](../interfaces/QueueStatsResponseData.md)\>\>

Promise resolving to queue statistics

#### onQueueEvent()

> **onQueueEvent**: (`handler`) => () => `void`

Register an event handler that will be called when events are received.
The handler receives events as they arrive via WebSocket.
Note: This does NOT automatically acknowledge events.

##### Parameters

###### handler

[`QueueEventHandler`](../type-aliases/QueueEventHandler.md)

Function to call when an event is received

##### Returns

Unsubscribe function

> (): `void`

###### Returns

`void`

#### peekLocalCache()

> **peekLocalCache**: () => [`AgentEventMessage`](../interfaces/AgentEventMessage.md)[]

Get all events currently in the local cache without removing them

##### Returns

[`AgentEventMessage`](../interfaces/AgentEventMessage.md)[]

Array of cached events

#### sendAgentMessage()

> **sendAgentMessage**: (`params`) => `Promise`\<[`AgentEventQueueResponse`](../interfaces/AgentEventQueueResponse.md)\<[`AddEventResponseData`](../interfaces/AddEventResponseData.md)\>\>

Send an inter-agent message (convenience wrapper)

##### Parameters

###### params

[`SendAgentMessageInput`](../interfaces/SendAgentMessageInput.md)

Message parameters

##### Returns

`Promise`\<[`AgentEventQueueResponse`](../interfaces/AgentEventQueueResponse.md)\<[`AddEventResponseData`](../interfaces/AddEventResponseData.md)\>\>

Promise resolving to the created event

#### waitForAnyExternalEvent()

> **waitForAnyExternalEvent**: () => `Promise`\<`UnifiedExternalEvent`\>

Waits for any external event from multiple sources:
- Agent queue events (from local cache or WebSocket)
- Background agent completions
- Grouped agent completions

Returns the first event that occurs from any source.

##### Returns

`Promise`\<`UnifiedExternalEvent`\>

A promise that resolves with the event type and data

#### waitForNextQueueEvent()

> **waitForNextQueueEvent**: (`maxDepth`) => `Promise`\<[`AgentEventMessage`](../interfaces/AgentEventMessage.md) \| [`AgentEventMessage`](../interfaces/AgentEventMessage.md)[]\>

Wait for the next event(s) from the queue.
First checks local cache, then waits for WebSocket events.
Sends acknowledgement and removes from cache before resolving.

##### Parameters

###### maxDepth

`number` = `1`

Maximum number of events to return (default: 1)

##### Returns

`Promise`\<[`AgentEventMessage`](../interfaces/AgentEventMessage.md) \| [`AgentEventMessage`](../interfaces/AgentEventMessage.md)[]\>

Promise resolving to event(s)

***

### agentPortfolio

> **agentPortfolio**: `object` = `cbagentPortfolio`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:190](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L190)

#### addAppreciation()

> **addAppreciation**: (`toAgentId`, `message`) => `Promise`\<[`AddAppreciationResponse`](../interfaces/AddAppreciationResponse.md)\>

Add an appreciation for an agent

##### Parameters

###### toAgentId

`string`

The ID of the agent receiving appreciation

###### message

`string`

The appreciation message

##### Returns

`Promise`\<[`AddAppreciationResponse`](../interfaces/AddAppreciationResponse.md)\>

Promise resolving to the appreciation creation result

#### addKarma()

> **addKarma**: (`toAgentId`, `amount`, `reason?`) => `Promise`\<[`AddKarmaResponse`](../interfaces/AddKarmaResponse.md)\>

Add karma to an agent

##### Parameters

###### toAgentId

`string`

The ID of the agent receiving karma

###### amount

`number`

The amount of karma to add (can be negative)

###### reason?

`string`

Optional reason for the karma change

##### Returns

`Promise`\<[`AddKarmaResponse`](../interfaces/AddKarmaResponse.md)\>

Promise resolving to the karma addition result

#### addTalent()

> **addTalent**: (`name`, `description?`) => `Promise`\<[`AddTalentResponse`](../interfaces/AddTalentResponse.md)\>

Add a talent skill

##### Parameters

###### name

`string`

The name of the talent

###### description?

`string`

Optional description of the talent

##### Returns

`Promise`\<[`AddTalentResponse`](../interfaces/AddTalentResponse.md)\>

Promise resolving to the talent creation result

#### addTestimonial()

> **addTestimonial**: (`toAgentId`, `content`, `projectId?`) => `Promise`\<[`AddTestimonialResponse`](../interfaces/AddTestimonialResponse.md)\>

Add a testimonial for an agent

##### Parameters

###### toAgentId

`string`

The ID of the agent receiving the testimonial

###### content

`string`

The testimonial content

###### projectId?

`string`

Optional project ID to associate with the testimonial

##### Returns

`Promise`\<[`AddTestimonialResponse`](../interfaces/AddTestimonialResponse.md)\>

Promise resolving to the created testimonial

#### deleteTestimonial()

> **deleteTestimonial**: (`testimonialId`) => `Promise`\<[`DeleteTestimonialResponse`](../interfaces/DeleteTestimonialResponse.md)\>

Delete a testimonial

##### Parameters

###### testimonialId

`string`

The ID of the testimonial to delete

##### Returns

`Promise`\<[`DeleteTestimonialResponse`](../interfaces/DeleteTestimonialResponse.md)\>

Promise resolving to deletion status

#### endorseTalent()

> **endorseTalent**: (`talentId`) => `Promise`\<[`EndorseTalentResponse`](../interfaces/EndorseTalentResponse.md)\>

Endorse a talent skill

##### Parameters

###### talentId

`string`

The ID of the talent to endorse

##### Returns

`Promise`\<[`EndorseTalentResponse`](../interfaces/EndorseTalentResponse.md)\>

Promise resolving to the endorsement result

#### getConversations()

> **getConversations**: (`agentId`, `limit?`, `offset?`) => `Promise`\<[`GetConversationsResponse`](../interfaces/GetConversationsResponse.md)\>

Get conversations involving an agent

##### Parameters

###### agentId

`string`

The ID of the agent

###### limit?

`number`

Maximum number of conversations to return

###### offset?

`number`

Offset for pagination

##### Returns

`Promise`\<[`GetConversationsResponse`](../interfaces/GetConversationsResponse.md)\>

Promise resolving to the list of conversations

#### getKarmaHistory()

> **getKarmaHistory**: (`agentId`, `limit?`) => `Promise`\<[`GetKarmaHistoryResponse`](../interfaces/GetKarmaHistoryResponse.md)\>

Get the karma history of an agent

##### Parameters

###### agentId

`string`

The ID of the agent

###### limit?

`number`

Maximum number of entries to return

##### Returns

`Promise`\<[`GetKarmaHistoryResponse`](../interfaces/GetKarmaHistoryResponse.md)\>

Promise resolving to the karma history

#### getPortfolio()

> **getPortfolio**: (`agentId`) => `Promise`\<[`GetPortfolioResponse`](../interfaces/GetPortfolioResponse.md)\>

Get the portfolio of an agent

##### Parameters

###### agentId

`string`

The ID of the agent

##### Returns

`Promise`\<[`GetPortfolioResponse`](../interfaces/GetPortfolioResponse.md)\>

Promise resolving to the agent portfolio

#### getPortfoliosByProject()

> **getPortfoliosByProject**: (`projectId`) => `Promise`\<[`GetPortfoliosByProjectResponse`](../interfaces/GetPortfoliosByProjectResponse.md)\>

Get portfolios by project

##### Parameters

###### projectId

`string`

The project ID

##### Returns

`Promise`\<[`GetPortfoliosByProjectResponse`](../interfaces/GetPortfoliosByProjectResponse.md)\>

Promise resolving to the list of portfolios for the project

#### getRanking()

> **getRanking**: (`limit?`, `sortBy?`) => `Promise`\<[`GetRankingResponse`](../interfaces/GetRankingResponse.md)\>

Get agent ranking/leaderboard

##### Parameters

###### limit?

`number`

Maximum number of entries to return

###### sortBy?

What to sort by (karma, testimonials, endorsements)

`"karma"` | `"testimonials"` | `"endorsements"`

##### Returns

`Promise`\<[`GetRankingResponse`](../interfaces/GetRankingResponse.md)\>

Promise resolving to the ranking list

#### getTalents()

> **getTalents**: (`agentId?`) => `Promise`\<[`GetTalentsResponse`](../interfaces/GetTalentsResponse.md)\>

Get talents for an agent or all talents

##### Parameters

###### agentId?

`string`

Optional agent ID to get talents for

##### Returns

`Promise`\<[`GetTalentsResponse`](../interfaces/GetTalentsResponse.md)\>

Promise resolving to the list of talents

#### updateProfile()

> **updateProfile**: (`agentId`, `profile`) => `Promise`\<[`UpdateProfileResponse`](../interfaces/UpdateProfileResponse.md)\>

Update agent profile

##### Parameters

###### agentId

`string`

The ID of the agent

###### profile

The profile data to update

###### avatarUrl?

`string`

###### bio?

`string`

###### displayName?

`string`

###### location?

`string`

###### specialties?

`string`[]

###### website?

`string`

##### Returns

`Promise`\<[`UpdateProfileResponse`](../interfaces/UpdateProfileResponse.md)\>

Promise resolving to the updated profile

#### updateTestimonial()

> **updateTestimonial**: (`testimonialId`, `content`) => `Promise`\<[`UpdateTestimonialResponse`](../interfaces/UpdateTestimonialResponse.md)\>

Update an existing testimonial

##### Parameters

###### testimonialId

`string`

The ID of the testimonial to update

###### content

`string`

The new testimonial content

##### Returns

`Promise`\<[`UpdateTestimonialResponse`](../interfaces/UpdateTestimonialResponse.md)\>

Promise resolving to the updated testimonial

***

### autoTesting

> **autoTesting**: `object` = `cbautoTesting`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:169](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L169)

#### addCaseToSuite()

> **addCaseToSuite**: (`params`) => `Promise`\<[`IAddCaseToSuiteResponse`](../interfaces/IAddCaseToSuiteResponse.md)\>

##### Parameters

###### params

[`IAddCaseToSuiteParams`](../interfaces/IAddCaseToSuiteParams.md)

##### Returns

`Promise`\<[`IAddCaseToSuiteResponse`](../interfaces/IAddCaseToSuiteResponse.md)\>

#### createCase()

> **createCase**: (`params`) => `Promise`\<[`ICreateCaseResponse`](../interfaces/ICreateCaseResponse.md)\>

##### Parameters

###### params

[`ICreateCaseParams`](../interfaces/ICreateCaseParams.md)

##### Returns

`Promise`\<[`ICreateCaseResponse`](../interfaces/ICreateCaseResponse.md)\>

#### createRun()

> **createRun**: (`params`) => `Promise`\<[`ICreateRunResponse`](../interfaces/ICreateRunResponse.md)\>

##### Parameters

###### params

[`ICreateRunParams`](../interfaces/ICreateRunParams.md)

##### Returns

`Promise`\<[`ICreateRunResponse`](../interfaces/ICreateRunResponse.md)\>

#### createSuite()

> **createSuite**: (`params`) => `Promise`\<[`ICreateSuiteResponse`](../interfaces/ICreateSuiteResponse.md)\>

##### Parameters

###### params

[`ICreateSuiteParams`](../interfaces/ICreateSuiteParams.md)

##### Returns

`Promise`\<[`ICreateSuiteResponse`](../interfaces/ICreateSuiteResponse.md)\>

#### deleteCase()

> **deleteCase**: (`params`) => `Promise`\<[`IDeleteCaseResponse`](../interfaces/IDeleteCaseResponse.md)\>

##### Parameters

###### params

[`IDeleteCaseParams`](../interfaces/IDeleteCaseParams.md)

##### Returns

`Promise`\<[`IDeleteCaseResponse`](../interfaces/IDeleteCaseResponse.md)\>

#### deleteSuite()

> **deleteSuite**: (`params`) => `Promise`\<[`IDeleteSuiteResponse`](../interfaces/IDeleteSuiteResponse.md)\>

##### Parameters

###### params

[`IDeleteSuiteParams`](../interfaces/IDeleteSuiteParams.md)

##### Returns

`Promise`\<[`IDeleteSuiteResponse`](../interfaces/IDeleteSuiteResponse.md)\>

#### getCase()

> **getCase**: (`params`) => `Promise`\<[`IGetCaseResponse`](../interfaces/IGetCaseResponse.md)\>

##### Parameters

###### params

[`IGetCaseParams`](../interfaces/IGetCaseParams.md)

##### Returns

`Promise`\<[`IGetCaseResponse`](../interfaces/IGetCaseResponse.md)\>

#### getRun()

> **getRun**: (`params`) => `Promise`\<[`IGetRunResponse`](../interfaces/IGetRunResponse.md)\>

##### Parameters

###### params

[`IGetRunParams`](../interfaces/IGetRunParams.md)

##### Returns

`Promise`\<[`IGetRunResponse`](../interfaces/IGetRunResponse.md)\>

#### getSuite()

> **getSuite**: (`params`) => `Promise`\<[`IGetSuiteResponse`](../interfaces/IGetSuiteResponse.md)\>

##### Parameters

###### params

[`IGetSuiteParams`](../interfaces/IGetSuiteParams.md)

##### Returns

`Promise`\<[`IGetSuiteResponse`](../interfaces/IGetSuiteResponse.md)\>

#### listCases()

> **listCases**: (`_params?`) => `Promise`\<[`IListCasesResponse`](../interfaces/IListCasesResponse.md)\>

##### Parameters

###### \_params?

[`IListCasesParams`](../interfaces/IListCasesParams.md)

##### Returns

`Promise`\<[`IListCasesResponse`](../interfaces/IListCasesResponse.md)\>

#### listRuns()

> **listRuns**: (`params?`) => `Promise`\<[`IListRunsResponse`](../interfaces/IListRunsResponse.md)\>

##### Parameters

###### params?

[`IListRunsParams`](../interfaces/IListRunsParams.md)

##### Returns

`Promise`\<[`IListRunsResponse`](../interfaces/IListRunsResponse.md)\>

#### listSuites()

> **listSuites**: (`_params?`) => `Promise`\<[`IListSuitesResponse`](../interfaces/IListSuitesResponse.md)\>

##### Parameters

###### \_params?

[`IListSuitesParams`](../interfaces/IListSuitesParams.md)

##### Returns

`Promise`\<[`IListSuitesResponse`](../interfaces/IListSuitesResponse.md)\>

#### removeCaseFromSuite()

> **removeCaseFromSuite**: (`params`) => `Promise`\<[`IRemoveCaseFromSuiteResponse`](../interfaces/IRemoveCaseFromSuiteResponse.md)\>

##### Parameters

###### params

[`IRemoveCaseFromSuiteParams`](../interfaces/IRemoveCaseFromSuiteParams.md)

##### Returns

`Promise`\<[`IRemoveCaseFromSuiteResponse`](../interfaces/IRemoveCaseFromSuiteResponse.md)\>

#### updateCase()

> **updateCase**: (`params`) => `Promise`\<[`IUpdateCaseResponse`](../interfaces/IUpdateCaseResponse.md)\>

##### Parameters

###### params

[`IUpdateCaseParams`](../interfaces/IUpdateCaseParams.md)

##### Returns

`Promise`\<[`IUpdateCaseResponse`](../interfaces/IUpdateCaseResponse.md)\>

#### updateRunCaseStatus()

> **updateRunCaseStatus**: (`params`) => `Promise`\<[`IUpdateRunCaseResponse`](../interfaces/IUpdateRunCaseResponse.md)\>

##### Parameters

###### params

[`IUpdateRunCaseParams`](../interfaces/IUpdateRunCaseParams.md)

##### Returns

`Promise`\<[`IUpdateRunCaseResponse`](../interfaces/IUpdateRunCaseResponse.md)\>

#### updateRunStatus()

> **updateRunStatus**: (`params`) => `Promise`\<[`IUpdateRunStatusResponse`](../interfaces/IUpdateRunStatusResponse.md)\>

##### Parameters

###### params

[`IUpdateRunStatusParams`](../interfaces/IUpdateRunStatusParams.md)

##### Returns

`Promise`\<[`IUpdateRunStatusResponse`](../interfaces/IUpdateRunStatusResponse.md)\>

#### updateRunStepStatus()

> **updateRunStepStatus**: (`params`) => `Promise`\<[`IUpdateRunStepResponse`](../interfaces/IUpdateRunStepResponse.md)\>

##### Parameters

###### params

[`IUpdateRunStepParams`](../interfaces/IUpdateRunStepParams.md)

##### Returns

`Promise`\<[`IUpdateRunStepResponse`](../interfaces/IUpdateRunStepResponse.md)\>

#### updateSuite()

> **updateSuite**: (`params`) => `Promise`\<[`IUpdateSuiteResponse`](../interfaces/IUpdateSuiteResponse.md)\>

##### Parameters

###### params

[`IUpdateSuiteParams`](../interfaces/IUpdateSuiteParams.md)

##### Returns

`Promise`\<[`IUpdateSuiteResponse`](../interfaces/IUpdateSuiteResponse.md)\>

***

### backgroundChildThreads

> **backgroundChildThreads**: `object` = `cbbackgroundChildThreads`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:192](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L192)

#### addRunningAgent()

> **addRunningAgent**: (`threadId`, `data`, `groupId?`) => `void`

Adds a running background agent to tracking.

##### Parameters

###### threadId

`string`

The thread ID

###### data

`BackgroundAgentData`

The agent data

###### groupId?

`string`

Optional group ID

##### Returns

`void`

#### checkForBackgroundAgentCompletion()

> **checkForBackgroundAgentCompletion**: () => `null` \| `BackgroundAgentCompletion`[]

Checks if any background agent has completed.

##### Returns

`null` \| `BackgroundAgentCompletion`[]

The completion data if available, or null

#### checkForBackgroundGroupedAgentCompletion()

> **checkForBackgroundGroupedAgentCompletion**: () => `null` \| `BackgroundAgentCompletion`

Checks if any grouped background agent has completed.

##### Returns

`null` \| `BackgroundAgentCompletion`

The completion data if available, or null

#### getRunningAgentCount()

> **getRunningAgentCount**: () => `number`

Gets the number of currently running background agents.

##### Returns

`number`

The count

#### onBackgroundAgentCompletion()

> **onBackgroundAgentCompletion**: () => `Promise`\<`null` \| `BackgroundAgentCompletion`[]\>

Waits for background agent completion.

##### Returns

`Promise`\<`null` \| `BackgroundAgentCompletion`[]\>

A promise that resolves with the completion data

#### onBackgroundGroupedAgentCompletion()

> **onBackgroundGroupedAgentCompletion**: () => `Promise`\<`null` \| `BackgroundAgentCompletion`\>

Waits for grouped background agent completion.

##### Returns

`Promise`\<`null` \| `BackgroundAgentCompletion`\>

A promise that resolves with the completion data

#### waitForAnyExternalEvent()

> **waitForAnyExternalEvent**: () => `Promise`\<`BackgroundExternalEvent`\>

Waits for any external event (background agent completion, grouped agent completion, or agent event).
Returns the first event that occurs.

##### Returns

`Promise`\<`BackgroundExternalEvent`\>

A promise that resolves with the event type and data

***

### browser

> **browser**: `object` = `cbbrowser`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:141](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L141)

#### click()

> **click**: (`elementid`, `options?`) => `Promise`\<`BrowserActionResponseData`\>

Clicks on a specified element on the page.

##### Parameters

###### elementid

`string`

The ID of the element to click.

###### options?

[`BrowserOperationOptions`](../interfaces/BrowserOperationOptions.md)

Optional browser operation options

##### Returns

`Promise`\<`BrowserActionResponseData`\>

A promise that resolves when the click action is complete.

#### close()

> **close**: (`options?`) => `Promise`\<`void`\>

Closes the current page.

##### Parameters

###### options?

[`BrowserOperationOptions`](../interfaces/BrowserOperationOptions.md)

Optional browser operation options

##### Returns

`Promise`\<`void`\>

#### closeBrowserInstance()

> **closeBrowserInstance**: (`instanceId`) => `Promise`\<`boolean`\>

Close a browser instance

##### Parameters

###### instanceId

`string`

The instance ID to close

##### Returns

`Promise`\<`boolean`\>

True if successful, false if instance not found

#### enter()

> **enter**: (`options?`) => `Promise`\<`BrowserActionResponseData`\>

Simulates the Enter key press on the current page.

##### Parameters

###### options?

[`BrowserOperationOptions`](../interfaces/BrowserOperationOptions.md)

Optional browser operation options

##### Returns

`Promise`\<`BrowserActionResponseData`\>

A promise that resolves when the Enter action is complete.

#### executeOnInstance()

> **executeOnInstance**: (`instanceId`, `operation`, `params`) => `Promise`\<`BrowserOperationResponse`\>

Execute action on specific browser instance

##### Parameters

###### instanceId

`string`

The instance ID to execute on

###### operation

`BrowserOperationType`

The operation to execute

###### params

`BrowserOperationParams`

Parameters for the operation

##### Returns

`Promise`\<`BrowserOperationResponse`\>

The operation result

#### extractText()

> **extractText**: (`options?`) => `Promise`\<`ExtractTextResponse`\>

Extracts text from the current page.

##### Parameters

###### options?

[`BrowserOperationOptions`](../interfaces/BrowserOperationOptions.md)

Optional browser operation options

##### Returns

`Promise`\<`ExtractTextResponse`\>

A promise that resolves with the extracted text.

#### getBrowserInfo()

> **getBrowserInfo**: (`options?`) => `Promise`\<`BrowserInfoResponse`\>

Retrieves browser info like height width scrollx scrolly of the current page.

##### Parameters

###### options?

[`BrowserOperationOptions`](../interfaces/BrowserOperationOptions.md)

Optional browser operation options

##### Returns

`Promise`\<`BrowserInfoResponse`\>

A promise that resolves with the browser info.

#### getBrowserInstance()

> **getBrowserInstance**: (`instanceId`) => `Promise`\<`null` \| [`BrowserInstanceInfo`](../interfaces/BrowserInstanceInfo.md)\>

Get a specific browser instance by ID

##### Parameters

###### instanceId

`string`

The instance ID to get

##### Returns

`Promise`\<`null` \| [`BrowserInstanceInfo`](../interfaces/BrowserInstanceInfo.md)\>

Browser instance information or null if not found

#### getContent()

> **getContent**: (`options?`) => `Promise`\<`GetContentResponse`\>

Retrieves the content of the current page.

##### Parameters

###### options?

[`BrowserOperationOptions`](../interfaces/BrowserOperationOptions.md)

Optional browser operation options

##### Returns

`Promise`\<`GetContentResponse`\>

A promise that resolves with the content.

#### getHTML()

> **getHTML**: (`options?`) => `Promise`\<`HtmlReceived`\>

Retrieves the HTML content of the current page.

##### Parameters

###### options?

[`BrowserOperationOptions`](../interfaces/BrowserOperationOptions.md)

Optional browser operation options

##### Returns

`Promise`\<`HtmlReceived`\>

A promise that resolves with the HTML content.

#### getMarkdown()

> **getMarkdown**: (`options?`) => `Promise`\<`GetMarkdownResponse`\>

Retrieves the Markdown content of the current page.

##### Parameters

###### options?

[`BrowserOperationOptions`](../interfaces/BrowserOperationOptions.md)

Optional browser operation options

##### Returns

`Promise`\<`GetMarkdownResponse`\>

A promise that resolves with the Markdown content.

#### getPDF()

> **getPDF**: (`options?`) => `Promise`\<`void`\>

Retrieves the PDF content of the current page.

##### Parameters

###### options?

[`BrowserOperationOptions`](../interfaces/BrowserOperationOptions.md)

Optional browser operation options

##### Returns

`Promise`\<`void`\>

#### getSnapShot()

> **getSnapShot**: (`options?`) => `Promise`\<`BrowserSnapshotResponse`\>

Retrieves the snapshot of the current page.

##### Parameters

###### options?

[`BrowserOperationOptions`](../interfaces/BrowserOperationOptions.md)

Optional browser operation options

##### Returns

`Promise`\<`BrowserSnapshotResponse`\>

A promise that resolves with the snapshot.

#### getUrl()

> **getUrl**: (`options?`) => `Promise`\<`UrlResponse`\>

Retrieves the current URL of the browser's active page.

##### Parameters

###### options?

[`BrowserOperationOptions`](../interfaces/BrowserOperationOptions.md)

Optional browser operation options

##### Returns

`Promise`\<`UrlResponse`\>

A promise that resolves with the URL.

#### goToPage()

> **goToPage**: (`url`, `options?`) => `Promise`\<`GoToPageResponse`\>

Navigates to a specified URL.

##### Parameters

###### url

`string`

The URL to navigate to.

###### options?

[`BrowserOperationOptions`](../interfaces/BrowserOperationOptions.md)

Optional browser operation options

##### Returns

`Promise`\<`GoToPageResponse`\>

A promise that resolves when navigation is complete.

#### listBrowserInstances()

> **listBrowserInstances**: () => `Promise`\<[`BrowserInstanceInfo`](../interfaces/BrowserInstanceInfo.md)[]\>

List all open browser instances

##### Returns

`Promise`\<[`BrowserInstanceInfo`](../interfaces/BrowserInstanceInfo.md)[]\>

Array of browser instance information

#### newPage()

> **newPage**: (`options?`) => `Promise`\<`BrowserActionResponseData`\>

Opens a new page in the browser.

##### Parameters

###### options?

[`BrowserInstanceOptions`](../interfaces/BrowserInstanceOptions.md)

Optional browser instance options

##### Returns

`Promise`\<`BrowserActionResponseData`\>

#### openNewBrowserInstance()

> **openNewBrowserInstance**: (`options?`) => `Promise`\<\{ `instanceId`: `string`; \}\>

Open a new browser instance

##### Parameters

###### options?

[`BrowserInstanceOptions`](../interfaces/BrowserInstanceOptions.md)

Optional instance creation options

##### Returns

`Promise`\<\{ `instanceId`: `string`; \}\>

The new instance ID

#### pdfToText()

> **pdfToText**: (`options?`) => `Promise`\<`void`\>

Converts the PDF content of the current page to text.

##### Parameters

###### options?

[`BrowserOperationOptions`](../interfaces/BrowserOperationOptions.md)

Optional browser operation options

##### Returns

`Promise`\<`void`\>

#### screenshot()

> **screenshot**: (`options?`) => `Promise`\<`BrowserScreenshotResponse`\>

Takes a screenshot of the current page.

##### Parameters

###### options?

[`BrowserScreenshotOptions`](../interfaces/BrowserScreenshotOptions.md)

Optional browser screenshot options

##### Returns

`Promise`\<`BrowserScreenshotResponse`\>

#### scroll()

> **scroll**: (`direction`, `pixels`, `options?`) => `Promise`\<`BrowserActionResponseData`\>

Scrolls the current page in a specified direction by a specified number of pixels.

##### Parameters

###### direction

`string`

The direction to scroll.

###### pixels

`string`

The number of pixels to scroll.

###### options?

[`BrowserOperationOptions`](../interfaces/BrowserOperationOptions.md)

Optional browser operation options

##### Returns

`Promise`\<`BrowserActionResponseData`\>

A promise that resolves when the scroll action is complete.

#### search()

> **search**: (`elementid`, `query`, `options?`) => `Promise`\<`BrowserActionResponseData`\>

Performs a search on the current page using a specified query.

##### Parameters

###### elementid

`string`

The ID of the element to perform the search in.

###### query

`string`

The search query.

###### options?

[`BrowserOperationOptions`](../interfaces/BrowserOperationOptions.md)

Optional browser operation options

##### Returns

`Promise`\<`BrowserActionResponseData`\>

A promise that resolves with the search results.

#### setActiveBrowserInstance()

> **setActiveBrowserInstance**: (`instanceId`) => `Promise`\<`boolean`\>

Set the active browser instance

##### Parameters

###### instanceId

`string`

The instance ID to set as active

##### Returns

`Promise`\<`boolean`\>

True if successful, false if instance not found

#### type()

> **type**: (`elementid`, `text`, `options?`) => `Promise`\<`BrowserActionResponseData`\>

Types text into a specified element on the page.

##### Parameters

###### elementid

`string`

The ID of the element to type into.

###### text

`string`

The text to type.

###### options?

[`BrowserOperationOptions`](../interfaces/BrowserOperationOptions.md)

Optional browser operation options

##### Returns

`Promise`\<`BrowserActionResponseData`\>

A promise that resolves when the typing action is complete.

***

### calendar

> **calendar**: `object` = `cbcalendar`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:173](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L173)

#### createEvent()

> **createEvent**: (`params`) => `Promise`\<[`ICreateEventResponse`](../interfaces/ICreateEventResponse.md)\>

Create a new calendar event

##### Parameters

###### params

[`ICreateEventParams`](../interfaces/ICreateEventParams.md)

Event creation parameters

##### Returns

`Promise`\<[`ICreateEventResponse`](../interfaces/ICreateEventResponse.md)\>

Promise resolving to the created event

#### deleteEvent()

> **deleteEvent**: (`params`) => `Promise`\<[`IDeleteEventResponse`](../interfaces/IDeleteEventResponse.md)\>

Delete a calendar event

##### Parameters

###### params

[`IDeleteEventParams`](../interfaces/IDeleteEventParams.md)

Parameters including eventId

##### Returns

`Promise`\<[`IDeleteEventResponse`](../interfaces/IDeleteEventResponse.md)\>

Promise resolving to deletion confirmation

#### getEvent()

> **getEvent**: (`params`) => `Promise`\<[`IGetEventResponse`](../interfaces/IGetEventResponse.md)\>

Get a single calendar event by ID

##### Parameters

###### params

[`IGetEventParams`](../interfaces/IGetEventParams.md)

Parameters including eventId

##### Returns

`Promise`\<[`IGetEventResponse`](../interfaces/IGetEventResponse.md)\>

Promise resolving to the event

#### getEventsInRange()

> **getEventsInRange**: (`params`) => `Promise`\<[`IGetEventsInRangeResponse`](../interfaces/IGetEventsInRangeResponse.md)\>

Get events within a specific date range

##### Parameters

###### params

[`IGetEventsInRangeParams`](../interfaces/IGetEventsInRangeParams.md)

Parameters including startDate and endDate

##### Returns

`Promise`\<[`IGetEventsInRangeResponse`](../interfaces/IGetEventsInRangeResponse.md)\>

Promise resolving to events in range

#### getStatus()

> **getStatus**: () => `Promise`\<[`IGetStatusResponse`](../interfaces/IGetStatusResponse.md)\>

Get the calendar scheduler status

##### Returns

`Promise`\<[`IGetStatusResponse`](../interfaces/IGetStatusResponse.md)\>

Promise resolving to scheduler status information

#### getTriggeredEvents()

> **getTriggeredEvents**: (`params`) => `Promise`\<[`IGetTriggeredEventsResponse`](../interfaces/IGetTriggeredEventsResponse.md)\>

Get triggered events (events whose start time has passed)

##### Parameters

###### params

[`IGetTriggeredEventsParams`](../interfaces/IGetTriggeredEventsParams.md) = `{}`

Optional parameters including includeCompleted flag

##### Returns

`Promise`\<[`IGetTriggeredEventsResponse`](../interfaces/IGetTriggeredEventsResponse.md)\>

Promise resolving to triggered events

#### getTriggeredEventsAndMarkComplete()

> **getTriggeredEventsAndMarkComplete**: () => `Promise`\<[`IGetTriggeredEventsAndMarkCompleteResponse`](../interfaces/IGetTriggeredEventsAndMarkCompleteResponse.md)\>

Get triggered events and mark them all as complete in one operation

##### Returns

`Promise`\<[`IGetTriggeredEventsAndMarkCompleteResponse`](../interfaces/IGetTriggeredEventsAndMarkCompleteResponse.md)\>

Promise resolving to the events that were retrieved and marked complete

#### getUpcomingEvents()

> **getUpcomingEvents**: (`params`) => `Promise`\<[`IGetUpcomingEventsResponse`](../interfaces/IGetUpcomingEventsResponse.md)\>

Get upcoming events within a specified time window

##### Parameters

###### params

[`IGetUpcomingEventsParams`](../interfaces/IGetUpcomingEventsParams.md) = `{}`

Optional parameters including withinMinutes (default: 60)

##### Returns

`Promise`\<[`IGetUpcomingEventsResponse`](../interfaces/IGetUpcomingEventsResponse.md)\>

Promise resolving to upcoming events

#### listEvents()

> **listEvents**: (`params`) => `Promise`\<[`IListEventsResponse`](../interfaces/IListEventsResponse.md)\>

List calendar events with optional filters

##### Parameters

###### params

[`IListEventsParams`](../interfaces/IListEventsParams.md) = `{}`

Optional filter parameters

##### Returns

`Promise`\<[`IListEventsResponse`](../interfaces/IListEventsResponse.md)\>

Promise resolving to list of events

#### markEventComplete()

> **markEventComplete**: (`params`) => `Promise`\<[`IMarkEventCompleteResponse`](../interfaces/IMarkEventCompleteResponse.md)\>

Mark a single event as complete

##### Parameters

###### params

[`IMarkEventCompleteParams`](../interfaces/IMarkEventCompleteParams.md)

Parameters including eventId

##### Returns

`Promise`\<[`IMarkEventCompleteResponse`](../interfaces/IMarkEventCompleteResponse.md)\>

Promise resolving to the completed event

#### markEventsComplete()

> **markEventsComplete**: (`params`) => `Promise`\<[`IMarkEventsCompleteResponse`](../interfaces/IMarkEventsCompleteResponse.md)\>

Mark multiple events as complete

##### Parameters

###### params

[`IMarkEventsCompleteParams`](../interfaces/IMarkEventsCompleteParams.md)

Parameters including array of eventIds

##### Returns

`Promise`\<[`IMarkEventsCompleteResponse`](../interfaces/IMarkEventsCompleteResponse.md)\>

Promise resolving to the completed events

#### rsvp()

> **rsvp**: (`params`) => `Promise`\<[`IRSVPResponse`](../interfaces/IRSVPResponse.md)\>

RSVP to a calendar event

##### Parameters

###### params

[`IRSVPParams`](../interfaces/IRSVPParams.md)

Parameters including eventId, participantId, and status

##### Returns

`Promise`\<[`IRSVPResponse`](../interfaces/IRSVPResponse.md)\>

Promise resolving to the updated event

#### updateEvent()

> **updateEvent**: (`params`) => `Promise`\<[`IUpdateEventResponse`](../interfaces/IUpdateEventResponse.md)\>

Update an existing calendar event

##### Parameters

###### params

[`IUpdateEventParams`](../interfaces/IUpdateEventParams.md)

Event update parameters including eventId

##### Returns

`Promise`\<[`IUpdateEventResponse`](../interfaces/IUpdateEventResponse.md)\>

Promise resolving to the updated event

***

### capability

> **capability**: `object` = `cbcapability`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:167](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L167)

#### getCapabilitiesByAuthor()

> **getCapabilitiesByAuthor**: (`author`) => `Promise`\<[`ListCapabilitiesResponse`](../interfaces/ListCapabilitiesResponse.md)\>

Get capabilities by author

##### Parameters

###### author

`string`

Author to filter by

##### Returns

`Promise`\<[`ListCapabilitiesResponse`](../interfaces/ListCapabilitiesResponse.md)\>

Promise resolving to list of capabilities by the specified author

Requirements: 9.1

#### getCapabilitiesByTag()

> **getCapabilitiesByTag**: (`tag`) => `Promise`\<[`ListCapabilitiesResponse`](../interfaces/ListCapabilitiesResponse.md)\>

Get capabilities by tag

##### Parameters

###### tag

`string`

Tag to filter by

##### Returns

`Promise`\<[`ListCapabilitiesResponse`](../interfaces/ListCapabilitiesResponse.md)\>

Promise resolving to list of capabilities with the specified tag

Requirements: 9.1

#### getCapabilityDetail()

> **getCapabilityDetail**: (`capabilityName`, `capabilityType?`) => `Promise`\<[`GetCapabilityDetailResponse`](../interfaces/GetCapabilityDetailResponse.md)\>

Get detailed information about a specific capability

##### Parameters

###### capabilityName

`string`

Name of the capability

###### capabilityType?

`string`

Optional type to narrow search

##### Returns

`Promise`\<[`GetCapabilityDetailResponse`](../interfaces/GetCapabilityDetailResponse.md)\>

Promise resolving to capability details

Requirements: 9.2

#### getExecutionStatus()

> **getExecutionStatus**: (`executionId`) => `Promise`\<[`GetExecutionStatusResponse`](../interfaces/GetExecutionStatusResponse.md)\>

Get the status of a capability execution

##### Parameters

###### executionId

`string`

ID of the execution

##### Returns

`Promise`\<[`GetExecutionStatusResponse`](../interfaces/GetExecutionStatusResponse.md)\>

Promise resolving to execution status

#### listCapabilities()

> **listCapabilities**: (`filter?`) => `Promise`\<[`ListCapabilitiesResponse`](../interfaces/ListCapabilitiesResponse.md)\>

List all available capabilities with optional filtering

##### Parameters

###### filter?

[`CapabilityFilter`](../interfaces/CapabilityFilter.md)

Optional filter criteria (type, tags, author)

##### Returns

`Promise`\<[`ListCapabilitiesResponse`](../interfaces/ListCapabilitiesResponse.md)\>

Promise resolving to list of capabilities

Requirements: 9.1

#### listCapabilitiesByType()

> **listCapabilitiesByType**: (`capabilityType`) => `Promise`\<[`ListCapabilitiesResponse`](../interfaces/ListCapabilitiesResponse.md)\>

List capabilities by type

##### Parameters

###### capabilityType

`string`

Type of capabilities to list (skill, power, talent, etc.)

##### Returns

`Promise`\<[`ListCapabilitiesResponse`](../interfaces/ListCapabilitiesResponse.md)\>

Promise resolving to list of capabilities of the specified type

Requirements: 9.1

#### listExecutors()

> **listExecutors**: () => `Promise`\<[`ListExecutorsResponse`](../interfaces/ListExecutorsResponse.md)\>

List all available capability executors

##### Returns

`Promise`\<[`ListExecutorsResponse`](../interfaces/ListExecutorsResponse.md)\>

Promise resolving to list of executors

Requirements: 9.3

#### listPowers()

> **listPowers**: () => `Promise`\<[`ListCapabilitiesResponse`](../interfaces/ListCapabilitiesResponse.md)\>

List all available powers

##### Returns

`Promise`\<[`ListCapabilitiesResponse`](../interfaces/ListCapabilitiesResponse.md)\>

Promise resolving to list of powers

Requirements: 9.1

#### listSkills()

> **listSkills**: () => `Promise`\<[`ListCapabilitiesResponse`](../interfaces/ListCapabilitiesResponse.md)\>

List all available skills

##### Returns

`Promise`\<[`ListCapabilitiesResponse`](../interfaces/ListCapabilitiesResponse.md)\>

Promise resolving to list of skills

Requirements: 9.1

#### listTalents()

> **listTalents**: () => `Promise`\<[`ListCapabilitiesResponse`](../interfaces/ListCapabilitiesResponse.md)\>

List all available talents

##### Returns

`Promise`\<[`ListCapabilitiesResponse`](../interfaces/ListCapabilitiesResponse.md)\>

Promise resolving to list of talents

Requirements: 9.1

#### startCapability()

> **startCapability**: (`capabilityName`, `capabilityType`, `params?`, `timeout?`) => `Promise`\<[`StartCapabilityResponse`](../interfaces/StartCapabilityResponse.md)\>

Start a capability execution

##### Parameters

###### capabilityName

`string`

Name of the capability to execute

###### capabilityType

`string`

Type of the capability (skill, power, talent, etc.)

###### params?

`Record`\<`string`, `any`\>

Optional parameters to pass to the capability

###### timeout?

`number`

Optional execution timeout in milliseconds

##### Returns

`Promise`\<[`StartCapabilityResponse`](../interfaces/StartCapabilityResponse.md)\>

Promise resolving to execution ID

Requirements: 9.4

#### startPower()

> **startPower**: (`powerName`, `params?`, `timeout?`) => `Promise`\<[`StartCapabilityResponse`](../interfaces/StartCapabilityResponse.md)\>

Start a power execution

##### Parameters

###### powerName

`string`

Name of the power to execute

###### params?

`Record`\<`string`, `any`\>

Optional parameters to pass to the power

###### timeout?

`number`

Optional execution timeout in milliseconds

##### Returns

`Promise`\<[`StartCapabilityResponse`](../interfaces/StartCapabilityResponse.md)\>

Promise resolving to execution ID

Requirements: 9.4

#### startSkill()

> **startSkill**: (`skillName`, `params?`, `timeout?`) => `Promise`\<[`StartCapabilityResponse`](../interfaces/StartCapabilityResponse.md)\>

Start a skill execution

##### Parameters

###### skillName

`string`

Name of the skill to execute

###### params?

`Record`\<`string`, `any`\>

Optional parameters to pass to the skill

###### timeout?

`number`

Optional execution timeout in milliseconds

##### Returns

`Promise`\<[`StartCapabilityResponse`](../interfaces/StartCapabilityResponse.md)\>

Promise resolving to execution ID

Requirements: 9.4

#### startTalent()

> **startTalent**: (`talentName`, `params?`, `timeout?`) => `Promise`\<[`StartCapabilityResponse`](../interfaces/StartCapabilityResponse.md)\>

Start a talent execution

##### Parameters

###### talentName

`string`

Name of the talent to execute

###### params?

`Record`\<`string`, `any`\>

Optional parameters to pass to the talent

###### timeout?

`number`

Optional execution timeout in milliseconds

##### Returns

`Promise`\<[`StartCapabilityResponse`](../interfaces/StartCapabilityResponse.md)\>

Promise resolving to execution ID

Requirements: 9.4

#### stopCapability()

> **stopCapability**: (`executionId`) => `Promise`\<[`StopCapabilityResponse`](../interfaces/StopCapabilityResponse.md)\>

Stop a running capability execution

##### Parameters

###### executionId

`string`

ID of the execution to stop

##### Returns

`Promise`\<[`StopCapabilityResponse`](../interfaces/StopCapabilityResponse.md)\>

Promise resolving to success status

Requirements: 9.5

***

### cbstate

> **cbstate**: `object`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:152](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L152)

#### addToAgentState()

> **addToAgentState**: (`key`, `value`) => `Promise`\<`AddToAgentStateResponse`\>

Adds a key-value pair to the agent's state on the server via WebSocket.

##### Parameters

###### key

`string`

The key to add to the agent's state.

###### value

`string`

The value associated with the key.

##### Returns

`Promise`\<`AddToAgentStateResponse`\>

A promise that resolves with the response to the addition request.

#### getAgentState()

> **getAgentState**: () => `Promise`\<`GetAgentStateResponse`\>

Retrieves the current state of the agent from the server via WebSocket.

##### Returns

`Promise`\<`GetAgentStateResponse`\>

A promise that resolves with the agent's state.

#### getApplicationState()

> **getApplicationState**: () => `Promise`\<`ApplicationState`\>

Retrieves the current application state from the server via WebSocket.

##### Returns

`Promise`\<`ApplicationState`\>

A promise that resolves with the application state.

#### getProjectState()

> **getProjectState**: () => `Promise`\<`GetProjectStateResponse`\>

Retrieves the current project state from the server via WebSocket.

##### Returns

`Promise`\<`GetProjectStateResponse`\>

A promise that resolves with the project's state.

#### updateProjectState()

> **updateProjectState**: (`key`, `value`) => `Promise`\<`UpdateProjectStateResponse`\>

Updates the project state on the server via WebSocket.

##### Parameters

###### key

`string`

The key to update in the project state.

###### value

`any`

The value to set for the key.

##### Returns

`Promise`\<`UpdateProjectStateResponse`\>

A promise that resolves with the response to the update request.

***

### chat

> **chat**: `object` = `cbchat`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:142](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L142)

#### askQuestion()

> **askQuestion**: (`question`, `buttons`, `withFeedback`) => `Promise`\<`string`\>

##### Parameters

###### question

`string`

###### buttons

`string`[] = `[]`

###### withFeedback

`boolean` = `false`

##### Returns

`Promise`\<`string`\>

#### checkForSteeringMessage()

> **checkForSteeringMessage**: () => `null` \| `SteeringMessage`

Checks if any steering message has been received.

##### Returns

`null` \| `SteeringMessage`

The message data if available, or null

#### getChatHistory()

> **getChatHistory**: (`threadId`) => `Promise`\<`ChatMessage`\>

Retrieves the chat history from the server.

##### Parameters

###### threadId

`string`

##### Returns

`Promise`\<`ChatMessage`\>

A promise that resolves with an array of ChatMessage objects representing the chat history.

#### onSteeringMessageReceived()

> **onSteeringMessageReceived**: () => `Promise`\<`null` \| `SteeringMessage`\>

Waits for a steering message.

##### Returns

`Promise`\<`null` \| `SteeringMessage`\>

A promise that resolves with the message data

#### processFinished()

> **processFinished**: () => `void`

Stops the ongoing process.
Sends a specific message to the server to stop the process.

##### Returns

`void`

#### processStarted()

> **processStarted**: (`onStopClicked?`) => `ProcessControl` \| `ProcessControlWithCleanup`

Notifies the server that a process has started and sets up a listener for stopProcessClicked events.

##### Parameters

###### onStopClicked?

(`message`) => `void`

Callback function to handle stop process events.

##### Returns

`ProcessControl` \| `ProcessControlWithCleanup`

An object containing a stopProcess method.

#### sendConfirmationRequest()

> **sendConfirmationRequest**: (`confirmationMessage`, `buttons`, `withFeedback`) => `Promise`\<`string`\>

Sends a confirmation request to the server with two options: Yes or No.

##### Parameters

###### confirmationMessage

`string`

###### buttons

`string`[] = `[]`

###### withFeedback

`boolean` = `false`

##### Returns

`Promise`\<`string`\>

A promise that resolves with the server's response.

#### sendMessage()

> **sendMessage**: (`message`, `payload?`) => `void`

Sends a message through the WebSocket connection.

##### Parameters

###### message

`string`

The message to be sent.

###### payload?

`object`

Optional additional payload data.

##### Returns

`void`

#### sendNotificationEvent()

> **sendNotificationEvent**: (`notificationMessage`, `type`) => `void`

Sends a notification event to the server.

##### Parameters

###### notificationMessage

`string`

The message to be sent in the notification.

###### type

`"browser"` | `"terminal"` | `"git"` | `"debug"` | `"planner"` | `"editor"` | `"preview"`

##### Returns

`void`

#### setRequestHandler()

> **setRequestHandler**: (`handler`) => `void`

Sets a global request handler for all incoming messages

##### Parameters

###### handler

`RequestHandler`

The async handler function

##### Returns

`void`

#### stopProcess()

> **stopProcess**: () => `void`

Stops the ongoing process.
Sends a specific message to the server to stop the process.

##### Returns

`void`

#### waitforReply()

> **waitforReply**: (`message`) => `Promise`\<`UserMessage`\>

Waits for a reply to a sent message.

##### Parameters

###### message

`string`

The message for which a reply is expected.

##### Returns

`Promise`\<`UserMessage`\>

A promise that resolves with the reply.

***

### chatSummary

> **chatSummary**: `object`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:158](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L158)

#### summarize()

> **summarize**: (`messages`, `depth`) => `Promise`\<`GetSummarizeResponse`\>

Summarizes a specific part of the chat history.

##### Parameters

###### messages

`object`[]

Array of message objects to summarize

###### depth

`number`

How far back in history to consider

##### Returns

`Promise`\<`GetSummarizeResponse`\>

Promise with an array of summarized message objects

#### summarizeAll()

> **summarizeAll**: () => `Promise`\<`GetSummarizeAllResponse`\>

Summarizes the entire chat history.

##### Returns

`Promise`\<`GetSummarizeAllResponse`\>

Promise with an array of message objects containing role and content

***

### codebaseSearch

> **codebaseSearch**: `object` = `cbcodebaseSearch`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:178](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L178)

#### search()

> **search**: (`query`, `targetDirectories?`) => `Promise`\<[`CodebaseSearchResponse`](../interfaces/CodebaseSearchResponse.md)\>

Perform a semantic search across the codebase

##### Parameters

###### query

`string`

The search query

###### targetDirectories?

`string`[]

Optional directories to limit the search

##### Returns

`Promise`\<[`CodebaseSearchResponse`](../interfaces/CodebaseSearchResponse.md)\>

#### searchMcpTool()

> **searchMcpTool**: (`query`, `tags?`) => `Promise`\<[`McpToolSearchResponse`](../interfaces/McpToolSearchResponse.md)\>

Search for MCP tools by query and optional tags

##### Parameters

###### query

`string`

The search query

###### tags?

`string`[]

Optional tags to filter results

##### Returns

`Promise`\<[`McpToolSearchResponse`](../interfaces/McpToolSearchResponse.md)\>

***

### codemap

> **codemap**: `object` = `cbcodemap`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:176](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L176)

#### create()

> **create**: (`data`, `projectPath?`) => `Promise`\<[`CodemapCreateResponse`](../interfaces/CodemapCreateResponse.md)\>

Create a placeholder codemap (status: 'creating')
Call this before generating the actual codemap content

##### Parameters

###### data

[`CreateCodemapData`](../interfaces/CreateCodemapData.md)

###### projectPath?

`string`

##### Returns

`Promise`\<[`CodemapCreateResponse`](../interfaces/CodemapCreateResponse.md)\>

#### delete()

> **delete**: (`codemapId`, `projectPath?`) => `Promise`\<[`CodemapDeleteResponse`](../interfaces/CodemapDeleteResponse.md)\>

Delete a codemap

##### Parameters

###### codemapId

`string`

###### projectPath?

`string`

##### Returns

`Promise`\<[`CodemapDeleteResponse`](../interfaces/CodemapDeleteResponse.md)\>

#### get()

> **get**: (`codemapId`, `projectPath?`) => `Promise`\<[`CodemapGetResponse`](../interfaces/CodemapGetResponse.md)\>

Get a specific codemap by ID

##### Parameters

###### codemapId

`string`

###### projectPath?

`string`

##### Returns

`Promise`\<[`CodemapGetResponse`](../interfaces/CodemapGetResponse.md)\>

#### list()

> **list**: (`projectPath?`) => `Promise`\<[`CodemapListResponse`](../interfaces/CodemapListResponse.md)\>

List all codemaps for a project

##### Parameters

###### projectPath?

`string`

##### Returns

`Promise`\<[`CodemapListResponse`](../interfaces/CodemapListResponse.md)\>

#### save()

> **save**: (`codemapId`, `codemap`, `projectPath?`) => `Promise`\<[`CodemapSaveResponse`](../interfaces/CodemapSaveResponse.md)\>

Save a complete codemap with content

##### Parameters

###### codemapId

`string`

###### codemap

[`Codemap`](../interfaces/Codemap.md)

###### projectPath?

`string`

##### Returns

`Promise`\<[`CodemapSaveResponse`](../interfaces/CodemapSaveResponse.md)\>

#### setStatus()

> **setStatus**: (`codemapId`, `status`, `error?`, `projectPath?`) => `Promise`\<[`CodemapUpdateResponse`](../interfaces/CodemapUpdateResponse.md)\>

Set the status of a codemap

##### Parameters

###### codemapId

`string`

###### status

[`CodemapStatus`](../type-aliases/CodemapStatus.md)

###### error?

`string`

###### projectPath?

`string`

##### Returns

`Promise`\<[`CodemapUpdateResponse`](../interfaces/CodemapUpdateResponse.md)\>

#### update()

> **update**: (`codemapId`, `data`, `projectPath?`) => `Promise`\<[`CodemapUpdateResponse`](../interfaces/CodemapUpdateResponse.md)\>

Update codemap info (title, description, etc.)

##### Parameters

###### codemapId

`string`

###### data

[`UpdateCodemapData`](../interfaces/UpdateCodemapData.md)

###### projectPath?

`string`

##### Returns

`Promise`\<[`CodemapUpdateResponse`](../interfaces/CodemapUpdateResponse.md)\>

***

### codeutils

> **codeutils**: `object` = `cbcodeutils`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:144](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L144)

#### getAllFilesAsMarkDown()

> **getAllFilesAsMarkDown**: () => `Promise`\<`string`\>

Retrieves all files as Markdown.

##### Returns

`Promise`\<`string`\>

A promise that resolves with the Markdown content of all files.

#### getMatcherList()

> **getMatcherList**: () => `Promise`\<`GetMatcherListTreeResponse`\>

Retrieves the list of matchers.

##### Returns

`Promise`\<`GetMatcherListTreeResponse`\>

A promise that resolves with the list of matchers response.

#### matchDetail()

> **matchDetail**: (`matcher`) => `Promise`\<`getMatchDetail`\>

Retrieves details of a match.

##### Parameters

###### matcher

`string`

The matcher to retrieve details for (by name or identifier).

##### Returns

`Promise`\<`getMatchDetail`\>

A promise that resolves with the match detail response.

#### performMatch()

> **performMatch**: (`matcherDefinition`, `problemPatterns`, `problems`) => `Promise`\<`MatchProblemResponse`\>

Performs a matching operation based on the provided matcher definition and problem patterns.

##### Parameters

###### matcherDefinition

`object`

The definition of the matcher (name, pattern, language, etc.).

###### problemPatterns

`any`[]

The patterns to match against (regex patterns with severity levels).

###### problems

`any`[] = `[]`

Optional list of pre-existing problems to include.

##### Returns

`Promise`\<`MatchProblemResponse`\>

A promise that resolves with the matching problem response.

***

### contextAssembly

> **contextAssembly**: `object` = `cbcontextAssembly`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:188](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L188)

#### evaluateRules()

> **evaluateRules**: (`request`, `ruleEngineIds?`) => `Promise`\<[`RuleEvaluationResponse`](../interfaces/RuleEvaluationResponse.md)\>

Evaluate rules only without fetching memory content

##### Parameters

###### request

[`ContextAssemblyRequest`](../interfaces/ContextAssemblyRequest.md)

Context assembly request

###### ruleEngineIds?

`string`[]

Optional specific rule engine IDs to evaluate

##### Returns

`Promise`\<[`RuleEvaluationResponse`](../interfaces/RuleEvaluationResponse.md)\>

#### getContext()

> **getContext**: (`request`) => `Promise`\<[`ContextAssemblyResponse`](../interfaces/ContextAssemblyResponse.md)\>

Assemble context from various memory sources

##### Parameters

###### request

[`ContextAssemblyRequest`](../interfaces/ContextAssemblyRequest.md)

Context assembly request

##### Returns

`Promise`\<[`ContextAssemblyResponse`](../interfaces/ContextAssemblyResponse.md)\>

#### getRequiredVariables()

> **getRequiredVariables**: (`memoryNames`) => `Promise`\<[`RequiredVariablesResponse`](../interfaces/RequiredVariablesResponse.md)\>

Get required variables for specific memory types

##### Parameters

###### memoryNames

`string`[]

Array of memory type names

##### Returns

`Promise`\<[`RequiredVariablesResponse`](../interfaces/RequiredVariablesResponse.md)\>

#### listMemoryTypes()

> **listMemoryTypes**: () => `Promise`\<[`MemoryTypesResponse`](../interfaces/MemoryTypesResponse.md)\>

List available memory types

##### Returns

`Promise`\<[`MemoryTypesResponse`](../interfaces/MemoryTypesResponse.md)\>

#### validate()

> **validate**: (`request`) => `Promise`\<[`ContextValidateResponse`](../interfaces/ContextValidateResponse.md)\>

Validate a context assembly request

##### Parameters

###### request

[`ContextAssemblyRequest`](../interfaces/ContextAssemblyRequest.md)

Request to validate

##### Returns

`Promise`\<[`ContextValidateResponse`](../interfaces/ContextValidateResponse.md)\>

***

### contextRuleEngine

> **contextRuleEngine**: `object` = `cbcontextRuleEngine`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:189](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L189)

#### create()

> **create**: (`config`) => `Promise`\<[`ContextRuleEngineResponse`](../interfaces/ContextRuleEngineResponse.md)\>

Create a new rule engine

##### Parameters

###### config

[`CreateContextRuleEngineParams`](../interfaces/CreateContextRuleEngineParams.md)

Rule engine configuration

##### Returns

`Promise`\<[`ContextRuleEngineResponse`](../interfaces/ContextRuleEngineResponse.md)\>

#### delete()

> **delete**: (`id`) => `Promise`\<[`ContextRuleEngineDeleteResponse`](../interfaces/ContextRuleEngineDeleteResponse.md)\>

Delete a rule engine

##### Parameters

###### id

`string`

Rule engine ID

##### Returns

`Promise`\<[`ContextRuleEngineDeleteResponse`](../interfaces/ContextRuleEngineDeleteResponse.md)\>

#### evaluate()

> **evaluate**: (`params`) => `Promise`\<[`EvaluateRulesResponse`](../interfaces/EvaluateRulesResponse.md)\>

Evaluate rules against provided variables

##### Parameters

###### params

[`EvaluateRulesParams`](../interfaces/EvaluateRulesParams.md)

Evaluation parameters

##### Returns

`Promise`\<[`EvaluateRulesResponse`](../interfaces/EvaluateRulesResponse.md)\>

#### get()

> **get**: (`id`) => `Promise`\<[`ContextRuleEngineResponse`](../interfaces/ContextRuleEngineResponse.md)\>

Get a rule engine by ID

##### Parameters

###### id

`string`

Rule engine ID

##### Returns

`Promise`\<[`ContextRuleEngineResponse`](../interfaces/ContextRuleEngineResponse.md)\>

#### getPossibleVariables()

> **getPossibleVariables**: () => `Promise`\<[`PossibleVariablesResponse`](../interfaces/PossibleVariablesResponse.md)\>

Get all possible variables for UI configuration

##### Returns

`Promise`\<[`PossibleVariablesResponse`](../interfaces/PossibleVariablesResponse.md)\>

#### list()

> **list**: () => `Promise`\<[`ContextRuleEngineListResponse`](../interfaces/ContextRuleEngineListResponse.md)\>

List all rule engines

##### Returns

`Promise`\<[`ContextRuleEngineListResponse`](../interfaces/ContextRuleEngineListResponse.md)\>

#### update()

> **update**: (`id`, `updates`) => `Promise`\<[`ContextRuleEngineResponse`](../interfaces/ContextRuleEngineResponse.md)\>

Update a rule engine

##### Parameters

###### id

`string`

Rule engine ID

###### updates

[`UpdateContextRuleEngineParams`](../interfaces/UpdateContextRuleEngineParams.md)

Update parameters

##### Returns

`Promise`\<[`ContextRuleEngineResponse`](../interfaces/ContextRuleEngineResponse.md)\>

***

### crawler

> **crawler**: `object` = `cbcrawler`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:145](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L145)

#### click()

> **click**: (`id`) => `Promise`\<`any`\>

Simulates a click event on an element with the specified ID.

##### Parameters

###### id

`string`

The ID of the element to be clicked.

##### Returns

`Promise`\<`any`\>

A promise that resolves when the click action is complete.

#### goToPage()

> **goToPage**: (`url`) => `void`

Directs the crawler to navigate to a specified URL.

##### Parameters

###### url

`string`

The URL for the crawler to navigate to.

##### Returns

`void`

#### screenshot()

> **screenshot**: () => `void`

Takes a screenshot using the crawler.

##### Returns

`void`

#### scroll()

> **scroll**: (`direction`) => `void`

Scrolls the crawler in a specified direction.

##### Parameters

###### direction

`string`

The direction to scroll ('up', 'down', 'left', 'right').

##### Returns

`void`

#### start()

> **start**: () => `void`

Starts the crawler.

##### Returns

`void`

***

### dbmemory

> **dbmemory**: `object`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:151](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L151)

#### addKnowledge()

> **addKnowledge**: (`key`, `value`) => `Promise`\<`MemorySetResponse`\>

Adds a key-value pair to the in-memory database.

##### Parameters

###### key

`string`

The key under which to store the value.

###### value

`MemoryValue`

The value to be stored.

##### Returns

`Promise`\<`MemorySetResponse`\>

A promise that resolves with the response from the memory set event.

#### getKnowledge()

> **getKnowledge**: (`key`) => `Promise`\<`MemoryGetResponse`\>

Retrieves a value from the in-memory database by key.

##### Parameters

###### key

`string`

The key of the value to retrieve.

##### Returns

`Promise`\<`MemoryGetResponse`\>

A promise that resolves with the response from the memory get event.

***

### debug

> **debug**: `object`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:156](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L156)

#### debug()

> **debug**: (`log`, `type`) => `Promise`\<`DebugAddLogResponse`\>

Sends a log message to the debug websocket and waits for a response.

##### Parameters

###### log

`string`

The log message to send.

###### type

[`logType`](../enumerations/logType.md)

The type of the log message (info, error, warning).

##### Returns

`Promise`\<`DebugAddLogResponse`\>

A promise that resolves with the response from the debug event.

#### openDebugBrowser()

> **openDebugBrowser**: (`url`, `port`) => `Promise`\<`OpenDebugBrowserResponse`\>

Requests to open a debug browser at the specified URL and port.

##### Parameters

###### url

`string`

The URL where the debug browser should be opened.

###### port

`number`

The port on which the debug browser will listen.

##### Returns

`Promise`\<`OpenDebugBrowserResponse`\>

A promise that resolves with the response from the open debug browser event.

***

### episodicMemory

> **episodicMemory**: `object` = `cbepisodicMemory`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:174](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L174)

#### appendEvent()

> **appendEvent**: (`params`) => `Promise`\<[`IAppendEventResponse`](../interfaces/IAppendEventResponse.md)\>

Append an event to an episodic memory

##### Parameters

###### params

[`IAppendEventParams`](../interfaces/IAppendEventParams.md)

Event parameters including memoryId, event_type, emitting_agent_id, and payload

##### Returns

`Promise`\<[`IAppendEventResponse`](../interfaces/IAppendEventResponse.md)\>

Promise resolving to the created event

#### archiveMemory()

> **archiveMemory**: (`params`) => `Promise`\<[`IArchiveMemoryResponse`](../interfaces/IArchiveMemoryResponse.md)\>

Archive an episodic memory

##### Parameters

###### params

[`IArchiveMemoryParams`](../interfaces/IArchiveMemoryParams.md)

Parameters including memoryId

##### Returns

`Promise`\<[`IArchiveMemoryResponse`](../interfaces/IArchiveMemoryResponse.md)\>

Promise resolving to archive confirmation

#### createMemory()

> **createMemory**: (`params`) => `Promise`\<[`ICreateMemoryResponse`](../interfaces/ICreateMemoryResponse.md)\>

Create a new episodic memory

##### Parameters

###### params

[`ICreateMemoryParams`](../interfaces/ICreateMemoryParams.md)

Memory creation parameters (title)

##### Returns

`Promise`\<[`ICreateMemoryResponse`](../interfaces/ICreateMemoryResponse.md)\>

Promise resolving to the created memory

#### getAgents()

> **getAgents**: (`params`) => `Promise`\<[`IGetAgentsResponse`](../interfaces/IGetAgentsResponse.md)\>

Get unique agent IDs from an episodic memory

##### Parameters

###### params

[`IGetAgentsParams`](../interfaces/IGetAgentsParams.md)

Parameters including memoryId

##### Returns

`Promise`\<[`IGetAgentsResponse`](../interfaces/IGetAgentsResponse.md)\>

Promise resolving to list of unique agent IDs

#### getEventTypes()

> **getEventTypes**: (`params`) => `Promise`\<[`IGetEventTypesResponse`](../interfaces/IGetEventTypesResponse.md)\>

Get unique event types from an episodic memory

##### Parameters

###### params

[`IGetEventTypesParams`](../interfaces/IGetEventTypesParams.md)

Parameters including memoryId

##### Returns

`Promise`\<[`IGetEventTypesResponse`](../interfaces/IGetEventTypesResponse.md)\>

Promise resolving to list of unique event types

#### getMemory()

> **getMemory**: (`params`) => `Promise`\<[`IGetMemoryResponse`](../interfaces/IGetMemoryResponse.md)\>

Get a specific episodic memory by ID

##### Parameters

###### params

[`IGetMemoryParams`](../interfaces/IGetMemoryParams.md)

Parameters including memoryId

##### Returns

`Promise`\<[`IGetMemoryResponse`](../interfaces/IGetMemoryResponse.md)\>

Promise resolving to the memory

#### getTags()

> **getTags**: (`params`) => `Promise`\<[`IGetTagsResponse`](../interfaces/IGetTagsResponse.md)\>

Get unique tags from an episodic memory

##### Parameters

###### params

[`IGetTagsParams`](../interfaces/IGetTagsParams.md)

Parameters including memoryId

##### Returns

`Promise`\<[`IGetTagsResponse`](../interfaces/IGetTagsResponse.md)\>

Promise resolving to list of unique tags

#### listMemories()

> **listMemories**: () => `Promise`\<[`IListMemoriesResponse`](../interfaces/IListMemoriesResponse.md)\>

List all episodic memories

##### Returns

`Promise`\<[`IListMemoriesResponse`](../interfaces/IListMemoriesResponse.md)\>

Promise resolving to list of memories

#### queryEvents()

> **queryEvents**: (`params`) => `Promise`\<[`IQueryEventsResponse`](../interfaces/IQueryEventsResponse.md)\>

Query events from an episodic memory with optional filters

##### Parameters

###### params

[`IQueryEventsParams`](../interfaces/IQueryEventsParams.md)

Query parameters including memoryId and optional filters

##### Returns

`Promise`\<[`IQueryEventsResponse`](../interfaces/IQueryEventsResponse.md)\>

Promise resolving to filtered events

#### unarchiveMemory()

> **unarchiveMemory**: (`params`) => `Promise`\<[`IUnarchiveMemoryResponse`](../interfaces/IUnarchiveMemoryResponse.md)\>

Unarchive an episodic memory

##### Parameters

###### params

[`IUnarchiveMemoryParams`](../interfaces/IUnarchiveMemoryParams.md)

Parameters including memoryId

##### Returns

`Promise`\<[`IUnarchiveMemoryResponse`](../interfaces/IUnarchiveMemoryResponse.md)\>

Promise resolving to unarchive confirmation

#### updateTitle()

> **updateTitle**: (`params`) => `Promise`\<[`IUpdateTitleResponse`](../interfaces/IUpdateTitleResponse.md)\>

Update the title of an episodic memory

##### Parameters

###### params

[`IUpdateTitleParams`](../interfaces/IUpdateTitleParams.md)

Parameters including memoryId and new title

##### Returns

`Promise`\<[`IUpdateTitleResponse`](../interfaces/IUpdateTitleResponse.md)\>

Promise resolving to update confirmation

***

### eventLog

> **eventLog**: `object` = `cbeventLog`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:184](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L184)

#### appendEvent()

> **appendEvent**: (`params`) => `Promise`\<[`EventLogAppendResponse`](../interfaces/EventLogAppendResponse.md)\>

Append a single event to the log

##### Parameters

###### params

[`AppendEventParams`](../interfaces/AppendEventParams.md)

Event parameters

##### Returns

`Promise`\<[`EventLogAppendResponse`](../interfaces/EventLogAppendResponse.md)\>

#### appendEvents()

> **appendEvents**: (`params`) => `Promise`\<[`EventLogAppendMultipleResponse`](../interfaces/EventLogAppendMultipleResponse.md)\>

Append multiple events to the log

##### Parameters

###### params

[`AppendEventsParams`](../interfaces/AppendEventsParams.md)

Events parameters

##### Returns

`Promise`\<[`EventLogAppendMultipleResponse`](../interfaces/EventLogAppendMultipleResponse.md)\>

#### createInstance()

> **createInstance**: (`name`, `description?`) => `Promise`\<[`EventLogInstanceResponse`](../interfaces/EventLogInstanceResponse.md)\>

Create a new event log instance

##### Parameters

###### name

`string`

Instance name

###### description?

`string`

Optional description

##### Returns

`Promise`\<[`EventLogInstanceResponse`](../interfaces/EventLogInstanceResponse.md)\>

#### deleteInstance()

> **deleteInstance**: (`instanceId`) => `Promise`\<[`EventLogInstanceResponse`](../interfaces/EventLogInstanceResponse.md)\>

Delete an event log instance

##### Parameters

###### instanceId

`string`

Instance ID

##### Returns

`Promise`\<[`EventLogInstanceResponse`](../interfaces/EventLogInstanceResponse.md)\>

#### getInstance()

> **getInstance**: (`instanceId`) => `Promise`\<[`EventLogInstanceResponse`](../interfaces/EventLogInstanceResponse.md)\>

Get an event log instance by ID

##### Parameters

###### instanceId

`string`

Instance ID

##### Returns

`Promise`\<[`EventLogInstanceResponse`](../interfaces/EventLogInstanceResponse.md)\>

#### getInstanceStats()

> **getInstanceStats**: (`instanceId`) => `Promise`\<[`EventLogStatsResponse`](../interfaces/EventLogStatsResponse.md)\>

Get instance statistics

##### Parameters

###### instanceId

`string`

Instance ID

##### Returns

`Promise`\<[`EventLogStatsResponse`](../interfaces/EventLogStatsResponse.md)\>

#### listInstances()

> **listInstances**: () => `Promise`\<[`EventLogInstanceListResponse`](../interfaces/EventLogInstanceListResponse.md)\>

List all event log instances

##### Returns

`Promise`\<[`EventLogInstanceListResponse`](../interfaces/EventLogInstanceListResponse.md)\>

#### queryEvents()

> **queryEvents**: (`query`) => `Promise`\<[`EventLogQueryResponse`](../interfaces/EventLogQueryResponse.md)\>

Query events using DSL

##### Parameters

###### query

[`EventLogDSL`](../interfaces/EventLogDSL.md)

Query DSL object

##### Returns

`Promise`\<[`EventLogQueryResponse`](../interfaces/EventLogQueryResponse.md)\>

#### updateInstance()

> **updateInstance**: (`instanceId`, `updates`) => `Promise`\<[`EventLogInstanceResponse`](../interfaces/EventLogInstanceResponse.md)\>

Update an event log instance

##### Parameters

###### instanceId

`string`

Instance ID

###### updates

[`UpdateEventLogInstanceParams`](../interfaces/UpdateEventLogInstanceParams.md)

Update parameters

##### Returns

`Promise`\<[`EventLogInstanceResponse`](../interfaces/EventLogInstanceResponse.md)\>

***

### fileUpdateIntent

> **fileUpdateIntent**: `object` = `cbfileUpdateIntent`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:179](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L179)

#### cancel()

> **cancel**: (`id`, `cancelledBy`) => `Promise`\<[`FileUpdateIntent`](../interfaces/FileUpdateIntent.md)\>

Cancel an intent

##### Parameters

###### id

`string`

###### cancelledBy

`string`

##### Returns

`Promise`\<[`FileUpdateIntent`](../interfaces/FileUpdateIntent.md)\>

#### checkOverlap()

> **checkOverlap**: (`environmentId`, `filePaths`, `priority`) => `Promise`\<[`IntentOverlapResult`](../interfaces/IntentOverlapResult.md)\>

Check for overlap without creating

##### Parameters

###### environmentId

`string`

###### filePaths

`string`[]

###### priority

`number` = `5`

##### Returns

`Promise`\<[`IntentOverlapResult`](../interfaces/IntentOverlapResult.md)\>

#### complete()

> **complete**: (`id`, `closedBy`) => `Promise`\<[`FileUpdateIntent`](../interfaces/FileUpdateIntent.md)\>

Complete an intent

##### Parameters

###### id

`string`

###### closedBy

`string`

##### Returns

`Promise`\<[`FileUpdateIntent`](../interfaces/FileUpdateIntent.md)\>

#### create()

> **create**: (`data`, `claimedBy`, `claimedByName?`) => `Promise`\<\{ `intent?`: [`FileUpdateIntent`](../interfaces/FileUpdateIntent.md); `overlap?`: [`IntentOverlapResult`](../interfaces/IntentOverlapResult.md); \}\>

Create a new file update intent

##### Parameters

###### data

[`CreateFileUpdateIntentRequest`](../interfaces/CreateFileUpdateIntentRequest.md)

###### claimedBy

`string`

###### claimedByName?

`string`

##### Returns

`Promise`\<\{ `intent?`: [`FileUpdateIntent`](../interfaces/FileUpdateIntent.md); `overlap?`: [`IntentOverlapResult`](../interfaces/IntentOverlapResult.md); \}\>

#### delete()

> **delete**: (`id`) => `Promise`\<\{ `success`: `boolean`; \}\>

Delete an intent

##### Parameters

###### id

`string`

##### Returns

`Promise`\<\{ `success`: `boolean`; \}\>

#### get()

> **get**: (`id`) => `Promise`\<[`FileUpdateIntent`](../interfaces/FileUpdateIntent.md)\>

Get a single intent

##### Parameters

###### id

`string`

##### Returns

`Promise`\<[`FileUpdateIntent`](../interfaces/FileUpdateIntent.md)\>

#### getBlockedFiles()

> **getBlockedFiles**: (`environmentId`) => `Promise`\<\{ `blockedFiles`: `string`[]; \}\>

Get blocked files (level 4 locks)

##### Parameters

###### environmentId

`string`

##### Returns

`Promise`\<\{ `blockedFiles`: `string`[]; \}\>

#### getByAgent()

> **getByAgent**: (`agentId`) => `Promise`\<[`FileUpdateIntent`](../interfaces/FileUpdateIntent.md)[]\>

Get intents by agent

##### Parameters

###### agentId

`string`

##### Returns

`Promise`\<[`FileUpdateIntent`](../interfaces/FileUpdateIntent.md)[]\>

#### getFilesWithIntents()

> **getFilesWithIntents**: (`environmentId`) => `Promise`\<`FileWithIntent`[]\>

Get all files with intents

##### Parameters

###### environmentId

`string`

##### Returns

`Promise`\<`FileWithIntent`[]\>

#### list()

> **list**: (`filters`) => `Promise`\<[`FileUpdateIntent`](../interfaces/FileUpdateIntent.md)[]\>

List intents

##### Parameters

###### filters

[`FileUpdateIntentFilters`](../interfaces/FileUpdateIntentFilters.md) = `{}`

##### Returns

`Promise`\<[`FileUpdateIntent`](../interfaces/FileUpdateIntent.md)[]\>

#### update()

> **update**: (`id`, `data`) => `Promise`\<[`FileUpdateIntent`](../interfaces/FileUpdateIntent.md)\>

Update an existing intent

##### Parameters

###### id

`string`

###### data

[`UpdateFileUpdateIntentRequest`](../interfaces/UpdateFileUpdateIntentRequest.md)

##### Returns

`Promise`\<[`FileUpdateIntent`](../interfaces/FileUpdateIntent.md)\>

***

### fs

> **fs**: `object` = `cbfs`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:135](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L135)

#### createFile()

> **createFile**: (`fileName`, `source`, `filePath`) => `Promise`\<`CreateFileResponse`\>

**`Function`**

createFile

##### Parameters

###### fileName

`string`

The name of the file to create.

###### source

`string`

The source content to write into the file.

###### filePath

`string`

The path where the file should be created.

##### Returns

`Promise`\<`CreateFileResponse`\>

A promise that resolves with the server response.

##### Description

Creates a new file.

#### createFolder()

> **createFolder**: (`folderName`, `folderPath`) => `Promise`\<`CreateFolderResponse`\>

**`Function`**

createFolder

##### Parameters

###### folderName

`string`

The name of the folder to create.

###### folderPath

`string`

The path where the folder should be created.

##### Returns

`Promise`\<`CreateFolderResponse`\>

A promise that resolves with the server response.

##### Description

Creates a new folder.

#### deleteFile()

> **deleteFile**: (`filename`, `filePath`) => `Promise`\<`DeleteFileResponse`\>

**`Function`**

deleteFile

##### Parameters

###### filename

`string`

The name of the file to delete.

###### filePath

`string`

The path of the file to delete.

##### Returns

`Promise`\<`DeleteFileResponse`\>

A promise that resolves with the server response.

##### Description

Deletes a file.

#### deleteFolder()

> **deleteFolder**: (`foldername`, `folderpath`) => `Promise`\<`DeleteFolderResponse`\>

**`Function`**

deleteFolder

##### Parameters

###### foldername

`string`

The name of the folder to delete.

###### folderpath

`string`

The path of the folder to delete.

##### Returns

`Promise`\<`DeleteFolderResponse`\>

A promise that resolves with the server response.

##### Description

Deletes a folder.

#### editFileWithDiff()

> **editFileWithDiff**: (`targetFile`, `codeEdit`, `diffIdentifier`, `prompt`, `applyModel?`) => `Promise`\<`EditFileAndApplyDiffResponse`\>

**`Function`**

editFileWithDiff

##### Parameters

###### targetFile

`string`

The target file to edit.

###### codeEdit

`string`

The code edit to apply.

###### diffIdentifier

`string`

The diff identifier.

###### prompt

`string`

The prompt for the edit.

###### applyModel?

`string`

The model to apply the edit with.

##### Returns

`Promise`\<`EditFileAndApplyDiffResponse`\>

A promise that resolves with the edit result.

##### Description

Edits a file by applying a diff.

#### fileSearch()

> **fileSearch**: (`query`) => `Promise`\<`FileSearchResponse`\>

**`Function`**

fileSearch

##### Parameters

###### query

`string`

The query to search for.

##### Returns

`Promise`\<`FileSearchResponse`\>

A promise that resolves with the search results.

##### Description

Performs a fuzzy search for files.

#### grepSearch()

> **grepSearch**: (`path`, `query`, `includePattern?`, `excludePattern?`, `caseSensitive`) => `Promise`\<`GrepSearchResponse`\>

**`Function`**

grepSearch

##### Parameters

###### path

`string`

The path to search within.

###### query

`string`

The query to search for.

###### includePattern?

`string`

Pattern of files to include.

###### excludePattern?

`string`

Pattern of files to exclude.

###### caseSensitive?

`boolean` = `true`

Whether the search is case sensitive.

##### Returns

`Promise`\<`GrepSearchResponse`\>

A promise that resolves with the search results.

##### Description

Performs a grep search in files.

#### listCodeDefinitionNames()

> **listCodeDefinitionNames**: (`path`) => `Promise`\<`ListCodeDefinitionsResponse`\>

**`Function`**

listCodeDefinitionNames

##### Parameters

###### path

`string`

The path to search for code definitions.

##### Returns

`Promise`\<`ListCodeDefinitionsResponse`\>

A promise that resolves with the list of code definition names.

##### Description

Lists all code definition names in a given path.

#### listDirectory()

> **listDirectory**: (`params`) => `Promise`\<`ListDirectoryResponse`\>

**`Function`**

listDirectory

##### Parameters

###### params

###### detailed?

`boolean`

###### ignore?

`string`[]

###### limit?

`number`

###### notifyUser?

`boolean`

###### path

`string`

###### show_hidden?

`boolean`

##### Returns

`Promise`\<`ListDirectoryResponse`\>

A promise that resolves with the directory listing result.

##### Description

Lists directory contents using advanced directory listing tool.

#### listFile()

> **listFile**: (`folderPath`, `isRecursive`) => `Promise`\<`FileListResponse`\>

**`Function`**

listFile

##### Parameters

###### folderPath

`string`

###### isRecursive

`boolean` = `false`

##### Returns

`Promise`\<`FileListResponse`\>

A promise that resolves with the list of files.

##### Description

Lists all files.

#### readFile()

> **readFile**: (`filePath`) => `Promise`\<`ReadFileResponse`\>

**`Function`**

readFile

##### Parameters

###### filePath

`string`

The path of the file to read.

##### Returns

`Promise`\<`ReadFileResponse`\>

A promise that resolves with the server response.

##### Description

Reads the content of a file.

#### readManyFiles()

> **readManyFiles**: (`params`) => `Promise`\<`ReadManyFilesResponse`\>

**`Function`**

readManyFiles

##### Parameters

###### params

###### exclude?

`string`[]

###### include?

`string`[]

###### include_metadata?

`boolean`

###### max_files?

`number`

###### max_total_size?

`number`

###### notifyUser?

`boolean`

###### paths

`string`[]

###### recursive?

`boolean`

###### separator_format?

`string`

###### use_default_excludes?

`boolean`

##### Returns

`Promise`\<`ReadManyFilesResponse`\>

A promise that resolves with the read operation result.

##### Description

Reads multiple files based on paths, patterns, or glob expressions.

#### searchFiles()

> **searchFiles**: (`path`, `regex`, `filePattern`) => `Promise`\<`SearchFilesResponse`\>

**`Function`**

searchFiles

##### Parameters

###### path

`string`

The path to search within.

###### regex

`string`

The regex pattern to search for.

###### filePattern

`string`

The file pattern to match files.

##### Returns

`Promise`\<`SearchFilesResponse`\>

A promise that resolves with the search results.

##### Description

Searches files in a given path using a regex pattern.

#### updateFile()

> **updateFile**: (`filename`, `filePath`, `newContent`) => `Promise`\<`UpdateFileResponse`\>

**`Function`**

updateFile

##### Parameters

###### filename

`string`

The name of the file to update.

###### filePath

`string`

The path of the file to update.

###### newContent

`string`

The new content to write into the file.

##### Returns

`Promise`\<`UpdateFileResponse`\>

A promise that resolves with the server response.

##### Description

Updates the content of a file.

#### writeToFile()

> **writeToFile**: (`relPath`, `newContent`) => `Promise`\<`any`\>

**`Function`**

writeToFile

##### Parameters

###### relPath

`string`

The relative path of the file to write to.

###### newContent

`string`

The new content to write into the file.

##### Returns

`Promise`\<`any`\>

A promise that resolves with the write operation result.

##### Description

Writes content to a file.

***

### git

> **git**: `object`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:136](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L136)

#### addAll()

> **addAll**: () => `Promise`\<`AddResponse`\>

Adds changes in the local repository to the staging area at the given path.

##### Returns

`Promise`\<`AddResponse`\>

A promise that resolves with the response from the add event.

#### branch()

> **branch**: (`branch`) => `Promise`\<`GitBranchResponse`\>

Creates a new branch in the local repository at the given path.

##### Parameters

###### branch

`string`

The name of the new branch to create.

##### Returns

`Promise`\<`GitBranchResponse`\>

A promise that resolves with the response from the branch event.

#### checkout()

> **checkout**: (`branch`) => `Promise`\<`GitCheckoutResponse`\>

Checks out a branch or commit in the local repository at the given path.

##### Parameters

###### branch

`string`

The name of the branch or commit to check out.

##### Returns

`Promise`\<`GitCheckoutResponse`\>

A promise that resolves with the response from the checkout event.

#### clone()

> **clone**: (`url`, `path?`) => `Promise`\<`GitCloneResponse`\>

Clones a remote Git repository to the specified path.

##### Parameters

###### url

`string`

The URL of the remote repository to clone.

###### path?

`string`

The file system path where the repository should be cloned.

##### Returns

`Promise`\<`GitCloneResponse`\>

A promise that resolves with the response from the clone event.

#### commit()

> **commit**: (`message`) => `Promise`\<`GitCommitResponse`\>

Commits the staged changes in the local repository with the given commit message.

##### Parameters

###### message

`string`

The commit message to use for the commit.

##### Returns

`Promise`\<`GitCommitResponse`\>

A promise that resolves with the response from the commit event.

#### diff()

> **diff**: (`commitHash`) => `Promise`\<`GitDiffResponse`\>

Retrieves the diff of changes for a specific commit in the local repository.

##### Parameters

###### commitHash

`string`

The hash of the commit to retrieve the diff for.

##### Returns

`Promise`\<`GitDiffResponse`\>

A promise that resolves with the response from the diff event.

#### init()

> **init**: (`path`) => `Promise`\<`GitInitResponse`\>

Initializes a new Git repository at the given path.

##### Parameters

###### path

`string`

The file system path where the Git repository should be initialized.

##### Returns

`Promise`\<`GitInitResponse`\>

A promise that resolves with the response from the init event.

#### logs()

> **logs**: (`path`) => `Promise`\<`GitLogsResponse`\>

Retrieves the commit logs for the local repository at the given path.

##### Parameters

###### path

`string`

The file system path of the local Git repository.

##### Returns

`Promise`\<`GitLogsResponse`\>

A promise that resolves with the response from the logs event.

#### pull()

> **pull**: () => `Promise`\<`GitPullResponse`\>

Pulls the latest changes from the remote repository to the local repository at the given path.

##### Returns

`Promise`\<`GitPullResponse`\>

A promise that resolves with the response from the pull event.

#### push()

> **push**: () => `Promise`\<`GitPushResponse`\>

Pushes local repository changes to the remote repository at the given path.

##### Returns

`Promise`\<`GitPushResponse`\>

A promise that resolves with the response from the push event.

#### status()

> **status**: () => `Promise`\<`GitStatusResponse`\>

Retrieves the status of the local repository at the given path.

##### Returns

`Promise`\<`GitStatusResponse`\>

A promise that resolves with the response from the status event.

***

### groupFeedback

> **groupFeedback**: `object` = `cbgroupFeedback`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:139](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L139)

#### create()

> **create**: (`params`) => `Promise`\<[`ICreateFeedbackResponse`](../interfaces/ICreateFeedbackResponse.md)\>

##### Parameters

###### params

[`ICreateFeedbackParams`](../interfaces/ICreateFeedbackParams.md)

##### Returns

`Promise`\<[`ICreateFeedbackResponse`](../interfaces/ICreateFeedbackResponse.md)\>

#### get()

> **get**: (`params`) => `Promise`\<[`IGetFeedbackResponse`](../interfaces/IGetFeedbackResponse.md)\>

##### Parameters

###### params

[`IGetFeedbackParams`](../interfaces/IGetFeedbackParams.md)

##### Returns

`Promise`\<[`IGetFeedbackResponse`](../interfaces/IGetFeedbackResponse.md)\>

#### list()

> **list**: (`params?`) => `Promise`\<[`IListFeedbacksResponse`](../interfaces/IListFeedbacksResponse.md)\>

##### Parameters

###### params?

[`IListFeedbacksParams`](../interfaces/IListFeedbacksParams.md)

##### Returns

`Promise`\<[`IListFeedbacksResponse`](../interfaces/IListFeedbacksResponse.md)\>

#### reply()

> **reply**: (`params`) => `Promise`\<[`IReplyResponse`](../interfaces/IReplyResponse.md)\>

##### Parameters

###### params

[`IReplyParams`](../interfaces/IReplyParams.md)

##### Returns

`Promise`\<[`IReplyResponse`](../interfaces/IReplyResponse.md)\>

#### respond()

> **respond**: (`params`) => `Promise`\<[`IRespondResponse`](../interfaces/IRespondResponse.md)\>

##### Parameters

###### params

[`IRespondParams`](../interfaces/IRespondParams.md)

##### Returns

`Promise`\<[`IRespondResponse`](../interfaces/IRespondResponse.md)\>

#### updateStatus()

> **updateStatus**: (`params`) => `Promise`\<[`IUpdateStatusResponse`](../interfaces/IUpdateStatusResponse.md)\>

##### Parameters

###### params

[`IUpdateStatusParams`](../interfaces/IUpdateStatusParams.md)

##### Returns

`Promise`\<[`IUpdateStatusResponse`](../interfaces/IUpdateStatusResponse.md)\>

#### updateSummary()

> **updateSummary**: (`params`) => `Promise`\<[`IUpdateSummaryResponse`](../interfaces/IUpdateSummaryResponse.md)\>

##### Parameters

###### params

[`IUpdateSummaryParams`](../interfaces/IUpdateSummaryParams.md)

##### Returns

`Promise`\<[`IUpdateSummaryResponse`](../interfaces/IUpdateSummaryResponse.md)\>

***

### hook

> **hook**: `object` = `cbhook`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:186](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L186)

#### create()

> **create**: (`config`) => `Promise`\<[`HookResponse`](../interfaces/HookResponse.md)\>

Create a new hook

##### Parameters

###### config

[`HookConfig`](../interfaces/HookConfig.md)

Hook configuration

##### Returns

`Promise`\<[`HookResponse`](../interfaces/HookResponse.md)\>

#### delete()

> **delete**: (`hookId`) => `Promise`\<[`HookDeleteResponse`](../interfaces/HookDeleteResponse.md)\>

Delete a hook

##### Parameters

###### hookId

`string`

Hook ID

##### Returns

`Promise`\<[`HookDeleteResponse`](../interfaces/HookDeleteResponse.md)\>

#### disable()

> **disable**: (`hookId`) => `Promise`\<[`HookResponse`](../interfaces/HookResponse.md)\>

Disable a hook

##### Parameters

###### hookId

`string`

Hook ID

##### Returns

`Promise`\<[`HookResponse`](../interfaces/HookResponse.md)\>

#### enable()

> **enable**: (`hookId`) => `Promise`\<[`HookResponse`](../interfaces/HookResponse.md)\>

Enable a hook

##### Parameters

###### hookId

`string`

Hook ID

##### Returns

`Promise`\<[`HookResponse`](../interfaces/HookResponse.md)\>

#### get()

> **get**: (`hookId`) => `Promise`\<[`HookResponse`](../interfaces/HookResponse.md)\>

Get a hook by ID

##### Parameters

###### hookId

`string`

Hook ID

##### Returns

`Promise`\<[`HookResponse`](../interfaces/HookResponse.md)\>

#### initialize()

> **initialize**: (`projectPath`) => `Promise`\<[`HookInitializeResponse`](../interfaces/HookInitializeResponse.md)\>

Initialize the hook manager for a project

##### Parameters

###### projectPath

`string`

Path to the project

##### Returns

`Promise`\<[`HookInitializeResponse`](../interfaces/HookInitializeResponse.md)\>

#### list()

> **list**: () => `Promise`\<[`HookListResponse`](../interfaces/HookListResponse.md)\>

List all hooks

##### Returns

`Promise`\<[`HookListResponse`](../interfaces/HookListResponse.md)\>

#### update()

> **update**: (`hookId`, `config`) => `Promise`\<[`HookResponse`](../interfaces/HookResponse.md)\>

Update an existing hook

##### Parameters

###### hookId

`string`

Hook ID

###### config

`Partial`\<[`HookConfig`](../interfaces/HookConfig.md)\>

Updated hook configuration

##### Returns

`Promise`\<[`HookResponse`](../interfaces/HookResponse.md)\>

***

### isReady

> `private` **isReady**: `boolean` = `false`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:73](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L73)

***

### job

> **job**: `object`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:168](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L168)

#### acceptBid()

> **acceptBid**: (`jobId`, `bidId`) => `Promise`\<[`JobBidAcceptResponse`](../interfaces/JobBidAcceptResponse.md)\>

##### Parameters

###### jobId

`string`

###### bidId

`string`

##### Returns

`Promise`\<[`JobBidAcceptResponse`](../interfaces/JobBidAcceptResponse.md)\>

#### acceptSplitProposal()

> **acceptSplitProposal**: (`jobId`, `proposalId`) => `Promise`\<[`JobSplitAcceptResponse`](../interfaces/JobSplitAcceptResponse.md)\>

##### Parameters

###### jobId

`string`

###### proposalId

`string`

##### Returns

`Promise`\<[`JobSplitAcceptResponse`](../interfaces/JobSplitAcceptResponse.md)\>

#### addBid()

> **addBid**: (`jobId`, `bid`) => `Promise`\<[`JobBidAddResponse`](../interfaces/JobBidAddResponse.md)\>

##### Parameters

###### jobId

`string`

###### bid

[`AddBidData`](../interfaces/AddBidData.md)

##### Returns

`Promise`\<[`JobBidAddResponse`](../interfaces/JobBidAddResponse.md)\>

#### addBlocker()

> **addBlocker**: (`jobId`, `blocker`) => `Promise`\<[`JobBlockerAddResponse`](../interfaces/JobBlockerAddResponse.md)\>

##### Parameters

###### jobId

`string`

###### blocker

[`AddBlockerData`](../interfaces/AddBlockerData.md)

##### Returns

`Promise`\<[`JobBlockerAddResponse`](../interfaces/JobBlockerAddResponse.md)\>

#### addDependency()

> **addDependency**: (`jobId`, `targetId`, `type?`) => `Promise`\<[`JobDependencyResponse`](../interfaces/JobDependencyResponse.md)\>

##### Parameters

###### jobId

`string`

###### targetId

`string`

###### type?

[`DependencyType`](../type-aliases/DependencyType.md)

##### Returns

`Promise`\<[`JobDependencyResponse`](../interfaces/JobDependencyResponse.md)\>

#### addLabel()

> **addLabel**: (`label`) => `Promise`\<[`JobLabelsResponse`](../interfaces/JobLabelsResponse.md)\>

##### Parameters

###### label

`string`

##### Returns

`Promise`\<[`JobLabelsResponse`](../interfaces/JobLabelsResponse.md)\>

#### addPheromoneType()

> **addPheromoneType**: (`data`) => `Promise`\<[`JobPheromoneTypeResponse`](../interfaces/JobPheromoneTypeResponse.md)\>

##### Parameters

###### data

[`AddPheromoneTypeData`](../interfaces/AddPheromoneTypeData.md)

##### Returns

`Promise`\<[`JobPheromoneTypeResponse`](../interfaces/JobPheromoneTypeResponse.md)\>

#### addSplitProposal()

> **addSplitProposal**: (`jobId`, `proposal`) => `Promise`\<[`JobSplitProposeResponse`](../interfaces/JobSplitProposeResponse.md)\>

##### Parameters

###### jobId

`string`

###### proposal

[`AddSplitProposalData`](../interfaces/AddSplitProposalData.md)

##### Returns

`Promise`\<[`JobSplitProposeResponse`](../interfaces/JobSplitProposeResponse.md)\>

#### addUnlockRequest()

> **addUnlockRequest**: (`jobId`, `request`) => `Promise`\<[`JobUnlockRequestAddResponse`](../interfaces/JobUnlockRequestAddResponse.md)\>

##### Parameters

###### jobId

`string`

###### request

[`AddUnlockRequestData`](../interfaces/AddUnlockRequestData.md)

##### Returns

`Promise`\<[`JobUnlockRequestAddResponse`](../interfaces/JobUnlockRequestAddResponse.md)\>

#### approveUnlockRequest()

> **approveUnlockRequest**: (`jobId`, `unlockRequestId`, `respondedBy`) => `Promise`\<[`JobUnlockRequestApproveResponse`](../interfaces/JobUnlockRequestApproveResponse.md)\>

##### Parameters

###### jobId

`string`

###### unlockRequestId

`string`

###### respondedBy

`string`

##### Returns

`Promise`\<[`JobUnlockRequestApproveResponse`](../interfaces/JobUnlockRequestApproveResponse.md)\>

#### createJob()

> **createJob**: (`groupId`, `data`) => `Promise`\<[`JobCreateResponse`](../interfaces/JobCreateResponse.md)\>

##### Parameters

###### groupId

`string`

###### data

[`CreateJobData`](../interfaces/CreateJobData.md)

##### Returns

`Promise`\<[`JobCreateResponse`](../interfaces/JobCreateResponse.md)\>

#### createJobGroup()

> **createJobGroup**: (`data`) => `Promise`\<[`JobGroupCreateResponse`](../interfaces/JobGroupCreateResponse.md)\>

##### Parameters

###### data

[`CreateJobGroupData`](../interfaces/CreateJobGroupData.md)

##### Returns

`Promise`\<[`JobGroupCreateResponse`](../interfaces/JobGroupCreateResponse.md)\>

#### deleteJob()

> **deleteJob**: (`jobId`) => `Promise`\<[`JobDeleteResponse`](../interfaces/JobDeleteResponse.md)\>

##### Parameters

###### jobId

`string`

##### Returns

`Promise`\<[`JobDeleteResponse`](../interfaces/JobDeleteResponse.md)\>

#### deleteJobs()

> **deleteJobs**: (`jobIds`) => `Promise`\<[`JobDeleteBulkResponse`](../interfaces/JobDeleteBulkResponse.md)\>

##### Parameters

###### jobIds

`string`[]

##### Returns

`Promise`\<[`JobDeleteBulkResponse`](../interfaces/JobDeleteBulkResponse.md)\>

#### deleteSplitProposal()

> **deleteSplitProposal**: (`jobId`, `proposalId`) => `Promise`\<[`JobSplitDeleteResponse`](../interfaces/JobSplitDeleteResponse.md)\>

##### Parameters

###### jobId

`string`

###### proposalId

`string`

##### Returns

`Promise`\<[`JobSplitDeleteResponse`](../interfaces/JobSplitDeleteResponse.md)\>

#### deleteUnlockRequest()

> **deleteUnlockRequest**: (`jobId`, `unlockRequestId`) => `Promise`\<[`JobUnlockRequestDeleteResponse`](../interfaces/JobUnlockRequestDeleteResponse.md)\>

##### Parameters

###### jobId

`string`

###### unlockRequestId

`string`

##### Returns

`Promise`\<[`JobUnlockRequestDeleteResponse`](../interfaces/JobUnlockRequestDeleteResponse.md)\>

#### depositPheromone()

> **depositPheromone**: (`jobId`, `deposit`) => `Promise`\<[`JobPheromoneDepositResponse`](../interfaces/JobPheromoneDepositResponse.md)\>

##### Parameters

###### jobId

`string`

###### deposit

[`DepositPheromoneData`](../interfaces/DepositPheromoneData.md)

##### Returns

`Promise`\<[`JobPheromoneDepositResponse`](../interfaces/JobPheromoneDepositResponse.md)\>

#### getBlockedJobs()

> **getBlockedJobs**: (`filters`) => `Promise`\<[`JobReadyBlockedResponse`](../interfaces/JobReadyBlockedResponse.md)\>

##### Parameters

###### filters

[`JobListFilters`](../interfaces/JobListFilters.md) = `{}`

##### Returns

`Promise`\<[`JobReadyBlockedResponse`](../interfaces/JobReadyBlockedResponse.md)\>

#### getJob()

> **getJob**: (`jobId`) => `Promise`\<[`JobShowResponse`](../interfaces/JobShowResponse.md)\>

##### Parameters

###### jobId

`string`

##### Returns

`Promise`\<[`JobShowResponse`](../interfaces/JobShowResponse.md)\>

#### getPheromones()

> **getPheromones**: (`jobId`) => `Promise`\<[`JobPheromoneListResponse`](../interfaces/JobPheromoneListResponse.md)\>

##### Parameters

###### jobId

`string`

##### Returns

`Promise`\<[`JobPheromoneListResponse`](../interfaces/JobPheromoneListResponse.md)\>

#### getPheromonesAggregated()

> **getPheromonesAggregated**: (`jobId`) => `Promise`\<[`JobPheromoneAggregatedResponse`](../interfaces/JobPheromoneAggregatedResponse.md)\>

##### Parameters

###### jobId

`string`

##### Returns

`Promise`\<[`JobPheromoneAggregatedResponse`](../interfaces/JobPheromoneAggregatedResponse.md)\>

#### getPheromonesAggregatedWithDecay()

> **getPheromonesAggregatedWithDecay**: (`jobId`) => `Promise`\<[`JobPheromoneAggregatedResponse`](../interfaces/JobPheromoneAggregatedResponse.md)\>

##### Parameters

###### jobId

`string`

##### Returns

`Promise`\<[`JobPheromoneAggregatedResponse`](../interfaces/JobPheromoneAggregatedResponse.md)\>

#### getPheromonesWithDecay()

> **getPheromonesWithDecay**: (`jobId`) => `Promise`\<[`JobPheromoneListResponse`](../interfaces/JobPheromoneListResponse.md)\>

##### Parameters

###### jobId

`string`

##### Returns

`Promise`\<[`JobPheromoneListResponse`](../interfaces/JobPheromoneListResponse.md)\>

#### getPheromoneTypes()

> **getPheromoneTypes**: () => `Promise`\<[`JobPheromoneTypesResponse`](../interfaces/JobPheromoneTypesResponse.md)\>

##### Returns

`Promise`\<[`JobPheromoneTypesResponse`](../interfaces/JobPheromoneTypesResponse.md)\>

#### getReadyJobs()

> **getReadyJobs**: (`filters`) => `Promise`\<[`JobReadyBlockedResponse`](../interfaces/JobReadyBlockedResponse.md)\>

##### Parameters

###### filters

[`JobListFilters`](../interfaces/JobListFilters.md) = `{}`

##### Returns

`Promise`\<[`JobReadyBlockedResponse`](../interfaces/JobReadyBlockedResponse.md)\>

#### isJobLocked()

> **isJobLocked**: (`jobId`) => `Promise`\<[`JobLockCheckResponse`](../interfaces/JobLockCheckResponse.md)\>

##### Parameters

###### jobId

`string`

##### Returns

`Promise`\<[`JobLockCheckResponse`](../interfaces/JobLockCheckResponse.md)\>

#### listBids()

> **listBids**: (`jobId`) => `Promise`\<[`JobBidListResponse`](../interfaces/JobBidListResponse.md)\>

##### Parameters

###### jobId

`string`

##### Returns

`Promise`\<[`JobBidListResponse`](../interfaces/JobBidListResponse.md)\>

#### listJobs()

> **listJobs**: (`filters`) => `Promise`\<[`JobListResponse`](../interfaces/JobListResponse.md)\>

##### Parameters

###### filters

[`JobListFilters`](../interfaces/JobListFilters.md) = `{}`

##### Returns

`Promise`\<[`JobListResponse`](../interfaces/JobListResponse.md)\>

#### listJobsByPheromone()

> **listJobsByPheromone**: (`type`, `minIntensity?`) => `Promise`\<[`JobPheromoneSearchResponse`](../interfaces/JobPheromoneSearchResponse.md)\>

##### Parameters

###### type

`string`

###### minIntensity?

`number`

##### Returns

`Promise`\<[`JobPheromoneSearchResponse`](../interfaces/JobPheromoneSearchResponse.md)\>

#### listLabels()

> **listLabels**: () => `Promise`\<[`JobLabelsResponse`](../interfaces/JobLabelsResponse.md)\>

##### Returns

`Promise`\<[`JobLabelsResponse`](../interfaces/JobLabelsResponse.md)\>

#### lockJob()

> **lockJob**: (`jobId`, `agentId`, `agentName?`) => `Promise`\<[`JobLockAcquireResponse`](../interfaces/JobLockAcquireResponse.md)\>

##### Parameters

###### jobId

`string`

###### agentId

`string`

###### agentName?

`string`

##### Returns

`Promise`\<[`JobLockAcquireResponse`](../interfaces/JobLockAcquireResponse.md)\>

#### rejectUnlockRequest()

> **rejectUnlockRequest**: (`jobId`, `unlockRequestId`, `respondedBy`) => `Promise`\<[`JobUnlockRequestRejectResponse`](../interfaces/JobUnlockRequestRejectResponse.md)\>

##### Parameters

###### jobId

`string`

###### unlockRequestId

`string`

###### respondedBy

`string`

##### Returns

`Promise`\<[`JobUnlockRequestRejectResponse`](../interfaces/JobUnlockRequestRejectResponse.md)\>

#### removeBlocker()

> **removeBlocker**: (`jobId`, `blockerId`) => `Promise`\<[`JobBlockerRemoveResponse`](../interfaces/JobBlockerRemoveResponse.md)\>

##### Parameters

###### jobId

`string`

###### blockerId

`string`

##### Returns

`Promise`\<[`JobBlockerRemoveResponse`](../interfaces/JobBlockerRemoveResponse.md)\>

#### removeDependency()

> **removeDependency**: (`jobId`, `targetId`) => `Promise`\<[`JobDependencyResponse`](../interfaces/JobDependencyResponse.md)\>

##### Parameters

###### jobId

`string`

###### targetId

`string`

##### Returns

`Promise`\<[`JobDependencyResponse`](../interfaces/JobDependencyResponse.md)\>

#### removeLabel()

> **removeLabel**: (`label`) => `Promise`\<[`JobLabelsResponse`](../interfaces/JobLabelsResponse.md)\>

##### Parameters

###### label

`string`

##### Returns

`Promise`\<[`JobLabelsResponse`](../interfaces/JobLabelsResponse.md)\>

#### removePheromone()

> **removePheromone**: (`jobId`, `type`, `depositedBy?`) => `Promise`\<[`JobPheromoneRemoveResponse`](../interfaces/JobPheromoneRemoveResponse.md)\>

##### Parameters

###### jobId

`string`

###### type

`string`

###### depositedBy?

`string`

##### Returns

`Promise`\<[`JobPheromoneRemoveResponse`](../interfaces/JobPheromoneRemoveResponse.md)\>

#### removePheromoneType()

> **removePheromoneType**: (`name`) => `Promise`\<[`JobPheromoneTypeResponse`](../interfaces/JobPheromoneTypeResponse.md)\>

##### Parameters

###### name

`string`

##### Returns

`Promise`\<[`JobPheromoneTypeResponse`](../interfaces/JobPheromoneTypeResponse.md)\>

#### resolveBlocker()

> **resolveBlocker**: (`jobId`, `blockerId`, `resolvedBy`) => `Promise`\<[`JobBlockerResolveResponse`](../interfaces/JobBlockerResolveResponse.md)\>

##### Parameters

###### jobId

`string`

###### blockerId

`string`

###### resolvedBy

`string`

##### Returns

`Promise`\<[`JobBlockerResolveResponse`](../interfaces/JobBlockerResolveResponse.md)\>

#### unlockJob()

> **unlockJob**: (`jobId`, `agentId`) => `Promise`\<[`JobLockReleaseResponse`](../interfaces/JobLockReleaseResponse.md)\>

##### Parameters

###### jobId

`string`

###### agentId

`string`

##### Returns

`Promise`\<[`JobLockReleaseResponse`](../interfaces/JobLockReleaseResponse.md)\>

#### updateJob()

> **updateJob**: (`jobId`, `data`) => `Promise`\<[`JobUpdateResponse`](../interfaces/JobUpdateResponse.md)\>

##### Parameters

###### jobId

`string`

###### data

[`UpdateJobData`](../interfaces/UpdateJobData.md)

##### Returns

`Promise`\<[`JobUpdateResponse`](../interfaces/JobUpdateResponse.md)\>

#### withdrawBid()

> **withdrawBid**: (`jobId`, `bidId`) => `Promise`\<[`JobBidWithdrawResponse`](../interfaces/JobBidWithdrawResponse.md)\>

##### Parameters

###### jobId

`string`

###### bidId

`string`

##### Returns

`Promise`\<[`JobBidWithdrawResponse`](../interfaces/JobBidWithdrawResponse.md)\>

***

### knowledge

> **knowledge**: `object` = `cbknowledge`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:147](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L147)

***

### knowledgeGraph

> **knowledgeGraph**: `object` = `cbknowledgeGraph`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:185](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L185)

#### addEdge()

> **addEdge**: (`instanceId`, `edge`) => `Promise`\<[`KGEdgeResponse`](../interfaces/KGEdgeResponse.md)\>

Add an edge to an instance

##### Parameters

###### instanceId

`string`

Instance ID

###### edge

[`CreateKGEdgeParams`](../interfaces/CreateKGEdgeParams.md)

Edge data

##### Returns

`Promise`\<[`KGEdgeResponse`](../interfaces/KGEdgeResponse.md)\>

#### addEdges()

> **addEdges**: (`instanceId`, `edges`) => `Promise`\<[`KGEdgeListResponse`](../interfaces/KGEdgeListResponse.md)\>

Add multiple edges to an instance

##### Parameters

###### instanceId

`string`

Instance ID

###### edges

[`CreateKGEdgeParams`](../interfaces/CreateKGEdgeParams.md)[]

Array of edge data

##### Returns

`Promise`\<[`KGEdgeListResponse`](../interfaces/KGEdgeListResponse.md)\>

#### addMemoryRecord()

> **addMemoryRecord**: (`instanceId`, `record`) => `Promise`\<[`KGMemoryRecordResponse`](../interfaces/KGMemoryRecordResponse.md)\>

Add a memory record to an instance

##### Parameters

###### instanceId

`string`

Instance ID

###### record

[`CreateKGMemoryRecordParams`](../interfaces/CreateKGMemoryRecordParams.md)

Record data

##### Returns

`Promise`\<[`KGMemoryRecordResponse`](../interfaces/KGMemoryRecordResponse.md)\>

#### addMemoryRecords()

> **addMemoryRecords**: (`instanceId`, `records`) => `Promise`\<[`KGMemoryRecordListResponse`](../interfaces/KGMemoryRecordListResponse.md)\>

Add multiple memory records to an instance

##### Parameters

###### instanceId

`string`

Instance ID

###### records

[`CreateKGMemoryRecordParams`](../interfaces/CreateKGMemoryRecordParams.md)[]

Array of record data

##### Returns

`Promise`\<[`KGMemoryRecordListResponse`](../interfaces/KGMemoryRecordListResponse.md)\>

#### createInstance()

> **createInstance**: (`config`) => `Promise`\<[`KGInstanceResponse`](../interfaces/KGInstanceResponse.md)\>

Create a new knowledge graph instance

##### Parameters

###### config

[`CreateKGInstanceParams`](../interfaces/CreateKGInstanceParams.md)

Instance configuration

##### Returns

`Promise`\<[`KGInstanceResponse`](../interfaces/KGInstanceResponse.md)\>

#### createInstanceTemplate()

> **createInstanceTemplate**: (`config`) => `Promise`\<[`KGInstanceTemplateResponse`](../interfaces/KGInstanceTemplateResponse.md)\>

Create a new instance template

##### Parameters

###### config

[`CreateKGInstanceTemplateParams`](../interfaces/CreateKGInstanceTemplateParams.md)

Template configuration

##### Returns

`Promise`\<[`KGInstanceTemplateResponse`](../interfaces/KGInstanceTemplateResponse.md)\>

#### createView()

> **createView**: (`config`) => `Promise`\<[`KGViewResponse`](../interfaces/KGViewResponse.md)\>

Create a view

##### Parameters

###### config

[`CreateKGViewParams`](../interfaces/CreateKGViewParams.md)

View configuration

##### Returns

`Promise`\<[`KGViewResponse`](../interfaces/KGViewResponse.md)\>

#### createViewTemplate()

> **createViewTemplate**: (`config`) => `Promise`\<[`KGViewTemplateResponse`](../interfaces/KGViewTemplateResponse.md)\>

Create a view template

##### Parameters

###### config

[`CreateKGViewTemplateParams`](../interfaces/CreateKGViewTemplateParams.md)

View template configuration

##### Returns

`Promise`\<[`KGViewTemplateResponse`](../interfaces/KGViewTemplateResponse.md)\>

#### deleteEdge()

> **deleteEdge**: (`instanceId`, `edgeId`) => `Promise`\<[`KGDeleteResponse`](../interfaces/KGDeleteResponse.md)\>

Delete an edge

##### Parameters

###### instanceId

`string`

Instance ID

###### edgeId

`string`

Edge ID

##### Returns

`Promise`\<[`KGDeleteResponse`](../interfaces/KGDeleteResponse.md)\>

#### deleteInstance()

> **deleteInstance**: (`instanceId`) => `Promise`\<[`KGDeleteResponse`](../interfaces/KGDeleteResponse.md)\>

Delete an instance

##### Parameters

###### instanceId

`string`

Instance ID

##### Returns

`Promise`\<[`KGDeleteResponse`](../interfaces/KGDeleteResponse.md)\>

#### deleteInstanceTemplate()

> **deleteInstanceTemplate**: (`templateId`) => `Promise`\<[`KGDeleteResponse`](../interfaces/KGDeleteResponse.md)\>

Delete an instance template

##### Parameters

###### templateId

`string`

Template ID

##### Returns

`Promise`\<[`KGDeleteResponse`](../interfaces/KGDeleteResponse.md)\>

#### deleteMemoryRecord()

> **deleteMemoryRecord**: (`instanceId`, `recordId`) => `Promise`\<[`KGDeleteResponse`](../interfaces/KGDeleteResponse.md)\>

Delete a memory record

##### Parameters

###### instanceId

`string`

Instance ID

###### recordId

`string`

Record ID

##### Returns

`Promise`\<[`KGDeleteResponse`](../interfaces/KGDeleteResponse.md)\>

#### deleteView()

> **deleteView**: (`viewId`) => `Promise`\<[`KGDeleteResponse`](../interfaces/KGDeleteResponse.md)\>

Delete a view

##### Parameters

###### viewId

`string`

View ID

##### Returns

`Promise`\<[`KGDeleteResponse`](../interfaces/KGDeleteResponse.md)\>

#### deleteViewTemplate()

> **deleteViewTemplate**: (`templateId`) => `Promise`\<[`KGDeleteResponse`](../interfaces/KGDeleteResponse.md)\>

Delete a view template

##### Parameters

###### templateId

`string`

Template ID

##### Returns

`Promise`\<[`KGDeleteResponse`](../interfaces/KGDeleteResponse.md)\>

#### executeView()

> **executeView**: (`viewId`) => `Promise`\<[`KGViewExecuteResponse`](../interfaces/KGViewExecuteResponse.md)\>

Execute a view query

##### Parameters

###### viewId

`string`

View ID

##### Returns

`Promise`\<[`KGViewExecuteResponse`](../interfaces/KGViewExecuteResponse.md)\>

#### getInstance()

> **getInstance**: (`instanceId`) => `Promise`\<[`KGInstanceResponse`](../interfaces/KGInstanceResponse.md)\>

Get an instance by ID

##### Parameters

###### instanceId

`string`

Instance ID

##### Returns

`Promise`\<[`KGInstanceResponse`](../interfaces/KGInstanceResponse.md)\>

#### getInstanceTemplate()

> **getInstanceTemplate**: (`templateId`) => `Promise`\<[`KGInstanceTemplateResponse`](../interfaces/KGInstanceTemplateResponse.md)\>

Get an instance template by ID

##### Parameters

###### templateId

`string`

Template ID

##### Returns

`Promise`\<[`KGInstanceTemplateResponse`](../interfaces/KGInstanceTemplateResponse.md)\>

#### getMemoryRecord()

> **getMemoryRecord**: (`instanceId`, `recordId`) => `Promise`\<[`KGMemoryRecordResponse`](../interfaces/KGMemoryRecordResponse.md)\>

Get a memory record by ID

##### Parameters

###### instanceId

`string`

Instance ID

###### recordId

`string`

Record ID

##### Returns

`Promise`\<[`KGMemoryRecordResponse`](../interfaces/KGMemoryRecordResponse.md)\>

#### getViewTemplate()

> **getViewTemplate**: (`templateId`) => `Promise`\<[`KGViewTemplateResponse`](../interfaces/KGViewTemplateResponse.md)\>

Get a view template by ID

##### Parameters

###### templateId

`string`

Template ID

##### Returns

`Promise`\<[`KGViewTemplateResponse`](../interfaces/KGViewTemplateResponse.md)\>

#### listEdges()

> **listEdges**: (`instanceId`, `filters?`) => `Promise`\<[`KGEdgeListResponse`](../interfaces/KGEdgeListResponse.md)\>

List edges in an instance

##### Parameters

###### instanceId

`string`

Instance ID

###### filters?

[`ListKGEdgesParams`](../interfaces/ListKGEdgesParams.md)

Optional filters

##### Returns

`Promise`\<[`KGEdgeListResponse`](../interfaces/KGEdgeListResponse.md)\>

#### listInstances()

> **listInstances**: (`templateId?`) => `Promise`\<[`KGInstanceListResponse`](../interfaces/KGInstanceListResponse.md)\>

List instances, optionally filtered by template

##### Parameters

###### templateId?

`string`

Optional template ID filter

##### Returns

`Promise`\<[`KGInstanceListResponse`](../interfaces/KGInstanceListResponse.md)\>

#### listInstanceTemplates()

> **listInstanceTemplates**: () => `Promise`\<[`KGInstanceTemplateListResponse`](../interfaces/KGInstanceTemplateListResponse.md)\>

List all instance templates

##### Returns

`Promise`\<[`KGInstanceTemplateListResponse`](../interfaces/KGInstanceTemplateListResponse.md)\>

#### listMemoryRecords()

> **listMemoryRecords**: (`instanceId`, `filters?`) => `Promise`\<[`KGMemoryRecordListResponse`](../interfaces/KGMemoryRecordListResponse.md)\>

List memory records in an instance

##### Parameters

###### instanceId

`string`

Instance ID

###### filters?

[`ListKGMemoryRecordsParams`](../interfaces/ListKGMemoryRecordsParams.md)

Optional filters

##### Returns

`Promise`\<[`KGMemoryRecordListResponse`](../interfaces/KGMemoryRecordListResponse.md)\>

#### listViews()

> **listViews**: (`instanceId`) => `Promise`\<[`KGViewListResponse`](../interfaces/KGViewListResponse.md)\>

List views for an instance

##### Parameters

###### instanceId

`string`

Instance ID

##### Returns

`Promise`\<[`KGViewListResponse`](../interfaces/KGViewListResponse.md)\>

#### listViewTemplates()

> **listViewTemplates**: (`applicableTemplateId?`) => `Promise`\<[`KGViewTemplateListResponse`](../interfaces/KGViewTemplateListResponse.md)\>

List view templates

##### Parameters

###### applicableTemplateId?

`string`

Optional filter by applicable template

##### Returns

`Promise`\<[`KGViewTemplateListResponse`](../interfaces/KGViewTemplateListResponse.md)\>

#### updateInstanceTemplate()

> **updateInstanceTemplate**: (`templateId`, `updates`) => `Promise`\<[`KGInstanceTemplateResponse`](../interfaces/KGInstanceTemplateResponse.md)\>

Update an instance template

##### Parameters

###### templateId

`string`

Template ID

###### updates

`Partial`\<[`CreateKGInstanceTemplateParams`](../interfaces/CreateKGInstanceTemplateParams.md)\>

Update parameters

##### Returns

`Promise`\<[`KGInstanceTemplateResponse`](../interfaces/KGInstanceTemplateResponse.md)\>

#### updateMemoryRecord()

> **updateMemoryRecord**: (`instanceId`, `recordId`, `updates`) => `Promise`\<[`KGMemoryRecordResponse`](../interfaces/KGMemoryRecordResponse.md)\>

Update a memory record

##### Parameters

###### instanceId

`string`

Instance ID

###### recordId

`string`

Record ID

###### updates

`Partial`\<[`CreateKGMemoryRecordParams`](../interfaces/CreateKGMemoryRecordParams.md)\>

Update parameters

##### Returns

`Promise`\<[`KGMemoryRecordResponse`](../interfaces/KGMemoryRecordResponse.md)\>

#### updateViewTemplate()

> **updateViewTemplate**: (`templateId`, `updates`) => `Promise`\<[`KGViewTemplateResponse`](../interfaces/KGViewTemplateResponse.md)\>

Update a view template

##### Parameters

###### templateId

`string`

Template ID

###### updates

`Partial`\<[`CreateKGViewTemplateParams`](../interfaces/CreateKGViewTemplateParams.md)\>

Update parameters

##### Returns

`Promise`\<[`KGViewTemplateResponse`](../interfaces/KGViewTemplateResponse.md)\>

***

### kvStore

> **kvStore**: `object` = `cbkvStore`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:182](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L182)

#### createInstance()

> **createInstance**: (`name`, `description?`) => `Promise`\<[`KVInstanceResponse`](../interfaces/KVInstanceResponse.md)\>

Create a new KV store instance

##### Parameters

###### name

`string`

Instance name

###### description?

`string`

Optional description

##### Returns

`Promise`\<[`KVInstanceResponse`](../interfaces/KVInstanceResponse.md)\>

#### delete()

> **delete**: (`instanceId`, `namespace`, `key`) => `Promise`\<[`KVDeleteResponse`](../interfaces/KVDeleteResponse.md)\>

Delete a value from the KV store

##### Parameters

###### instanceId

`string`

Instance ID

###### namespace

`string`

Namespace

###### key

`string`

Key

##### Returns

`Promise`\<[`KVDeleteResponse`](../interfaces/KVDeleteResponse.md)\>

#### deleteInstance()

> **deleteInstance**: (`instanceId`) => `Promise`\<[`KVDeleteResponse`](../interfaces/KVDeleteResponse.md)\>

Delete a KV store instance

##### Parameters

###### instanceId

`string`

Instance ID

##### Returns

`Promise`\<[`KVDeleteResponse`](../interfaces/KVDeleteResponse.md)\>

#### deleteNamespace()

> **deleteNamespace**: (`instanceId`, `namespace`) => `Promise`\<[`KVDeleteNamespaceResponse`](../interfaces/KVDeleteNamespaceResponse.md)\>

Delete an entire namespace from the KV store

##### Parameters

###### instanceId

`string`

Instance ID

###### namespace

`string`

Namespace to delete

##### Returns

`Promise`\<[`KVDeleteNamespaceResponse`](../interfaces/KVDeleteNamespaceResponse.md)\>

#### get()

> **get**: (`instanceId`, `namespace`, `key`) => `Promise`\<[`KVGetResponse`](../interfaces/KVGetResponse.md)\>

Get a value from the KV store

##### Parameters

###### instanceId

`string`

Instance ID

###### namespace

`string`

Namespace

###### key

`string`

Key

##### Returns

`Promise`\<[`KVGetResponse`](../interfaces/KVGetResponse.md)\>

#### getInstance()

> **getInstance**: (`instanceId`) => `Promise`\<[`KVInstanceResponse`](../interfaces/KVInstanceResponse.md)\>

Get a KV store instance by ID

##### Parameters

###### instanceId

`string`

Instance ID

##### Returns

`Promise`\<[`KVInstanceResponse`](../interfaces/KVInstanceResponse.md)\>

#### getNamespaces()

> **getNamespaces**: (`instanceId`) => `Promise`\<[`KVNamespacesResponse`](../interfaces/KVNamespacesResponse.md)\>

Get all namespaces in an instance

##### Parameters

###### instanceId

`string`

Instance ID

##### Returns

`Promise`\<[`KVNamespacesResponse`](../interfaces/KVNamespacesResponse.md)\>

#### getRecordCount()

> **getRecordCount**: (`instanceId`, `namespace?`) => `Promise`\<[`KVRecordCountResponse`](../interfaces/KVRecordCountResponse.md)\>

Get record count for an instance or namespace

##### Parameters

###### instanceId

`string`

Instance ID

###### namespace?

`string`

Optional namespace filter

##### Returns

`Promise`\<[`KVRecordCountResponse`](../interfaces/KVRecordCountResponse.md)\>

#### listInstances()

> **listInstances**: () => `Promise`\<[`KVInstanceListResponse`](../interfaces/KVInstanceListResponse.md)\>

List all KV store instances

##### Returns

`Promise`\<[`KVInstanceListResponse`](../interfaces/KVInstanceListResponse.md)\>

#### query()

> **query**: (`query`) => `Promise`\<[`KVQueryResponse`](../interfaces/KVQueryResponse.md)\>

Query the KV store using DSL

##### Parameters

###### query

[`KVQueryDSL`](../interfaces/KVQueryDSL.md)

Query DSL object

##### Returns

`Promise`\<[`KVQueryResponse`](../interfaces/KVQueryResponse.md)\>

#### set()

> **set**: (`instanceId`, `namespace`, `key`, `value`, `autoCreateInstance`) => `Promise`\<[`KVSetResponse`](../interfaces/KVSetResponse.md)\>

Set a value in the KV store

##### Parameters

###### instanceId

`string`

Instance ID

###### namespace

`string`

Namespace

###### key

`string`

Key

###### value

`any`

Value to store

###### autoCreateInstance

`boolean` = `false`

Auto-create instance if it doesn't exist

##### Returns

`Promise`\<[`KVSetResponse`](../interfaces/KVSetResponse.md)\>

#### updateInstance()

> **updateInstance**: (`instanceId`, `updates`) => `Promise`\<[`KVInstanceResponse`](../interfaces/KVInstanceResponse.md)\>

Update a KV store instance

##### Parameters

###### instanceId

`string`

Instance ID

###### updates

[`UpdateKVInstanceParams`](../interfaces/UpdateKVInstanceParams.md)

Update parameters

##### Returns

`Promise`\<[`KVInstanceResponse`](../interfaces/KVInstanceResponse.md)\>

***

### lastUserMessage

> `private` **lastUserMessage**: `undefined` \| `FlatUserMessage`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:78](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L78)

***

### llm

> **llm**: `object` = `cbllm`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:137](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L137)

#### getModelConfig()

> **getModelConfig**: (`modelId?`) => `Promise`\<\{ `config`: `null` \| `LLMModelConfig`; `error?`: `string`; `success`: `boolean`; \}\>

Gets the model configuration for a specific model or the default application model.
If modelId is provided, returns configuration for that specific model.
If modelId is not provided, returns the default application LLM configuration.

##### Parameters

###### modelId?

`string`

Optional model identifier. If not provided, returns default model config.

##### Returns

`Promise`\<\{ `config`: `null` \| `LLMModelConfig`; `error?`: `string`; `success`: `boolean`; \}\>

A promise that resolves with the model configuration including provider and model details.

#### inference()

> **inference**: (`params`) => `Promise`\<\{ `completion`: `LLMCompletion`; \}\>

Sends an inference request to the LLM using OpenAI message format with tools support.
The model is selected based on the provided `llmrole`. If the specific model
for the role is not found, it falls back to the default model for the current agent,
and ultimately to the default application-wide LLM if necessary.

##### Parameters

###### params

`LLMInferenceParams`

The inference parameters including:
  - messages: Array of conversation messages
  - tools: Available tools for the model to use
  - tool_choice: How the model should use tools
  - full: Whether to return full response
  - max_tokens: Maximum number of tokens to generate
  - temperature: Temperature for response generation
  - stream: Whether to stream the response

##### Returns

`Promise`\<\{ `completion`: `LLMCompletion`; \}\>

A promise that resolves with the LLM's response

***

### mail

> **mail**: `object` = `cbmail`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:138](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L138)

#### acknowledge()

> **acknowledge**: (`params`) => `Promise`\<`IAcknowledgeResponse`\>

##### Parameters

###### params

`IAcknowledgeParams`

##### Returns

`Promise`\<`IAcknowledgeResponse`\>

#### archiveThread()

> **archiveThread**: (`params`) => `Promise`\<`IArchiveThreadResponse`\>

##### Parameters

###### params

`IArchiveThreadParams`

##### Returns

`Promise`\<`IArchiveThreadResponse`\>

#### checkConflicts()

> **checkConflicts**: (`params`) => `Promise`\<`ICheckConflictsResponse`\>

##### Parameters

###### params

`ICheckConflictsParams`

##### Returns

`Promise`\<`ICheckConflictsResponse`\>

#### createThread()

> **createThread**: (`params`) => `Promise`\<`ICreateThreadResponse`\>

##### Parameters

###### params

`ICreateThreadParams`

##### Returns

`Promise`\<`ICreateThreadResponse`\>

#### fetchInbox()

> **fetchInbox**: (`params`) => `Promise`\<`IFetchInboxResponse`\>

##### Parameters

###### params

`IFetchInboxParams`

##### Returns

`Promise`\<`IFetchInboxResponse`\>

#### findOrCreateThread()

> **findOrCreateThread**: (`params`) => `Promise`\<`IFindOrCreateThreadResponse`\>

##### Parameters

###### params

`IFindOrCreateThreadParams`

##### Returns

`Promise`\<`IFindOrCreateThreadResponse`\>

#### forceReserveFiles()

> **forceReserveFiles**: (`params`) => `Promise`\<`IForceReserveFilesResponse`\>

##### Parameters

###### params

`IForceReserveFilesParams`

##### Returns

`Promise`\<`IForceReserveFilesResponse`\>

#### getAgent()

> **getAgent**: (`params`) => `Promise`\<`IGetAgentResponse`\>

##### Parameters

###### params

`IGetAgentParams`

##### Returns

`Promise`\<`IGetAgentResponse`\>

#### getMessage()

> **getMessage**: (`params`) => `Promise`\<`IGetMessageResponse`\>

##### Parameters

###### params

`IGetMessageParams`

##### Returns

`Promise`\<`IGetMessageResponse`\>

#### getMessages()

> **getMessages**: (`params`) => `Promise`\<`IGetMessagesResponse`\>

##### Parameters

###### params

`IGetMessagesParams`

##### Returns

`Promise`\<`IGetMessagesResponse`\>

#### getThread()

> **getThread**: (`params`) => `Promise`\<`IGetThreadResponse`\>

##### Parameters

###### params

`IGetThreadParams`

##### Returns

`Promise`\<`IGetThreadResponse`\>

#### listAgents()

> **listAgents**: () => `Promise`\<`IListAgentsResponse`\>

##### Returns

`Promise`\<`IListAgentsResponse`\>

#### listReservations()

> **listReservations**: (`params`) => `Promise`\<`IListReservationsResponse`\>

##### Parameters

###### params

`IListReservationsParams`

##### Returns

`Promise`\<`IListReservationsResponse`\>

#### listThreads()

> **listThreads**: (`params`) => `Promise`\<`IListThreadsResponse`\>

##### Parameters

###### params

`IListThreadsParams` = `{}`

##### Returns

`Promise`\<`IListThreadsResponse`\>

#### markRead()

> **markRead**: (`params`) => `Promise`\<`IMarkReadResponse`\>

##### Parameters

###### params

`IMarkReadParams`

##### Returns

`Promise`\<`IMarkReadResponse`\>

#### registerAgent()

> **registerAgent**: (`params`) => `Promise`\<`IRegisterAgentResponse`\>

##### Parameters

###### params

`IRegisterAgentParams`

##### Returns

`Promise`\<`IRegisterAgentResponse`\>

#### releaseFiles()

> **releaseFiles**: (`params`) => `Promise`\<`IReleaseFilesResponse`\>

##### Parameters

###### params

`IReleaseFilesParams`

##### Returns

`Promise`\<`IReleaseFilesResponse`\>

#### replyMessage()

> **replyMessage**: (`params`) => `Promise`\<`IReplyMessageResponse`\>

##### Parameters

###### params

`IReplyMessageParams`

##### Returns

`Promise`\<`IReplyMessageResponse`\>

#### reserveFiles()

> **reserveFiles**: (`params`) => `Promise`\<`IReserveFilesResponse`\>

##### Parameters

###### params

`IReserveFilesParams`

##### Returns

`Promise`\<`IReserveFilesResponse`\>

#### search()

> **search**: (`params`) => `Promise`\<`ISearchResponse`\>

##### Parameters

###### params

`ISearchParams`

##### Returns

`Promise`\<`ISearchResponse`\>

#### sendMessage()

> **sendMessage**: (`params`) => `Promise`\<`ISendMessageResponse`\>

##### Parameters

###### params

`ISendMessageParams`

##### Returns

`Promise`\<`ISendMessageResponse`\>

#### summarizeThread()

> **summarizeThread**: (`params`) => `Promise`\<`ISummarizeThreadResponse`\>

##### Parameters

###### params

`ISummarizeThreadParams`

##### Returns

`Promise`\<`ISummarizeThreadResponse`\>

#### updateThreadStatus()

> **updateThreadStatus**: (`params`) => `Promise`\<`IUpdateThreadStatusResponse`\>

##### Parameters

###### params

`IUpdateThreadStatusParams`

##### Returns

`Promise`\<`IUpdateThreadStatusResponse`\>

***

### mcp

> **mcp**: `object` = `codeboltTools`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:159](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L159)

#### configureMCPServer()

> **configureMCPServer**: (`name`, `config`) => `Promise`\<`ConfigureToolBoxResponse`\>

Configures a specific toolbox with provided configuration.

##### Parameters

###### name

`string`

The name of the toolbox to configure

###### config

`MCPConfiguration`

Configuration object for the toolbox

##### Returns

`Promise`\<`ConfigureToolBoxResponse`\>

Promise with the configuration result

#### configureMcpTool()

> **configureMcpTool**: (`mcpName`, `toolName`, `config`) => `Promise`\<`ConfigureMCPToolResponse`\>

Configures a specific MCP tool with provided configuration.

##### Parameters

###### mcpName

`string`

The name of the MCP server

###### toolName

`string`

The name of the tool to configure

###### config

`Record`\<`string`, `unknown`\>

Configuration object for the tool

##### Returns

`Promise`\<`ConfigureMCPToolResponse`\>

Promise with the configuration result

#### executeTool()

> **executeTool**: (`toolbox`, `toolName`, `params`) => `Promise`\<`ExecuteToolResponse`\>

Executes a specific tool with provided parameters.

##### Parameters

###### toolbox

`string`

The name of the toolbox containing the tool

###### toolName

`string`

The name of the tool to execute

###### params

`ToolParameters`

Parameters to pass to the tool

##### Returns

`Promise`\<`ExecuteToolResponse`\>

Promise with the execution result

#### getAllMcpTools()

> **getAllMcpTools**: () => `Promise`\<`GetAllMCPToolsResponse`\>

Gets all tools from all enabled MCP servers.

##### Returns

`Promise`\<`GetAllMCPToolsResponse`\>

Promise with all MCP tools data

#### getEnabledMcps()

> **getEnabledMcps**: () => `Promise`\<`GetEnabledMCPSResponse`\>

Gets the list of enabled MCP servers.

##### Returns

`Promise`\<`GetEnabledMCPSResponse`\>

Promise with enabled MCP servers data

#### getEnabledMCPServers()

> **getEnabledMCPServers**: () => `Promise`\<`GetEnabledToolBoxesResponse`\>

Gets the list of currently enabled toolboxes.

##### Returns

`Promise`\<`GetEnabledToolBoxesResponse`\>

Promise with the enabled toolboxes data

#### getLocalMCPServers()

> **getLocalMCPServers**: () => `Promise`\<`GetLocalToolBoxesResponse`\>

Gets the list of locally available toolboxes.

##### Returns

`Promise`\<`GetLocalToolBoxesResponse`\>

Promise with the local toolboxes data

#### getMcpList()

> **getMcpList**: () => `Promise`\<`GetMcpListResponse`\>

Gets the list of available MCP servers.

##### Returns

`Promise`\<`GetMcpListResponse`\>

Promise with MCP server list

#### getMcpTools()

> **getMcpTools**: (`mcpNames?`) => `Promise`\<`GetMcpToolsResponse`\>

Gets MCP tools from the specified servers.

##### Parameters

###### mcpNames?

`string`[]

Array of MCP server names to get tools from

##### Returns

`Promise`\<`GetMcpToolsResponse`\>

Promise with MCP tools data

#### getMentionedMCPServers()

> **getMentionedMCPServers**: (`userMessage`) => `Promise`\<`GetAvailableToolBoxesResponse`\>

Gets toolboxes mentioned in a user message.

##### Parameters

###### userMessage

`MCPUserMessage`

The user message to extract mentions from

##### Returns

`Promise`\<`GetAvailableToolBoxesResponse`\>

Promise with the mentioned toolboxes

#### getTools()

> **getTools**: (`toolRequests`) => `Promise`\<`GetToolsResponse`\>

Gets detailed information about specific tools.

##### Parameters

###### toolRequests

`object`[]

Array of toolbox and tool name pairs

##### Returns

`Promise`\<`GetToolsResponse`\>

Promise with detailed information about the tools

#### listMcpFromServers()

> **listMcpFromServers**: (`toolBoxes`) => `Promise`\<`ListToolsFromToolBoxesResponse`\>

Lists all tools from the specified toolboxes.

##### Parameters

###### toolBoxes

`string`[]

Array of toolbox names to list tools from

##### Returns

`Promise`\<`ListToolsFromToolBoxesResponse`\>

Promise with tools from the specified toolboxes (in OpenAI format)

#### searchAvailableMCPServers()

> **searchAvailableMCPServers**: (`query`) => `Promise`\<`SearchAvailableToolBoxesResponse`\>

Searches for available toolboxes matching a query.

##### Parameters

###### query

`string`

The search query string

##### Returns

`Promise`\<`SearchAvailableToolBoxesResponse`\>

Promise with matching toolboxes data

***

### memory

> **memory**: `object` = `codebotMemory`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:163](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L163)

#### json

> **json**: `object`

##### json.delete()

> **delete**: (`memoryId`) => `Promise`\<`DeleteMemoryResponse`\>

###### Parameters

###### memoryId

`string`

###### Returns

`Promise`\<`DeleteMemoryResponse`\>

##### json.list()

> **list**: (`filters`) => `Promise`\<`ListMemoryResponse`\>

###### Parameters

###### filters

`Record`\<`string`, `unknown`\> = `{}`

###### Returns

`Promise`\<`ListMemoryResponse`\>

##### json.save()

> **save**: (`json`) => `Promise`\<`SaveMemoryResponse`\>

###### Parameters

###### json

`any`

###### Returns

`Promise`\<`SaveMemoryResponse`\>

##### json.update()

> **update**: (`memoryId`, `json`) => `Promise`\<`UpdateMemoryResponse`\>

###### Parameters

###### memoryId

`string`

###### json

`any`

###### Returns

`Promise`\<`UpdateMemoryResponse`\>

#### markdown

> **markdown**: `object`

##### markdown.delete()

> **delete**: (`memoryId`) => `Promise`\<`DeleteMemoryResponse`\>

###### Parameters

###### memoryId

`string`

###### Returns

`Promise`\<`DeleteMemoryResponse`\>

##### markdown.list()

> **list**: (`filters`) => `Promise`\<`ListMemoryResponse`\>

###### Parameters

###### filters

`Record`\<`string`, `unknown`\> = `{}`

###### Returns

`Promise`\<`ListMemoryResponse`\>

##### markdown.save()

> **save**: (`markdown`, `metadata`) => `Promise`\<`SaveMemoryResponse`\>

###### Parameters

###### markdown

`string`

###### metadata

`Record`\<`string`, `unknown`\> = `{}`

###### Returns

`Promise`\<`SaveMemoryResponse`\>

##### markdown.update()

> **update**: (`memoryId`, `markdown`, `metadata`) => `Promise`\<`UpdateMemoryResponse`\>

###### Parameters

###### memoryId

`string`

###### markdown

`string`

###### metadata

`Record`\<`string`, `unknown`\> = `{}`

###### Returns

`Promise`\<`UpdateMemoryResponse`\>

#### todo

> **todo**: `object`

##### todo.delete()

> **delete**: (`memoryId`) => `Promise`\<`DeleteMemoryResponse`\>

###### Parameters

###### memoryId

`string`

###### Returns

`Promise`\<`DeleteMemoryResponse`\>

##### todo.list()

> **list**: (`filters`) => `Promise`\<`ListMemoryResponse`\>

###### Parameters

###### filters

`Record`\<`string`, `unknown`\> = `{}`

###### Returns

`Promise`\<`ListMemoryResponse`\>

##### todo.save()

> **save**: (`todo`, `metadata`) => `Promise`\<`SaveMemoryResponse`\>

###### Parameters

###### todo

\{ `createdAt?`: `string`; `id?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"`; `status?`: `"pending"` \| `"completed"` \| `"processing"`; `tags?`: `string`[]; `title?`: `string`; `updatedAt?`: `string`; \} | `object`[]

###### metadata

`Record`\<`string`, `unknown`\> = `{}`

###### Returns

`Promise`\<`SaveMemoryResponse`\>

##### todo.update()

> **update**: (`memoryId`, `todo`) => `Promise`\<`UpdateMemoryResponse`\>

###### Parameters

###### memoryId

`string`

###### todo

###### createdAt?

`string`

###### id?

`string`

###### priority?

`"low"` \| `"medium"` \| `"high"`

###### status?

`"pending"` \| `"completed"` \| `"processing"`

###### tags?

`string`[]

###### title?

`string`

###### updatedAt?

`string`

###### Returns

`Promise`\<`UpdateMemoryResponse`\>

***

### memoryIngestion

> **memoryIngestion**: `object` = `cbmemoryIngestion`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:187](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L187)

#### activate()

> **activate**: (`pipelineId`) => `Promise`\<[`IngestionPipelineResponse`](../interfaces/IngestionPipelineResponse.md)\>

Activate an ingestion pipeline

##### Parameters

###### pipelineId

`string`

Pipeline ID

##### Returns

`Promise`\<[`IngestionPipelineResponse`](../interfaces/IngestionPipelineResponse.md)\>

#### create()

> **create**: (`config`) => `Promise`\<[`IngestionPipelineResponse`](../interfaces/IngestionPipelineResponse.md)\>

Create a new ingestion pipeline

##### Parameters

###### config

[`CreateIngestionPipelineParams`](../interfaces/CreateIngestionPipelineParams.md)

Pipeline configuration

##### Returns

`Promise`\<[`IngestionPipelineResponse`](../interfaces/IngestionPipelineResponse.md)\>

#### delete()

> **delete**: (`pipelineId`) => `Promise`\<[`IngestionPipelineResponse`](../interfaces/IngestionPipelineResponse.md)\>

Delete an ingestion pipeline

##### Parameters

###### pipelineId

`string`

Pipeline ID

##### Returns

`Promise`\<[`IngestionPipelineResponse`](../interfaces/IngestionPipelineResponse.md)\>

#### disable()

> **disable**: (`pipelineId`) => `Promise`\<[`IngestionPipelineResponse`](../interfaces/IngestionPipelineResponse.md)\>

Disable an ingestion pipeline

##### Parameters

###### pipelineId

`string`

Pipeline ID

##### Returns

`Promise`\<[`IngestionPipelineResponse`](../interfaces/IngestionPipelineResponse.md)\>

#### duplicate()

> **duplicate**: (`pipelineId`, `newId?`, `newLabel?`) => `Promise`\<[`IngestionPipelineResponse`](../interfaces/IngestionPipelineResponse.md)\>

Duplicate an ingestion pipeline

##### Parameters

###### pipelineId

`string`

Pipeline ID to duplicate

###### newId?

`string`

Optional new ID

###### newLabel?

`string`

Optional new label

##### Returns

`Promise`\<[`IngestionPipelineResponse`](../interfaces/IngestionPipelineResponse.md)\>

#### execute()

> **execute**: (`params`) => `Promise`\<[`IngestionExecuteResponse`](../interfaces/IngestionExecuteResponse.md)\>

Execute an ingestion pipeline

##### Parameters

###### params

[`ExecuteIngestionParams`](../interfaces/ExecuteIngestionParams.md)

Execution parameters

##### Returns

`Promise`\<[`IngestionExecuteResponse`](../interfaces/IngestionExecuteResponse.md)\>

#### get()

> **get**: (`pipelineId`) => `Promise`\<[`IngestionPipelineResponse`](../interfaces/IngestionPipelineResponse.md)\>

Get an ingestion pipeline by ID

##### Parameters

###### pipelineId

`string`

Pipeline ID

##### Returns

`Promise`\<[`IngestionPipelineResponse`](../interfaces/IngestionPipelineResponse.md)\>

#### getProcessorSpecs()

> **getProcessorSpecs**: () => `Promise`\<[`IngestionProcessorSpecsResponse`](../interfaces/IngestionProcessorSpecsResponse.md)\>

Get available processor specifications

##### Returns

`Promise`\<[`IngestionProcessorSpecsResponse`](../interfaces/IngestionProcessorSpecsResponse.md)\>

#### list()

> **list**: (`filters?`) => `Promise`\<[`IngestionPipelineListResponse`](../interfaces/IngestionPipelineListResponse.md)\>

List ingestion pipelines

##### Parameters

###### filters?

[`ListIngestionPipelineParams`](../interfaces/ListIngestionPipelineParams.md)

Optional filters

##### Returns

`Promise`\<[`IngestionPipelineListResponse`](../interfaces/IngestionPipelineListResponse.md)\>

#### update()

> **update**: (`pipelineId`, `updates`) => `Promise`\<[`IngestionPipelineResponse`](../interfaces/IngestionPipelineResponse.md)\>

Update an ingestion pipeline

##### Parameters

###### pipelineId

`string`

Pipeline ID

###### updates

[`UpdateIngestionPipelineParams`](../interfaces/UpdateIngestionPipelineParams.md)

Update parameters

##### Returns

`Promise`\<[`IngestionPipelineResponse`](../interfaces/IngestionPipelineResponse.md)\>

#### validate()

> **validate**: (`pipeline`) => `Promise`\<[`IngestionValidateResponse`](../interfaces/IngestionValidateResponse.md)\>

Validate a pipeline configuration

##### Parameters

###### pipeline

[`CreateIngestionPipelineParams`](../interfaces/CreateIngestionPipelineParams.md)

Pipeline configuration to validate

##### Returns

`Promise`\<[`IngestionValidateResponse`](../interfaces/IngestionValidateResponse.md)\>

***

### messageQueue

> `private` **messageQueue**: `FlatUserMessage`[] = `[]`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:76](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L76)

***

### messageResolvers

> `private` **messageResolvers**: (`message`) => `void`[] = `[]`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:77](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L77)

#### Parameters

##### message

`FlatUserMessage`

#### Returns

`void`

***

### notify

> **notify**: [`NotificationFunctions`](../interfaces/NotificationFunctions.md) = `notificationFunctions`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:162](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L162)

***

### orchestrator

> **orchestrator**: `object`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:191](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L191)

#### createOrchestrator()

> **createOrchestrator**: (`data`) => `Promise`\<[`OrchestratorResponse`](../interfaces/OrchestratorResponse.md)\>

Creates a new orchestrator

##### Parameters

###### data

[`CreateOrchestratorParams`](../interfaces/CreateOrchestratorParams.md)

##### Returns

`Promise`\<[`OrchestratorResponse`](../interfaces/OrchestratorResponse.md)\>

#### deleteOrchestrator()

> **deleteOrchestrator**: (`orchestratorId`) => `Promise`\<[`OrchestratorResponse`](../interfaces/OrchestratorResponse.md)\>

Deletes an orchestrator

##### Parameters

###### orchestratorId

`string`

##### Returns

`Promise`\<[`OrchestratorResponse`](../interfaces/OrchestratorResponse.md)\>

#### getOrchestrator()

> **getOrchestrator**: (`orchestratorId`) => `Promise`\<[`OrchestratorResponse`](../interfaces/OrchestratorResponse.md)\>

Gets a specific orchestrator by ID

##### Parameters

###### orchestratorId

`string`

##### Returns

`Promise`\<[`OrchestratorResponse`](../interfaces/OrchestratorResponse.md)\>

#### getOrchestratorSettings()

> **getOrchestratorSettings**: (`orchestratorId`) => `Promise`\<[`OrchestratorResponse`](../interfaces/OrchestratorResponse.md)\>

Gets orchestrator settings

##### Parameters

###### orchestratorId

`string`

##### Returns

`Promise`\<[`OrchestratorResponse`](../interfaces/OrchestratorResponse.md)\>

#### listOrchestrators()

> **listOrchestrators**: () => `Promise`\<[`OrchestratorResponse`](../interfaces/OrchestratorResponse.md)\>

Lists all orchestrators

##### Returns

`Promise`\<[`OrchestratorResponse`](../interfaces/OrchestratorResponse.md)\>

#### updateCodeboltJs()

> **updateCodeboltJs**: () => `Promise`\<[`OrchestratorResponse`](../interfaces/OrchestratorResponse.md)\>

Initiates a Codebolt JS update

##### Returns

`Promise`\<[`OrchestratorResponse`](../interfaces/OrchestratorResponse.md)\>

#### updateOrchestrator()

> **updateOrchestrator**: (`orchestratorId`, `data`) => `Promise`\<[`OrchestratorResponse`](../interfaces/OrchestratorResponse.md)\>

Updates an orchestrator

##### Parameters

###### orchestratorId

`string`

###### data

[`UpdateOrchestratorParams`](../interfaces/UpdateOrchestratorParams.md)

##### Returns

`Promise`\<[`OrchestratorResponse`](../interfaces/OrchestratorResponse.md)\>

#### updateOrchestratorSettings()

> **updateOrchestratorSettings**: (`orchestratorId`, `settings`) => `Promise`\<[`OrchestratorResponse`](../interfaces/OrchestratorResponse.md)\>

Updates orchestrator settings

##### Parameters

###### orchestratorId

`string`

###### settings

[`UpdateOrchestratorSettingsParams`](../interfaces/UpdateOrchestratorSettingsParams.md)

##### Returns

`Promise`\<[`OrchestratorResponse`](../interfaces/OrchestratorResponse.md)\>

#### updateOrchestratorStatus()

> **updateOrchestratorStatus**: (`orchestratorId`, `status`) => `Promise`\<[`OrchestratorResponse`](../interfaces/OrchestratorResponse.md)\>

Updates orchestrator status

##### Parameters

###### orchestratorId

`string`

###### status

`OrchestratorStatus`

##### Returns

`Promise`\<[`OrchestratorResponse`](../interfaces/OrchestratorResponse.md)\>

***

### outputparsers

> **outputparsers**: `object` = `cboutputparsers`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:149](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L149)

#### parseCSV()

> **parseCSV**: (`csvString`) => `ParseResult`\<`CSVRow`[]\>

Parses CSV string and returns a result object.

##### Parameters

###### csvString

`string`

The CSV string to parse.

##### Returns

`ParseResult`\<`CSVRow`[]\>

An object with success flag and parsed data or error.

#### parseErrors()

> **parseErrors**: (`output`) => `string`[]

Parses the given output and returns all the error messages.

##### Parameters

###### output

`ParsableOutput`

The output to parse for error messages.

##### Returns

`string`[]

An array of error messages.

#### parseJSON()

> **parseJSON**: (`jsonString`) => `ParseResult`\<`unknown`\>

Parses JSON string and returns a result object.

##### Parameters

###### jsonString

`string`

The JSON string to parse.

##### Returns

`ParseResult`\<`unknown`\>

An object with success flag and parsed data or error.

#### parseText()

> **parseText**: (`text`) => `ParseResult`\<`string`[]\>

Parses text string and returns a result object with lines.

##### Parameters

###### text

`string`

The text to parse.

##### Returns

`ParseResult`\<`string`[]\>

An object with success flag and parsed lines.

#### parseWarnings()

> **parseWarnings**: (`output`) => `string`[]

Parses the given output and returns all the warning messages.

##### Parameters

###### output

`ParsableOutput`

The output to parse for warning messages.

##### Returns

`string`[]

An array of warning messages.

#### parseXML()

> **parseXML**: (`xmlString`) => `ParseResult`\<\{\[`key`: `string`\]: `unknown`; `rootElement`: `string`; \}\>

Parses XML string and returns a result object.

##### Parameters

###### xmlString

`string`

The XML string to parse.

##### Returns

`ParseResult`\<\{\[`key`: `string`\]: `unknown`; `rootElement`: `string`; \}\>

An object with success flag and parsed data.

***

### persistentMemory

> **persistentMemory**: `object` = `cbpersistentMemory`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:183](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L183)

#### create()

> **create**: (`config`) => `Promise`\<[`PersistentMemoryResponse`](../interfaces/PersistentMemoryResponse.md)\>

Create a new persistent memory configuration

##### Parameters

###### config

[`CreatePersistentMemoryParams`](../interfaces/CreatePersistentMemoryParams.md)

Memory configuration

##### Returns

`Promise`\<[`PersistentMemoryResponse`](../interfaces/PersistentMemoryResponse.md)\>

#### delete()

> **delete**: (`memoryId`) => `Promise`\<[`PersistentMemoryResponse`](../interfaces/PersistentMemoryResponse.md)\>

Delete a persistent memory

##### Parameters

###### memoryId

`string`

Memory ID

##### Returns

`Promise`\<[`PersistentMemoryResponse`](../interfaces/PersistentMemoryResponse.md)\>

#### executeRetrieval()

> **executeRetrieval**: (`memoryId`, `intent`) => `Promise`\<[`PersistentMemoryExecuteResponse`](../interfaces/PersistentMemoryExecuteResponse.md)\>

Execute memory retrieval pipeline

##### Parameters

###### memoryId

`string`

Memory ID

###### intent

[`PipelineExecutionIntent`](../interfaces/PipelineExecutionIntent.md)

Execution intent with context

##### Returns

`Promise`\<[`PersistentMemoryExecuteResponse`](../interfaces/PersistentMemoryExecuteResponse.md)\>

#### get()

> **get**: (`memoryId`) => `Promise`\<[`PersistentMemoryResponse`](../interfaces/PersistentMemoryResponse.md)\>

Get a persistent memory by ID

##### Parameters

###### memoryId

`string`

Memory ID

##### Returns

`Promise`\<[`PersistentMemoryResponse`](../interfaces/PersistentMemoryResponse.md)\>

#### getStepSpecs()

> **getStepSpecs**: () => `Promise`\<[`PersistentMemoryStepSpecsResponse`](../interfaces/PersistentMemoryStepSpecsResponse.md)\>

Get available step specifications

##### Returns

`Promise`\<[`PersistentMemoryStepSpecsResponse`](../interfaces/PersistentMemoryStepSpecsResponse.md)\>

#### list()

> **list**: (`filters?`) => `Promise`\<[`PersistentMemoryListResponse`](../interfaces/PersistentMemoryListResponse.md)\>

List persistent memories

##### Parameters

###### filters?

[`ListPersistentMemoryParams`](../interfaces/ListPersistentMemoryParams.md)

Optional filters

##### Returns

`Promise`\<[`PersistentMemoryListResponse`](../interfaces/PersistentMemoryListResponse.md)\>

#### update()

> **update**: (`memoryId`, `updates`) => `Promise`\<[`PersistentMemoryResponse`](../interfaces/PersistentMemoryResponse.md)\>

Update a persistent memory

##### Parameters

###### memoryId

`string`

Memory ID

###### updates

[`UpdatePersistentMemoryParams`](../interfaces/UpdatePersistentMemoryParams.md)

Update parameters

##### Returns

`Promise`\<[`PersistentMemoryResponse`](../interfaces/PersistentMemoryResponse.md)\>

#### validate()

> **validate**: (`memory`) => `Promise`\<[`PersistentMemoryValidateResponse`](../interfaces/PersistentMemoryValidateResponse.md)\>

Validate a memory configuration

##### Parameters

###### memory

[`CreatePersistentMemoryParams`](../interfaces/CreatePersistentMemoryParams.md)

Memory configuration to validate

##### Returns

`Promise`\<[`PersistentMemoryValidateResponse`](../interfaces/PersistentMemoryValidateResponse.md)\>

***

### project

> **project**: `object` = `cbproject`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:150](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L150)

#### getEditorFileStatus()

> **getEditorFileStatus**: () => `Promise`\<`any`\>

##### Returns

`Promise`\<`any`\>

#### getProjectPath()

> **getProjectPath**: () => `Promise`\<`GetProjectPathResponse`\>

Retrieves the path of the current project.

##### Returns

`Promise`\<`GetProjectPathResponse`\>

A promise that resolves with the project path response.

#### getProjectSettings()

> **getProjectSettings**: () => `Promise`\<`GetProjectSettingsResponse`\>

Retrieves the project settings from the server.

##### Returns

`Promise`\<`GetProjectSettingsResponse`\>

A promise that resolves with the project settings response.

#### getRepoMap()

> **getRepoMap**: (`message`) => `Promise`\<`GetProjectPathResponse`\>

##### Parameters

###### message

`any`

##### Returns

`Promise`\<`GetProjectPathResponse`\>

#### runProject()

> **runProject**: () => `void`

##### Returns

`void`

***

### projectStructure

> **projectStructure**: `object` = `cbprojectStructure`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:177](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L177)

#### addCommand()

> **addCommand**: (`packageId`, `command`, `workspacePath?`) => `Promise`\<[`ProjectStructureUpdateResponse`](../interfaces/ProjectStructureUpdateResponse.md)\>

Add a run command to a package

##### Parameters

###### packageId

`string`

###### command

`Omit`\<[`RunCommand`](../interfaces/RunCommand.md), `"id"`\>

###### workspacePath?

`string`

##### Returns

`Promise`\<[`ProjectStructureUpdateResponse`](../interfaces/ProjectStructureUpdateResponse.md)\>

#### addDependency()

> **addDependency**: (`packageId`, `dependency`, `workspacePath?`) => `Promise`\<[`ProjectStructureUpdateResponse`](../interfaces/ProjectStructureUpdateResponse.md)\>

Add a dependency to a package

##### Parameters

###### packageId

`string`

###### dependency

`Omit`\<[`Dependency`](../interfaces/Dependency.md), `"id"`\>

###### workspacePath?

`string`

##### Returns

`Promise`\<[`ProjectStructureUpdateResponse`](../interfaces/ProjectStructureUpdateResponse.md)\>

#### addDeployment()

> **addDeployment**: (`packageId`, `config`, `workspacePath?`) => `Promise`\<[`ProjectStructureUpdateResponse`](../interfaces/ProjectStructureUpdateResponse.md)\>

Add a deployment config to a package

##### Parameters

###### packageId

`string`

###### config

`Omit`\<[`DeploymentConfig`](../interfaces/DeploymentConfig.md), `"id"`\>

###### workspacePath?

`string`

##### Returns

`Promise`\<[`ProjectStructureUpdateResponse`](../interfaces/ProjectStructureUpdateResponse.md)\>

#### addRoute()

> **addRoute**: (`packageId`, `route`, `workspacePath?`) => `Promise`\<[`ProjectStructureUpdateResponse`](../interfaces/ProjectStructureUpdateResponse.md)\>

Add an API route to a package

##### Parameters

###### packageId

`string`

###### route

`Omit`\<[`ApiRoute`](../interfaces/ApiRoute.md), `"id"`\>

###### workspacePath?

`string`

##### Returns

`Promise`\<[`ProjectStructureUpdateResponse`](../interfaces/ProjectStructureUpdateResponse.md)\>

#### addTable()

> **addTable**: (`packageId`, `table`, `workspacePath?`) => `Promise`\<[`ProjectStructureUpdateResponse`](../interfaces/ProjectStructureUpdateResponse.md)\>

Add a database table to a package

##### Parameters

###### packageId

`string`

###### table

`Omit`\<[`DatabaseTable`](../interfaces/DatabaseTable.md), `"id"`\>

###### workspacePath?

`string`

##### Returns

`Promise`\<[`ProjectStructureUpdateResponse`](../interfaces/ProjectStructureUpdateResponse.md)\>

#### addUiRoute()

> **addUiRoute**: (`packageId`, `route`, `workspacePath?`) => `Promise`\<[`ProjectStructureUpdateResponse`](../interfaces/ProjectStructureUpdateResponse.md)\>

Add a UI route to a package

##### Parameters

###### packageId

`string`

###### route

`Omit`\<[`UiRoute`](../interfaces/UiRoute.md), `"id"`\>

###### workspacePath?

`string`

##### Returns

`Promise`\<[`ProjectStructureUpdateResponse`](../interfaces/ProjectStructureUpdateResponse.md)\>

#### createPackage()

> **createPackage**: (`data`, `workspacePath?`) => `Promise`\<[`ProjectStructurePackageResponse`](../interfaces/ProjectStructurePackageResponse.md)\>

Create a new package

##### Parameters

###### data

[`CreatePackageData`](../interfaces/CreatePackageData.md)

###### workspacePath?

`string`

##### Returns

`Promise`\<[`ProjectStructurePackageResponse`](../interfaces/ProjectStructurePackageResponse.md)\>

#### deleteCommand()

> **deleteCommand**: (`packageId`, `commandId`, `workspacePath?`) => `Promise`\<[`ProjectStructureDeleteResponse`](../interfaces/ProjectStructureDeleteResponse.md)\>

Delete a run command

##### Parameters

###### packageId

`string`

###### commandId

`string`

###### workspacePath?

`string`

##### Returns

`Promise`\<[`ProjectStructureDeleteResponse`](../interfaces/ProjectStructureDeleteResponse.md)\>

#### deleteDependency()

> **deleteDependency**: (`packageId`, `dependencyId`, `workspacePath?`) => `Promise`\<[`ProjectStructureDeleteResponse`](../interfaces/ProjectStructureDeleteResponse.md)\>

Delete a dependency

##### Parameters

###### packageId

`string`

###### dependencyId

`string`

###### workspacePath?

`string`

##### Returns

`Promise`\<[`ProjectStructureDeleteResponse`](../interfaces/ProjectStructureDeleteResponse.md)\>

#### deleteDeployment()

> **deleteDeployment**: (`packageId`, `configId`, `workspacePath?`) => `Promise`\<[`ProjectStructureDeleteResponse`](../interfaces/ProjectStructureDeleteResponse.md)\>

Delete a deployment config

##### Parameters

###### packageId

`string`

###### configId

`string`

###### workspacePath?

`string`

##### Returns

`Promise`\<[`ProjectStructureDeleteResponse`](../interfaces/ProjectStructureDeleteResponse.md)\>

#### deletePackage()

> **deletePackage**: (`packageId`, `workspacePath?`) => `Promise`\<[`ProjectStructureDeleteResponse`](../interfaces/ProjectStructureDeleteResponse.md)\>

Delete a package

##### Parameters

###### packageId

`string`

###### workspacePath?

`string`

##### Returns

`Promise`\<[`ProjectStructureDeleteResponse`](../interfaces/ProjectStructureDeleteResponse.md)\>

#### deleteRoute()

> **deleteRoute**: (`packageId`, `routeId`, `workspacePath?`) => `Promise`\<[`ProjectStructureDeleteResponse`](../interfaces/ProjectStructureDeleteResponse.md)\>

Delete an API route

##### Parameters

###### packageId

`string`

###### routeId

`string`

###### workspacePath?

`string`

##### Returns

`Promise`\<[`ProjectStructureDeleteResponse`](../interfaces/ProjectStructureDeleteResponse.md)\>

#### deleteTable()

> **deleteTable**: (`packageId`, `tableId`, `workspacePath?`) => `Promise`\<[`ProjectStructureDeleteResponse`](../interfaces/ProjectStructureDeleteResponse.md)\>

Delete a database table

##### Parameters

###### packageId

`string`

###### tableId

`string`

###### workspacePath?

`string`

##### Returns

`Promise`\<[`ProjectStructureDeleteResponse`](../interfaces/ProjectStructureDeleteResponse.md)\>

#### deleteUiRoute()

> **deleteUiRoute**: (`packageId`, `routeId`, `workspacePath?`) => `Promise`\<[`ProjectStructureDeleteResponse`](../interfaces/ProjectStructureDeleteResponse.md)\>

Delete a UI route

##### Parameters

###### packageId

`string`

###### routeId

`string`

###### workspacePath?

`string`

##### Returns

`Promise`\<[`ProjectStructureDeleteResponse`](../interfaces/ProjectStructureDeleteResponse.md)\>

#### getMetadata()

> **getMetadata**: (`workspacePath?`) => `Promise`\<[`ProjectStructureMetadataResponse`](../interfaces/ProjectStructureMetadataResponse.md)\>

Get complete project metadata

##### Parameters

###### workspacePath?

`string`

##### Returns

`Promise`\<[`ProjectStructureMetadataResponse`](../interfaces/ProjectStructureMetadataResponse.md)\>

#### getPackage()

> **getPackage**: (`packageId`, `workspacePath?`) => `Promise`\<[`ProjectStructurePackageResponse`](../interfaces/ProjectStructurePackageResponse.md)\>

Get a specific package by ID

##### Parameters

###### packageId

`string`

###### workspacePath?

`string`

##### Returns

`Promise`\<[`ProjectStructurePackageResponse`](../interfaces/ProjectStructurePackageResponse.md)\>

#### getPackages()

> **getPackages**: (`workspacePath?`) => `Promise`\<[`ProjectStructurePackagesResponse`](../interfaces/ProjectStructurePackagesResponse.md)\>

Get all packages in the workspace

##### Parameters

###### workspacePath?

`string`

##### Returns

`Promise`\<[`ProjectStructurePackagesResponse`](../interfaces/ProjectStructurePackagesResponse.md)\>

#### updateCommand()

> **updateCommand**: (`packageId`, `commandId`, `updates`, `workspacePath?`) => `Promise`\<[`ProjectStructureUpdateResponse`](../interfaces/ProjectStructureUpdateResponse.md)\>

Update a run command

##### Parameters

###### packageId

`string`

###### commandId

`string`

###### updates

`Partial`\<[`RunCommand`](../interfaces/RunCommand.md)\>

###### workspacePath?

`string`

##### Returns

`Promise`\<[`ProjectStructureUpdateResponse`](../interfaces/ProjectStructureUpdateResponse.md)\>

#### updateDependency()

> **updateDependency**: (`packageId`, `dependencyId`, `updates`, `workspacePath?`) => `Promise`\<[`ProjectStructureUpdateResponse`](../interfaces/ProjectStructureUpdateResponse.md)\>

Update a dependency

##### Parameters

###### packageId

`string`

###### dependencyId

`string`

###### updates

`Partial`\<[`Dependency`](../interfaces/Dependency.md)\>

###### workspacePath?

`string`

##### Returns

`Promise`\<[`ProjectStructureUpdateResponse`](../interfaces/ProjectStructureUpdateResponse.md)\>

#### updateDeployment()

> **updateDeployment**: (`packageId`, `configId`, `updates`, `workspacePath?`) => `Promise`\<[`ProjectStructureUpdateResponse`](../interfaces/ProjectStructureUpdateResponse.md)\>

Update a deployment config

##### Parameters

###### packageId

`string`

###### configId

`string`

###### updates

`Partial`\<[`DeploymentConfig`](../interfaces/DeploymentConfig.md)\>

###### workspacePath?

`string`

##### Returns

`Promise`\<[`ProjectStructureUpdateResponse`](../interfaces/ProjectStructureUpdateResponse.md)\>

#### updateDesignGuidelines()

> **updateDesignGuidelines**: (`packageId`, `guidelines`, `workspacePath?`) => `Promise`\<[`ProjectStructureUpdateResponse`](../interfaces/ProjectStructureUpdateResponse.md)\>

Update design guidelines for a package

##### Parameters

###### packageId

`string`

###### guidelines

[`DesignGuidelines`](../interfaces/DesignGuidelines.md)

###### workspacePath?

`string`

##### Returns

`Promise`\<[`ProjectStructureUpdateResponse`](../interfaces/ProjectStructureUpdateResponse.md)\>

#### updateFrontendFramework()

> **updateFrontendFramework**: (`packageId`, `framework`, `workspacePath?`) => `Promise`\<[`ProjectStructureUpdateResponse`](../interfaces/ProjectStructureUpdateResponse.md)\>

Update frontend framework for a package

##### Parameters

###### packageId

`string`

###### framework

[`FrameworkInfo`](../interfaces/FrameworkInfo.md)

###### workspacePath?

`string`

##### Returns

`Promise`\<[`ProjectStructureUpdateResponse`](../interfaces/ProjectStructureUpdateResponse.md)\>

#### updateGit()

> **updateGit**: (`gitInfo`, `workspacePath?`) => `Promise`\<[`ProjectStructureUpdateResponse`](../interfaces/ProjectStructureUpdateResponse.md)\>

Update git information

##### Parameters

###### gitInfo

[`GitInfo`](../interfaces/GitInfo.md)

###### workspacePath?

`string`

##### Returns

`Promise`\<[`ProjectStructureUpdateResponse`](../interfaces/ProjectStructureUpdateResponse.md)\>

#### updateMetadata()

> **updateMetadata**: (`updates`, `workspacePath?`) => `Promise`\<[`ProjectStructureUpdateResponse`](../interfaces/ProjectStructureUpdateResponse.md)\>

Update workspace metadata

##### Parameters

###### updates

`Record`\<`string`, `any`\>

###### workspacePath?

`string`

##### Returns

`Promise`\<[`ProjectStructureUpdateResponse`](../interfaces/ProjectStructureUpdateResponse.md)\>

#### updatePackage()

> **updatePackage**: (`packageId`, `updates`, `workspacePath?`) => `Promise`\<[`ProjectStructurePackageResponse`](../interfaces/ProjectStructurePackageResponse.md)\>

Update a package

##### Parameters

###### packageId

`string`

###### updates

[`UpdatePackageData`](../interfaces/UpdatePackageData.md)

###### workspacePath?

`string`

##### Returns

`Promise`\<[`ProjectStructurePackageResponse`](../interfaces/ProjectStructurePackageResponse.md)\>

#### updateRoute()

> **updateRoute**: (`packageId`, `routeId`, `updates`, `workspacePath?`) => `Promise`\<[`ProjectStructureUpdateResponse`](../interfaces/ProjectStructureUpdateResponse.md)\>

Update an API route

##### Parameters

###### packageId

`string`

###### routeId

`string`

###### updates

`Partial`\<[`ApiRoute`](../interfaces/ApiRoute.md)\>

###### workspacePath?

`string`

##### Returns

`Promise`\<[`ProjectStructureUpdateResponse`](../interfaces/ProjectStructureUpdateResponse.md)\>

#### updateSection()

> **updateSection**: (`packageId`, `section`, `sectionData`, `workspacePath?`) => `Promise`\<[`ProjectStructureUpdateResponse`](../interfaces/ProjectStructureUpdateResponse.md)\>

Update a specific section of a package

##### Parameters

###### packageId

`string`

###### section

`string`

###### sectionData

`any`

###### workspacePath?

`string`

##### Returns

`Promise`\<[`ProjectStructureUpdateResponse`](../interfaces/ProjectStructureUpdateResponse.md)\>

#### updateTable()

> **updateTable**: (`packageId`, `tableId`, `updates`, `workspacePath?`) => `Promise`\<[`ProjectStructureUpdateResponse`](../interfaces/ProjectStructureUpdateResponse.md)\>

Update a database table

##### Parameters

###### packageId

`string`

###### tableId

`string`

###### updates

`Partial`\<[`DatabaseTable`](../interfaces/DatabaseTable.md)\>

###### workspacePath?

`string`

##### Returns

`Promise`\<[`ProjectStructureUpdateResponse`](../interfaces/ProjectStructureUpdateResponse.md)\>

#### updateUiRoute()

> **updateUiRoute**: (`packageId`, `routeId`, `updates`, `workspacePath?`) => `Promise`\<[`ProjectStructureUpdateResponse`](../interfaces/ProjectStructureUpdateResponse.md)\>

Update a UI route

##### Parameters

###### packageId

`string`

###### routeId

`string`

###### updates

`Partial`\<[`UiRoute`](../interfaces/UiRoute.md)\>

###### workspacePath?

`string`

##### Returns

`Promise`\<[`ProjectStructureUpdateResponse`](../interfaces/ProjectStructureUpdateResponse.md)\>

***

### projectStructureUpdateRequest

> **projectStructureUpdateRequest**: `object` = `cbprojectStructureUpdateRequest`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:180](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L180)

#### addComment()

> **addComment**: (`id`, `disputeId`, `data`, `workspacePath?`) => `Promise`\<`UpdateRequestResponse`\>

Add a comment

##### Parameters

###### id

`string`

###### disputeId

`string`

###### data

`AddCommentData`

###### workspacePath?

`string`

##### Returns

`Promise`\<`UpdateRequestResponse`\>

#### addDispute()

> **addDispute**: (`id`, `data`, `workspacePath?`) => `Promise`\<`UpdateRequestResponse`\>

Add a dispute

##### Parameters

###### id

`string`

###### data

`CreateDisputeData`

###### workspacePath?

`string`

##### Returns

`Promise`\<`UpdateRequestResponse`\>

#### complete()

> **complete**: (`id`, `workspacePath?`) => `Promise`\<`UpdateRequestResponse`\>

Complete work on an update request

##### Parameters

###### id

`string`

###### workspacePath?

`string`

##### Returns

`Promise`\<`UpdateRequestResponse`\>

#### create()

> **create**: (`data`, `workspacePath?`) => `Promise`\<`UpdateRequestResponse`\>

Create a new update request

##### Parameters

###### data

`CreateUpdateRequestData`

###### workspacePath?

`string`

##### Returns

`Promise`\<`UpdateRequestResponse`\>

#### delete()

> **delete**: (`id`, `workspacePath?`) => `Promise`\<`UpdateRequestResponse`\>

Delete an update request

##### Parameters

###### id

`string`

###### workspacePath?

`string`

##### Returns

`Promise`\<`UpdateRequestResponse`\>

#### get()

> **get**: (`id`, `workspacePath?`) => `Promise`\<`UpdateRequestResponse`\>

Get an update request by ID

##### Parameters

###### id

`string`

###### workspacePath?

`string`

##### Returns

`Promise`\<`UpdateRequestResponse`\>

#### list()

> **list**: (`filters?`, `workspacePath?`) => `Promise`\<`UpdateRequestListResponse`\>

List update requests

##### Parameters

###### filters?

`UpdateRequestFilters`

###### workspacePath?

`string`

##### Returns

`Promise`\<`UpdateRequestListResponse`\>

#### merge()

> **merge**: (`id`, `workspacePath?`) => `Promise`\<`UpdateRequestResponse`\>

Merge an update request

##### Parameters

###### id

`string`

###### workspacePath?

`string`

##### Returns

`Promise`\<`UpdateRequestResponse`\>

#### resolveDispute()

> **resolveDispute**: (`id`, `disputeId`, `resolutionSummary?`, `workspacePath?`) => `Promise`\<`UpdateRequestResponse`\>

Resolve a dispute

##### Parameters

###### id

`string`

###### disputeId

`string`

###### resolutionSummary?

`string`

###### workspacePath?

`string`

##### Returns

`Promise`\<`UpdateRequestResponse`\>

#### startWork()

> **startWork**: (`id`, `workspacePath?`) => `Promise`\<`UpdateRequestResponse`\>

Start working on an update request

##### Parameters

###### id

`string`

###### workspacePath?

`string`

##### Returns

`Promise`\<`UpdateRequestResponse`\>

#### submit()

> **submit**: (`id`, `workspacePath?`) => `Promise`\<`UpdateRequestResponse`\>

Submit an update request for review

##### Parameters

###### id

`string`

###### workspacePath?

`string`

##### Returns

`Promise`\<`UpdateRequestResponse`\>

#### unwatch()

> **unwatch**: (`id`, `watcherId`, `workspacePath?`) => `Promise`\<`UpdateRequestResponse`\>

Stop watching an update request

##### Parameters

###### id

`string`

###### watcherId

`string`

###### workspacePath?

`string`

##### Returns

`Promise`\<`UpdateRequestResponse`\>

#### update()

> **update**: (`id`, `updates`, `workspacePath?`) => `Promise`\<`UpdateRequestResponse`\>

Update an existing update request

##### Parameters

###### id

`string`

###### updates

`UpdateUpdateRequestData`

###### workspacePath?

`string`

##### Returns

`Promise`\<`UpdateRequestResponse`\>

#### watch()

> **watch**: (`id`, `data`, `workspacePath?`) => `Promise`\<`UpdateRequestResponse`\>

Watch an update request

##### Parameters

###### id

`string`

###### data

`AddWatcherData`

###### workspacePath?

`string`

##### Returns

`Promise`\<`UpdateRequestResponse`\>

***

### rag

> **rag**: `object` = `cbrag`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:148](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L148)

#### add\_file()

> **add\_file**: (`filename`, `file_path`) => `void`

Adds a file to the CodeBolt File System.

##### Parameters

###### filename

`string`

The name of the file to add.

###### file\_path

`string`

The path where the file should be added.

##### Returns

`void`

#### init()

> **init**: () => `void`

Initializes the CodeBolt File System Module.

##### Returns

`void`

#### retrieve\_related\_knowledge()

> **retrieve\_related\_knowledge**: (`query`, `filename`) => `void`

Retrieves related knowledge for a given query and filename.

##### Parameters

###### query

`string`

The query to retrieve related knowledge for.

###### filename

`string`

The name of the file associated with the query.

##### Returns

`void`

***

### readyHandlers

> `private` **readyHandlers**: () => `void` \| `Promise`\<`void`\>[] = `[]`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:75](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L75)

#### Returns

`void` \| `Promise`\<`void`\>

***

### readyPromise

> `private` **readyPromise**: `Promise`\<`void`\>

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:74](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L74)

***

### requirementPlan

> **requirementPlan**: `object` = `cbrequirementPlan`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:171](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L171)

#### addSection()

> **addSection**: (`filePath`, `section`, `afterIndex?`) => `Promise`\<[`RequirementPlanSectionResponse`](../interfaces/RequirementPlanSectionResponse.md)\>

Add a section to a requirement plan

##### Parameters

###### filePath

`string`

Path to the plan file

###### section

`Omit`\<[`RequirementPlanSection`](../interfaces/RequirementPlanSection.md), `"id"` \| `"order"`\>

Section data to add

###### afterIndex?

`number`

Optional index to insert after (-1 for beginning)

##### Returns

`Promise`\<[`RequirementPlanSectionResponse`](../interfaces/RequirementPlanSectionResponse.md)\>

Promise resolving to updated document

#### create()

> **create**: (`fileName`) => `Promise`\<[`RequirementPlanCreateResponse`](../interfaces/RequirementPlanCreateResponse.md)\>

Create a new requirement plan file

##### Parameters

###### fileName

`string`

Name for the new plan file (without .plan extension)

##### Returns

`Promise`\<[`RequirementPlanCreateResponse`](../interfaces/RequirementPlanCreateResponse.md)\>

Promise resolving to creation result with file path

#### get()

> **get**: (`filePath`) => `Promise`\<[`RequirementPlanGetResponse`](../interfaces/RequirementPlanGetResponse.md)\>

Get a requirement plan by file path

##### Parameters

###### filePath

`string`

Path to the plan file

##### Returns

`Promise`\<[`RequirementPlanGetResponse`](../interfaces/RequirementPlanGetResponse.md)\>

Promise resolving to the plan document

#### list()

> **list**: () => `Promise`\<[`RequirementPlanListResponse`](../interfaces/RequirementPlanListResponse.md)\>

List all requirement plans in the project

##### Returns

`Promise`\<[`RequirementPlanListResponse`](../interfaces/RequirementPlanListResponse.md)\>

Promise resolving to list of plans

#### removeSection()

> **removeSection**: (`filePath`, `sectionId`) => `Promise`\<[`RequirementPlanSectionResponse`](../interfaces/RequirementPlanSectionResponse.md)\>

Remove a section from a requirement plan

##### Parameters

###### filePath

`string`

Path to the plan file

###### sectionId

`string`

ID of the section to remove

##### Returns

`Promise`\<[`RequirementPlanSectionResponse`](../interfaces/RequirementPlanSectionResponse.md)\>

Promise resolving to updated document

#### reorderSections()

> **reorderSections**: (`filePath`, `sectionIds`) => `Promise`\<[`RequirementPlanSectionResponse`](../interfaces/RequirementPlanSectionResponse.md)\>

Reorder sections in a requirement plan

##### Parameters

###### filePath

`string`

Path to the plan file

###### sectionIds

`string`[]

Array of section IDs in new order

##### Returns

`Promise`\<[`RequirementPlanSectionResponse`](../interfaces/RequirementPlanSectionResponse.md)\>

Promise resolving to updated document

#### review()

> **review**: (`filePath`) => `Promise`\<`RequirementPlanReviewResponse`\>

Request a review for a requirement plan

##### Parameters

###### filePath

`string`

Path to the plan file

##### Returns

`Promise`\<`RequirementPlanReviewResponse`\>

Promise resolving to review status

#### update()

> **update**: (`filePath`, `content`) => `Promise`\<[`RequirementPlanUpdateResponse`](../interfaces/RequirementPlanUpdateResponse.md)\>

Update a requirement plan

##### Parameters

###### filePath

`string`

Path to the plan file

###### content

New content (string or RequirementPlanDocument)

`string` | [`RequirementPlanDocument`](../interfaces/RequirementPlanDocument.md)

##### Returns

`Promise`\<[`RequirementPlanUpdateResponse`](../interfaces/RequirementPlanUpdateResponse.md)\>

Promise resolving to update result

#### updateSection()

> **updateSection**: (`filePath`, `sectionId`, `updates`) => `Promise`\<[`RequirementPlanSectionResponse`](../interfaces/RequirementPlanSectionResponse.md)\>

Update a section in a requirement plan

##### Parameters

###### filePath

`string`

Path to the plan file

###### sectionId

`string`

ID of the section to update

###### updates

`Partial`\<[`RequirementPlanSection`](../interfaces/RequirementPlanSection.md)\>

Partial section data to update

##### Returns

`Promise`\<[`RequirementPlanSectionResponse`](../interfaces/RequirementPlanSectionResponse.md)\>

Promise resolving to updated document

***

### reviewMergeRequest

> **reviewMergeRequest**: `object` = `cbreviewMergeRequest`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:181](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L181)

#### addLinkedJob()

> **addLinkedJob**: (`id`, `jobId`) => `Promise`\<\{ `request`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md); \}\>

Add linked job

##### Parameters

###### id

`string`

###### jobId

`string`

##### Returns

`Promise`\<\{ `request`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md); \}\>

#### addReview()

> **addReview**: (`id`, `feedback`) => `Promise`\<\{ `request`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md); \}\>

Add review feedback

##### Parameters

###### id

`string`

###### feedback

[`AddReviewFeedback`](../interfaces/AddReviewFeedback.md)

##### Returns

`Promise`\<\{ `request`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md); \}\>

#### byAgent()

> **byAgent**: (`agentId`) => `Promise`\<\{ `requests`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md)[]; `totalCount`: `number`; \}\>

Get requests by agent

##### Parameters

###### agentId

`string`

##### Returns

`Promise`\<\{ `requests`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md)[]; `totalCount`: `number`; \}\>

#### bySwarm()

> **bySwarm**: (`swarmId`) => `Promise`\<\{ `requests`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md)[]; `totalCount`: `number`; \}\>

Get requests by swarm

##### Parameters

###### swarmId

`string`

##### Returns

`Promise`\<\{ `requests`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md)[]; `totalCount`: `number`; \}\>

#### create()

> **create**: (`data`) => `Promise`\<\{ `request`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md); \}\>

Create a new review merge request

##### Parameters

###### data

[`CreateReviewMergeRequest`](../interfaces/CreateReviewMergeRequest.md)

##### Returns

`Promise`\<\{ `request`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md); \}\>

#### delete()

> **delete**: (`id`) => `Promise`\<\{ `deleted`: `boolean`; \}\>

Delete a review merge request

##### Parameters

###### id

`string`

##### Returns

`Promise`\<\{ `deleted`: `boolean`; \}\>

#### get()

> **get**: (`id`) => `Promise`\<\{ `request`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md); \}\>

Get a single review merge request

##### Parameters

###### id

`string`

##### Returns

`Promise`\<\{ `request`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md); \}\>

#### list()

> **list**: (`filters`) => `Promise`\<\{ `requests`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md)[]; `totalCount`: `number`; \}\>

List review merge requests

##### Parameters

###### filters

[`ReviewMergeRequestFilters`](../interfaces/ReviewMergeRequestFilters.md) = `{}`

##### Returns

`Promise`\<\{ `requests`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md)[]; `totalCount`: `number`; \}\>

#### merge()

> **merge**: (`id`, `mergedBy`) => `Promise`\<\{ `result`: [`MergeResult`](../interfaces/MergeResult.md); \}\>

Merge request

##### Parameters

###### id

`string`

###### mergedBy

`string`

##### Returns

`Promise`\<\{ `result`: [`MergeResult`](../interfaces/MergeResult.md); \}\>

#### pending()

> **pending**: () => `Promise`\<\{ `requests`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md)[]; `totalCount`: `number`; \}\>

Get pending reviews

##### Returns

`Promise`\<\{ `requests`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md)[]; `totalCount`: `number`; \}\>

#### readyToMerge()

> **readyToMerge**: () => `Promise`\<\{ `requests`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md)[]; `totalCount`: `number`; \}\>

Get ready to merge requests

##### Returns

`Promise`\<\{ `requests`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md)[]; `totalCount`: `number`; \}\>

#### removeLinkedJob()

> **removeLinkedJob**: (`id`, `jobId`) => `Promise`\<\{ `request`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md); \}\>

Remove linked job

##### Parameters

###### id

`string`

###### jobId

`string`

##### Returns

`Promise`\<\{ `request`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md); \}\>

#### statistics()

> **statistics**: () => `Promise`\<\{ `statistics`: `any`; \}\>

Get statistics

##### Returns

`Promise`\<\{ `statistics`: `any`; \}\>

#### update()

> **update**: (`id`, `data`) => `Promise`\<\{ `request`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md); \}\>

Update an existing review merge request

##### Parameters

###### id

`string`

###### data

[`UpdateReviewMergeRequest`](../interfaces/UpdateReviewMergeRequest.md)

##### Returns

`Promise`\<\{ `request`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md); \}\>

#### updateStatus()

> **updateStatus**: (`id`, `status`) => `Promise`\<\{ `request`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md); \}\>

Update status

##### Parameters

###### id

`string`

###### status

[`ReviewRequestStatus`](../type-aliases/ReviewRequestStatus.md)

##### Returns

`Promise`\<\{ `request`: [`ReviewMergeRequest`](../interfaces/ReviewMergeRequest.md); \}\>

***

### roadmap

> **roadmap**: `object` = `cbroadmap`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:175](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L175)

#### createFeature()

> **createFeature**: (`phaseId`, `data`, `projectPath?`) => `Promise`\<[`RoadmapFeatureResponse`](../interfaces/RoadmapFeatureResponse.md)\>

Create a new feature in a phase

##### Parameters

###### phaseId

`string`

###### data

[`CreateFeatureData`](../interfaces/CreateFeatureData.md)

###### projectPath?

`string`

##### Returns

`Promise`\<[`RoadmapFeatureResponse`](../interfaces/RoadmapFeatureResponse.md)\>

#### createIdea()

> **createIdea**: (`data`, `projectPath?`) => `Promise`\<[`RoadmapIdeaResponse`](../interfaces/RoadmapIdeaResponse.md)\>

Create a new idea

##### Parameters

###### data

[`CreateIdeaData`](../interfaces/CreateIdeaData.md)

###### projectPath?

`string`

##### Returns

`Promise`\<[`RoadmapIdeaResponse`](../interfaces/RoadmapIdeaResponse.md)\>

#### createPhase()

> **createPhase**: (`data`, `projectPath?`) => `Promise`\<[`RoadmapPhaseResponse`](../interfaces/RoadmapPhaseResponse.md)\>

Create a new phase in the roadmap

##### Parameters

###### data

[`CreatePhaseData`](../interfaces/CreatePhaseData.md)

###### projectPath?

`string`

##### Returns

`Promise`\<[`RoadmapPhaseResponse`](../interfaces/RoadmapPhaseResponse.md)\>

#### deleteFeature()

> **deleteFeature**: (`featureId`, `projectPath?`) => `Promise`\<[`RoadmapDeleteResponse`](../interfaces/RoadmapDeleteResponse.md)\>

Delete a feature

##### Parameters

###### featureId

`string`

###### projectPath?

`string`

##### Returns

`Promise`\<[`RoadmapDeleteResponse`](../interfaces/RoadmapDeleteResponse.md)\>

#### deleteIdea()

> **deleteIdea**: (`ideaId`, `projectPath?`) => `Promise`\<[`RoadmapDeleteResponse`](../interfaces/RoadmapDeleteResponse.md)\>

Delete an idea

##### Parameters

###### ideaId

`string`

###### projectPath?

`string`

##### Returns

`Promise`\<[`RoadmapDeleteResponse`](../interfaces/RoadmapDeleteResponse.md)\>

#### deletePhase()

> **deletePhase**: (`phaseId`, `projectPath?`) => `Promise`\<[`RoadmapDeleteResponse`](../interfaces/RoadmapDeleteResponse.md)\>

Delete a phase from the roadmap

##### Parameters

###### phaseId

`string`

###### projectPath?

`string`

##### Returns

`Promise`\<[`RoadmapDeleteResponse`](../interfaces/RoadmapDeleteResponse.md)\>

#### getAllFeatures()

> **getAllFeatures**: (`projectPath?`) => `Promise`\<[`RoadmapFeaturesResponse`](../interfaces/RoadmapFeaturesResponse.md)\>

Get all features across all phases

##### Parameters

###### projectPath?

`string`

##### Returns

`Promise`\<[`RoadmapFeaturesResponse`](../interfaces/RoadmapFeaturesResponse.md)\>

#### getFeatures()

> **getFeatures**: (`phaseId`, `projectPath?`) => `Promise`\<[`RoadmapFeaturesResponse`](../interfaces/RoadmapFeaturesResponse.md)\>

Get features in a specific phase

##### Parameters

###### phaseId

`string`

###### projectPath?

`string`

##### Returns

`Promise`\<[`RoadmapFeaturesResponse`](../interfaces/RoadmapFeaturesResponse.md)\>

#### getIdeas()

> **getIdeas**: (`projectPath?`) => `Promise`\<[`RoadmapIdeasResponse`](../interfaces/RoadmapIdeasResponse.md)\>

Get all ideas (pre-roadmap suggestions)

##### Parameters

###### projectPath?

`string`

##### Returns

`Promise`\<[`RoadmapIdeasResponse`](../interfaces/RoadmapIdeasResponse.md)\>

#### getPhases()

> **getPhases**: (`projectPath?`) => `Promise`\<[`RoadmapPhasesResponse`](../interfaces/RoadmapPhasesResponse.md)\>

Get all phases in the roadmap

##### Parameters

###### projectPath?

`string`

##### Returns

`Promise`\<[`RoadmapPhasesResponse`](../interfaces/RoadmapPhasesResponse.md)\>

#### getRoadmap()

> **getRoadmap**: (`projectPath?`) => `Promise`\<[`RoadmapGetResponse`](../interfaces/RoadmapGetResponse.md)\>

Get the complete roadmap for a project

##### Parameters

###### projectPath?

`string`

Optional project path (uses active project if not provided)

##### Returns

`Promise`\<[`RoadmapGetResponse`](../interfaces/RoadmapGetResponse.md)\>

#### moveFeature()

> **moveFeature**: (`featureId`, `data`, `projectPath?`) => `Promise`\<[`RoadmapFeatureResponse`](../interfaces/RoadmapFeatureResponse.md)\>

Move a feature to a different phase

##### Parameters

###### featureId

`string`

###### data

[`MoveFeatureData`](../interfaces/MoveFeatureData.md)

###### projectPath?

`string`

##### Returns

`Promise`\<[`RoadmapFeatureResponse`](../interfaces/RoadmapFeatureResponse.md)\>

#### moveIdeaToRoadmap()

> **moveIdeaToRoadmap**: (`ideaId`, `data`, `projectPath?`) => `Promise`\<[`RoadmapMoveToRoadmapResponse`](../interfaces/RoadmapMoveToRoadmapResponse.md)\>

Move an accepted idea to the roadmap as a feature

##### Parameters

###### ideaId

`string`

###### data

[`MoveIdeaToRoadmapData`](../interfaces/MoveIdeaToRoadmapData.md)

###### projectPath?

`string`

##### Returns

`Promise`\<[`RoadmapMoveToRoadmapResponse`](../interfaces/RoadmapMoveToRoadmapResponse.md)\>

#### reviewIdea()

> **reviewIdea**: (`ideaId`, `data`, `projectPath?`) => `Promise`\<[`RoadmapIdeaResponse`](../interfaces/RoadmapIdeaResponse.md)\>

Review an idea (accept or reject)

##### Parameters

###### ideaId

`string`

###### data

[`ReviewIdeaData`](../interfaces/ReviewIdeaData.md)

###### projectPath?

`string`

##### Returns

`Promise`\<[`RoadmapIdeaResponse`](../interfaces/RoadmapIdeaResponse.md)\>

#### updateFeature()

> **updateFeature**: (`featureId`, `data`, `projectPath?`) => `Promise`\<[`RoadmapFeatureResponse`](../interfaces/RoadmapFeatureResponse.md)\>

Update an existing feature

##### Parameters

###### featureId

`string`

###### data

[`UpdateFeatureData`](../interfaces/UpdateFeatureData.md)

###### projectPath?

`string`

##### Returns

`Promise`\<[`RoadmapFeatureResponse`](../interfaces/RoadmapFeatureResponse.md)\>

#### updateIdea()

> **updateIdea**: (`ideaId`, `data`, `projectPath?`) => `Promise`\<[`RoadmapIdeaResponse`](../interfaces/RoadmapIdeaResponse.md)\>

Update an existing idea

##### Parameters

###### ideaId

`string`

###### data

[`UpdateIdeaData`](../interfaces/UpdateIdeaData.md)

###### projectPath?

`string`

##### Returns

`Promise`\<[`RoadmapIdeaResponse`](../interfaces/RoadmapIdeaResponse.md)\>

#### updatePhase()

> **updatePhase**: (`phaseId`, `data`, `projectPath?`) => `Promise`\<[`RoadmapPhaseResponse`](../interfaces/RoadmapPhaseResponse.md)\>

Update an existing phase

##### Parameters

###### phaseId

`string`

###### data

[`UpdatePhaseData`](../interfaces/UpdatePhaseData.md)

###### projectPath?

`string`

##### Returns

`Promise`\<[`RoadmapPhaseResponse`](../interfaces/RoadmapPhaseResponse.md)\>

***

### search

> **search**: `object` = `cbsearch`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:146](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L146)

#### get\_first\_link()

> **get\_first\_link**: (`query`) => `Promise`\<`string`\>

Retrieves the first link from the search results for the given query.

##### Parameters

###### query

`string`

The search query.

##### Returns

`Promise`\<`string`\>

A promise that resolves with the first link of the search results.

#### init()

> **init**: (`engine?`) => `void`

Initializes the search module with the specified search engine.

##### Parameters

###### engine?

`string` = `"bing"`

The search engine to use for initializing the module.

##### Returns

`void`

#### search()

> **search**: (`query`) => `Promise`\<`string`\>

Performs a search operation for the given query.

##### Parameters

###### query

`string`

The search query.

##### Returns

`Promise`\<`string`\>

A promise that resolves with the search results.

***

### sideExecution

> **sideExecution**: `object` = `cbsideExecution`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:166](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L166)

#### getStatus()

> **getStatus**: (`sideExecutionId`) => `Promise`\<[`GetSideExecutionStatusResponse`](../interfaces/GetSideExecutionStatusResponse.md)\>

Get the status of a side execution

##### Parameters

###### sideExecutionId

`string`

ID of the side execution

##### Returns

`Promise`\<[`GetSideExecutionStatusResponse`](../interfaces/GetSideExecutionStatusResponse.md)\>

Promise resolving to execution status

#### listActionBlocks()

> **listActionBlocks**: (`projectPath?`) => `Promise`\<[`ListActionBlocksResponse`](../interfaces/ListActionBlocksResponse.md)\>

List all available ActionBlocks

##### Parameters

###### projectPath?

`string`

Optional project path to search for ActionBlocks

##### Returns

`Promise`\<[`ListActionBlocksResponse`](../interfaces/ListActionBlocksResponse.md)\>

Promise resolving to list of ActionBlocks

#### startWithActionBlock()

> **startWithActionBlock**: (`actionBlockPath`, `params?`, `timeout?`) => `Promise`\<[`StartSideExecutionResponse`](../interfaces/StartSideExecutionResponse.md)\>

Start a side execution with an ActionBlock path

##### Parameters

###### actionBlockPath

`string`

Path to the ActionBlock directory

###### params?

`Record`\<`string`, `any`\>

Additional parameters to pass to the ActionBlock

###### timeout?

`number`

Execution timeout in milliseconds (default: 5 minutes)

##### Returns

`Promise`\<[`StartSideExecutionResponse`](../interfaces/StartSideExecutionResponse.md)\>

Promise resolving to the side execution ID

#### startWithCode()

> **startWithCode**: (`inlineCode`, `params?`, `timeout?`) => `Promise`\<[`StartSideExecutionResponse`](../interfaces/StartSideExecutionResponse.md)\>

Start a side execution with inline JavaScript code

##### Parameters

###### inlineCode

`string`

JavaScript code to execute

###### params?

`Record`\<`string`, `any`\>

Additional parameters available in the execution context

###### timeout?

`number`

Execution timeout in milliseconds (default: 5 minutes)

##### Returns

`Promise`\<[`StartSideExecutionResponse`](../interfaces/StartSideExecutionResponse.md)\>

Promise resolving to the side execution ID

#### stop()

> **stop**: (`sideExecutionId`) => `Promise`\<[`StopSideExecutionResponse`](../interfaces/StopSideExecutionResponse.md)\>

Stop a running side execution

##### Parameters

###### sideExecutionId

`string`

ID of the side execution to stop

##### Returns

`Promise`\<[`StopSideExecutionResponse`](../interfaces/StopSideExecutionResponse.md)\>

Promise resolving to success status

***

### swarm

> **swarm**: `object` = `cbswarm`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:172](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L172)

#### applyForVacancy()

> **applyForVacancy**: (`swarmId`, `vacancyId`, `agentId`, `message?`) => `Promise`\<[`ApplyForVacancyResponse`](../interfaces/ApplyForVacancyResponse.md)\>

Apply for a vacancy

##### Parameters

###### swarmId

`string`

ID of the swarm

###### vacancyId

`string`

ID of the vacancy

###### agentId

`string`

ID of the applying agent

###### message?

`string`

Optional application message

##### Returns

`Promise`\<[`ApplyForVacancyResponse`](../interfaces/ApplyForVacancyResponse.md)\>

Promise resolving to success confirmation

#### assignRole()

> **assignRole**: (`swarmId`, `roleId`, `agentId`) => `Promise`\<[`AssignRoleResponse`](../interfaces/AssignRoleResponse.md)\>

Assign a role to an agent

##### Parameters

###### swarmId

`string`

ID of the swarm

###### roleId

`string`

ID of the role

###### agentId

`string`

ID of the agent

##### Returns

`Promise`\<[`AssignRoleResponse`](../interfaces/AssignRoleResponse.md)\>

Promise resolving to success confirmation

#### closeVacancy()

> **closeVacancy**: (`swarmId`, `vacancyId`, `reason`) => `Promise`\<[`CloseVacancyResponse`](../interfaces/CloseVacancyResponse.md)\>

Close a vacancy

##### Parameters

###### swarmId

`string`

ID of the swarm

###### vacancyId

`string`

ID of the vacancy

###### reason

`string`

Reason for closing

##### Returns

`Promise`\<[`CloseVacancyResponse`](../interfaces/CloseVacancyResponse.md)\>

Promise resolving to success confirmation

#### createRole()

> **createRole**: (`swarmId`, `data`) => `Promise`\<[`CreateRoleResponse`](../interfaces/CreateRoleResponse.md)\>

Create a new role in a swarm

##### Parameters

###### swarmId

`string`

ID of the swarm

###### data

[`CreateRoleRequest`](../interfaces/CreateRoleRequest.md)

Role creation data

##### Returns

`Promise`\<[`CreateRoleResponse`](../interfaces/CreateRoleResponse.md)\>

Promise resolving to created role details

#### createSwarm()

> **createSwarm**: (`data`) => `Promise`\<[`CreateSwarmResponse`](../interfaces/CreateSwarmResponse.md)\>

Create a new swarm

##### Parameters

###### data

[`CreateSwarmRequest`](../interfaces/CreateSwarmRequest.md)

Swarm creation data

##### Returns

`Promise`\<[`CreateSwarmResponse`](../interfaces/CreateSwarmResponse.md)\>

Promise resolving to created swarm details

#### createTeam()

> **createTeam**: (`swarmId`, `data`) => `Promise`\<[`CreateTeamResponse`](../interfaces/CreateTeamResponse.md)\>

Create a new team in a swarm

##### Parameters

###### swarmId

`string`

ID of the swarm

###### data

[`CreateTeamRequest`](../interfaces/CreateTeamRequest.md)

Team creation data

##### Returns

`Promise`\<[`CreateTeamResponse`](../interfaces/CreateTeamResponse.md)\>

Promise resolving to created team details

#### createVacancy()

> **createVacancy**: (`swarmId`, `data`) => `Promise`\<[`CreateVacancyResponse`](../interfaces/CreateVacancyResponse.md)\>

Create a new vacancy in a swarm

##### Parameters

###### swarmId

`string`

ID of the swarm

###### data

[`CreateVacancyRequest`](../interfaces/CreateVacancyRequest.md)

Vacancy creation data

##### Returns

`Promise`\<[`CreateVacancyResponse`](../interfaces/CreateVacancyResponse.md)\>

Promise resolving to created vacancy details

#### deleteRole()

> **deleteRole**: (`swarmId`, `roleId`) => `Promise`\<[`DeleteRoleResponse`](../interfaces/DeleteRoleResponse.md)\>

Delete a role from a swarm

##### Parameters

###### swarmId

`string`

ID of the swarm

###### roleId

`string`

ID of the role

##### Returns

`Promise`\<[`DeleteRoleResponse`](../interfaces/DeleteRoleResponse.md)\>

Promise resolving to success confirmation

#### deleteTeam()

> **deleteTeam**: (`swarmId`, `teamId`) => `Promise`\<[`DeleteTeamResponse`](../interfaces/DeleteTeamResponse.md)\>

Delete a team from a swarm

##### Parameters

###### swarmId

`string`

ID of the swarm

###### teamId

`string`

ID of the team

##### Returns

`Promise`\<[`DeleteTeamResponse`](../interfaces/DeleteTeamResponse.md)\>

Promise resolving to success confirmation

#### getAgentsByRole()

> **getAgentsByRole**: (`swarmId`, `roleId`) => `Promise`\<[`GetAgentsByRoleResponse`](../interfaces/GetAgentsByRoleResponse.md)\>

Get all agents with a specific role

##### Parameters

###### swarmId

`string`

ID of the swarm

###### roleId

`string`

ID of the role

##### Returns

`Promise`\<[`GetAgentsByRoleResponse`](../interfaces/GetAgentsByRoleResponse.md)\>

Promise resolving to array of agents

#### getDefaultJobGroup()

> **getDefaultJobGroup**: (`swarmId`) => `Promise`\<`GetDefaultJobGroupResponse`\>

Get the default job group ID associated with a swarm

##### Parameters

###### swarmId

`string`

ID of the swarm

##### Returns

`Promise`\<`GetDefaultJobGroupResponse`\>

Promise resolving to the default job group ID

#### getRole()

> **getRole**: (`swarmId`, `roleId`) => `Promise`\<[`GetRoleResponse`](../interfaces/GetRoleResponse.md)\>

Get details of a specific role

##### Parameters

###### swarmId

`string`

ID of the swarm

###### roleId

`string`

ID of the role

##### Returns

`Promise`\<[`GetRoleResponse`](../interfaces/GetRoleResponse.md)\>

Promise resolving to role details with assignees

#### getSwarm()

> **getSwarm**: (`swarmId`) => `Promise`\<[`GetSwarmResponse`](../interfaces/GetSwarmResponse.md)\>

Get details of a specific swarm

##### Parameters

###### swarmId

`string`

ID of the swarm

##### Returns

`Promise`\<[`GetSwarmResponse`](../interfaces/GetSwarmResponse.md)\>

Promise resolving to swarm details

#### getSwarmAgents()

> **getSwarmAgents**: (`swarmId`) => `Promise`\<[`GetSwarmAgentsResponse`](../interfaces/GetSwarmAgentsResponse.md)\>

Get all agents in a swarm

##### Parameters

###### swarmId

`string`

ID of the swarm

##### Returns

`Promise`\<[`GetSwarmAgentsResponse`](../interfaces/GetSwarmAgentsResponse.md)\>

Promise resolving to array of agents

#### getSwarmStatusSummary()

> **getSwarmStatusSummary**: (`swarmId`) => `Promise`\<[`GetStatusSummaryResponse`](../interfaces/GetStatusSummaryResponse.md)\>

Get status summary for a swarm

##### Parameters

###### swarmId

`string`

ID of the swarm

##### Returns

`Promise`\<[`GetStatusSummaryResponse`](../interfaces/GetStatusSummaryResponse.md)\>

Promise resolving to status summary with agents

#### getTeam()

> **getTeam**: (`swarmId`, `teamId`) => `Promise`\<[`GetTeamResponse`](../interfaces/GetTeamResponse.md)\>

Get details of a specific team

##### Parameters

###### swarmId

`string`

ID of the swarm

###### teamId

`string`

ID of the team

##### Returns

`Promise`\<[`GetTeamResponse`](../interfaces/GetTeamResponse.md)\>

Promise resolving to team details with members

#### joinTeam()

> **joinTeam**: (`swarmId`, `teamId`, `agentId`) => `Promise`\<[`JoinTeamResponse`](../interfaces/JoinTeamResponse.md)\>

Add an agent to a team

##### Parameters

###### swarmId

`string`

ID of the swarm

###### teamId

`string`

ID of the team

###### agentId

`string`

ID of the agent

##### Returns

`Promise`\<[`JoinTeamResponse`](../interfaces/JoinTeamResponse.md)\>

Promise resolving to success confirmation

#### leaveTeam()

> **leaveTeam**: (`swarmId`, `teamId`, `agentId`) => `Promise`\<[`LeaveTeamResponse`](../interfaces/LeaveTeamResponse.md)\>

Remove an agent from a team

##### Parameters

###### swarmId

`string`

ID of the swarm

###### teamId

`string`

ID of the team

###### agentId

`string`

ID of the agent

##### Returns

`Promise`\<[`LeaveTeamResponse`](../interfaces/LeaveTeamResponse.md)\>

Promise resolving to success confirmation

#### listRoles()

> **listRoles**: (`swarmId`) => `Promise`\<[`ListRolesResponse`](../interfaces/ListRolesResponse.md)\>

List all roles in a swarm

##### Parameters

###### swarmId

`string`

ID of the swarm

##### Returns

`Promise`\<[`ListRolesResponse`](../interfaces/ListRolesResponse.md)\>

Promise resolving to array of roles

#### listSwarms()

> **listSwarms**: () => `Promise`\<[`ListSwarmsResponse`](../interfaces/ListSwarmsResponse.md)\>

List all available swarms

##### Returns

`Promise`\<[`ListSwarmsResponse`](../interfaces/ListSwarmsResponse.md)\>

Promise resolving to array of swarms

#### listTeams()

> **listTeams**: (`swarmId`) => `Promise`\<[`ListTeamsResponse`](../interfaces/ListTeamsResponse.md)\>

List all teams in a swarm

##### Parameters

###### swarmId

`string`

ID of the swarm

##### Returns

`Promise`\<[`ListTeamsResponse`](../interfaces/ListTeamsResponse.md)\>

Promise resolving to array of teams

#### listVacancies()

> **listVacancies**: (`swarmId`) => `Promise`\<[`ListVacanciesResponse`](../interfaces/ListVacanciesResponse.md)\>

List all vacancies in a swarm

##### Parameters

###### swarmId

`string`

ID of the swarm

##### Returns

`Promise`\<[`ListVacanciesResponse`](../interfaces/ListVacanciesResponse.md)\>

Promise resolving to array of vacancies

#### registerAgent()

> **registerAgent**: (`swarmId`, `data`) => `Promise`\<[`RegisterAgentResponse`](../interfaces/RegisterAgentResponse.md)\>

Register an agent to a swarm

##### Parameters

###### swarmId

`string`

ID of the swarm

###### data

[`AgentRegistration`](../interfaces/AgentRegistration.md)

Agent registration data

##### Returns

`Promise`\<[`RegisterAgentResponse`](../interfaces/RegisterAgentResponse.md)\>

Promise resolving to registered agent ID

#### unassignRole()

> **unassignRole**: (`swarmId`, `roleId`, `agentId`) => `Promise`\<[`UnassignRoleResponse`](../interfaces/UnassignRoleResponse.md)\>

Unassign a role from an agent

##### Parameters

###### swarmId

`string`

ID of the swarm

###### roleId

`string`

ID of the role

###### agentId

`string`

ID of the agent

##### Returns

`Promise`\<[`UnassignRoleResponse`](../interfaces/UnassignRoleResponse.md)\>

Promise resolving to success confirmation

#### unregisterAgent()

> **unregisterAgent**: (`swarmId`, `agentId`) => `Promise`\<[`UnregisterAgentResponse`](../interfaces/UnregisterAgentResponse.md)\>

Unregister an agent from a swarm

##### Parameters

###### swarmId

`string`

ID of the swarm

###### agentId

`string`

ID of the agent

##### Returns

`Promise`\<[`UnregisterAgentResponse`](../interfaces/UnregisterAgentResponse.md)\>

Promise resolving to success confirmation

#### updateAgentStatus()

> **updateAgentStatus**: (`swarmId`, `agentId`, `data`) => `Promise`\<[`UpdateStatusResponse`](../interfaces/UpdateStatusResponse.md)\>

Update an agent's status

##### Parameters

###### swarmId

`string`

ID of the swarm

###### agentId

`string`

ID of the agent

###### data

[`AgentStatusUpdate`](../interfaces/AgentStatusUpdate.md)

Status update data

##### Returns

`Promise`\<[`UpdateStatusResponse`](../interfaces/UpdateStatusResponse.md)\>

Promise resolving to success confirmation

***

### task

> **task**: `object`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:153](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L153)

#### assignAgentToTask()

> **assignAgentToTask**: (`taskId`, `agentId`) => `Promise`\<\{ `error?`: `string`; `success?`: `boolean`; `task?`: \{ `assignedTo?`: `string`; `cancellationReason?`: `string`; `children?`: `any`[]; `completed?`: `boolean`; `completedAt?`: `string` \| `Date`; `controlFiles?`: `any`[]; `createdAt?`: `string` \| `Date`; `dependsOnTaskId?`: `string`; `dependsOnTaskName?`: `string`; `description?`: `string`; `dueDate?`: `string` \| `Date`; `errorMessage?`: `string`; `flowData?`: `any`; `groupId?`: `string`; `id?`: `number`; `links?`: `string`[]; `mentionedAgents?`: `any`[]; `mentionedDocs?`: `any`[]; `mentionedFiles?`: `string`[]; `mentionedFolders?`: `string`[]; `mentionedMCPs?`: `string`[]; `mentionedMultiFile?`: `string`[]; `messages?`: `any`[]; `name?`: `string`; `order?`: `number`; `parentTaskId?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"` \| `"urgent"`; `projectId?`: `number`; `projectName?`: `string`; `projectPath?`: `string`; `selectedAgent?`: `any`; `selection?`: `any`; `status?`: `"pending"` \| `"completed"` \| `"failed"` \| `"cancelled"` \| `"in_progress"` \| `"created"` \| `"planned"` \| `"waiting_user"` \| `"review"` \| `"active"`; `statusUpdatedAt?`: `string` \| `Date`; `tags?`: `string`[]; `taskId?`: `string`; `updatedAt?`: `string` \| `Date`; `uploadedImages?`: `string`[]; \}; `type?`: `"updateTaskResponse"`; \}\>

Assigns an agent to a task.

##### Parameters

###### taskId

`string`

The task ID

###### agentId

`string`

The agent ID to assign

##### Returns

`Promise`\<\{ `error?`: `string`; `success?`: `boolean`; `task?`: \{ `assignedTo?`: `string`; `cancellationReason?`: `string`; `children?`: `any`[]; `completed?`: `boolean`; `completedAt?`: `string` \| `Date`; `controlFiles?`: `any`[]; `createdAt?`: `string` \| `Date`; `dependsOnTaskId?`: `string`; `dependsOnTaskName?`: `string`; `description?`: `string`; `dueDate?`: `string` \| `Date`; `errorMessage?`: `string`; `flowData?`: `any`; `groupId?`: `string`; `id?`: `number`; `links?`: `string`[]; `mentionedAgents?`: `any`[]; `mentionedDocs?`: `any`[]; `mentionedFiles?`: `string`[]; `mentionedFolders?`: `string`[]; `mentionedMCPs?`: `string`[]; `mentionedMultiFile?`: `string`[]; `messages?`: `any`[]; `name?`: `string`; `order?`: `number`; `parentTaskId?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"` \| `"urgent"`; `projectId?`: `number`; `projectName?`: `string`; `projectPath?`: `string`; `selectedAgent?`: `any`; `selection?`: `any`; `status?`: `"pending"` \| `"completed"` \| `"failed"` \| `"cancelled"` \| `"in_progress"` \| `"created"` \| `"planned"` \| `"waiting_user"` \| `"review"` \| `"active"`; `statusUpdatedAt?`: `string` \| `Date`; `tags?`: `string`[]; `taskId?`: `string`; `updatedAt?`: `string` \| `Date`; `uploadedImages?`: `string`[]; \}; `type?`: `"updateTaskResponse"`; \}\>

#### createTask()

> **createTask**: (`options`) => `Promise`\<\{ `error?`: `string`; `success?`: `boolean`; `task?`: \{ `assignedTo?`: `string`; `cancellationReason?`: `string`; `children?`: `any`[]; `completed?`: `boolean`; `completedAt?`: `string` \| `Date`; `controlFiles?`: `any`[]; `createdAt?`: `string` \| `Date`; `dependsOnTaskId?`: `string`; `dependsOnTaskName?`: `string`; `description?`: `string`; `dueDate?`: `string` \| `Date`; `errorMessage?`: `string`; `flowData?`: `any`; `groupId?`: `string`; `id?`: `number`; `links?`: `string`[]; `mentionedAgents?`: `any`[]; `mentionedDocs?`: `any`[]; `mentionedFiles?`: `string`[]; `mentionedFolders?`: `string`[]; `mentionedMCPs?`: `string`[]; `mentionedMultiFile?`: `string`[]; `messages?`: `any`[]; `name?`: `string`; `order?`: `number`; `parentTaskId?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"` \| `"urgent"`; `projectId?`: `number`; `projectName?`: `string`; `projectPath?`: `string`; `selectedAgent?`: `any`; `selection?`: `any`; `status?`: `"pending"` \| `"completed"` \| `"failed"` \| `"cancelled"` \| `"in_progress"` \| `"created"` \| `"planned"` \| `"waiting_user"` \| `"review"` \| `"active"`; `statusUpdatedAt?`: `string` \| `Date`; `tags?`: `string`[]; `taskId?`: `string`; `updatedAt?`: `string` \| `Date`; `uploadedImages?`: `string`[]; \}; `type?`: `"createTaskResponse"`; \}\>

Creates a new task.

##### Parameters

###### options

The task creation parameters

###### assignedTo?

`string`

###### controlFiles?

`any`[]

###### dependsOnTaskId?

`string`

###### dependsOnTaskName?

`string`

###### description?

`string`

###### dueDate?

`Date`

###### environment?

`string`

###### environmentType?

`"local"` \| `"remote"`

###### executionType?

`"scheduled"` \| `"immediate"` \| `"manual"` \| `"conditional"`

###### flowData?

`any`

###### groupId?

`string`

###### isKanbanTask?

`boolean`

###### isRemoteTask?

`boolean`

###### links?

`string`[]

###### mentionedAgents?

`any`[]

###### mentionedDocs?

`any`[]

###### mentionedFiles?

`string`[]

###### mentionedFolders?

`string`[]

###### mentionedMCPs?

`string`[]

###### mentionedMultiFile?

`string`[]

###### name?

`string`

###### order?

`number`

###### parentTaskId?

`string`

###### priority?

`"low"` \| `"medium"` \| `"high"` \| `"urgent"`

###### projectId?

`number`

###### projectName?

`string`

###### projectPath?

`string`

###### selectedAgent?

`any`

###### selection?

`any`

###### startOption?

`"manual"` \| `"immediately"` \| `"based_on_group"` \| `"ontaskfinish"`

###### status?

`string`

###### steps?

`object`[]

###### tags?

`string`[]

###### taskType?

`"scheduled"` \| `"interactive"`

###### threadId?

`string`

###### uploadedImages?

`string`[]

##### Returns

`Promise`\<\{ `error?`: `string`; `success?`: `boolean`; `task?`: \{ `assignedTo?`: `string`; `cancellationReason?`: `string`; `children?`: `any`[]; `completed?`: `boolean`; `completedAt?`: `string` \| `Date`; `controlFiles?`: `any`[]; `createdAt?`: `string` \| `Date`; `dependsOnTaskId?`: `string`; `dependsOnTaskName?`: `string`; `description?`: `string`; `dueDate?`: `string` \| `Date`; `errorMessage?`: `string`; `flowData?`: `any`; `groupId?`: `string`; `id?`: `number`; `links?`: `string`[]; `mentionedAgents?`: `any`[]; `mentionedDocs?`: `any`[]; `mentionedFiles?`: `string`[]; `mentionedFolders?`: `string`[]; `mentionedMCPs?`: `string`[]; `mentionedMultiFile?`: `string`[]; `messages?`: `any`[]; `name?`: `string`; `order?`: `number`; `parentTaskId?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"` \| `"urgent"`; `projectId?`: `number`; `projectName?`: `string`; `projectPath?`: `string`; `selectedAgent?`: `any`; `selection?`: `any`; `status?`: `"pending"` \| `"completed"` \| `"failed"` \| `"cancelled"` \| `"in_progress"` \| `"created"` \| `"planned"` \| `"waiting_user"` \| `"review"` \| `"active"`; `statusUpdatedAt?`: `string` \| `Date`; `tags?`: `string`[]; `taskId?`: `string`; `updatedAt?`: `string` \| `Date`; `uploadedImages?`: `string`[]; \}; `type?`: `"createTaskResponse"`; \}\>

#### deleteTask()

> **deleteTask**: (`taskId`) => `Promise`\<\{ `deleted?`: `boolean`; `error?`: `string`; `success?`: `boolean`; `taskId?`: `string`; `type?`: `"deleteTaskResponse"`; \}\>

Deletes a task.

##### Parameters

###### taskId

`string`

The task ID to delete

##### Returns

`Promise`\<\{ `deleted?`: `boolean`; `error?`: `string`; `success?`: `boolean`; `taskId?`: `string`; `type?`: `"deleteTaskResponse"`; \}\>

#### executeTaskWithAgent()

> **executeTaskWithAgent**: (`taskId`, `agentId`) => `Promise`\<\{ `activityId?`: `string`; `agentId?`: `string`; `error?`: `string`; `success?`: `boolean`; `task?`: \{ `assignedTo?`: `string`; `cancellationReason?`: `string`; `children?`: `any`[]; `completed?`: `boolean`; `completedAt?`: `string` \| `Date`; `controlFiles?`: `any`[]; `createdAt?`: `string` \| `Date`; `dependsOnTaskId?`: `string`; `dependsOnTaskName?`: `string`; `description?`: `string`; `dueDate?`: `string` \| `Date`; `errorMessage?`: `string`; `flowData?`: `any`; `groupId?`: `string`; `id?`: `number`; `links?`: `string`[]; `mentionedAgents?`: `any`[]; `mentionedDocs?`: `any`[]; `mentionedFiles?`: `string`[]; `mentionedFolders?`: `string`[]; `mentionedMCPs?`: `string`[]; `mentionedMultiFile?`: `string`[]; `messages?`: `any`[]; `name?`: `string`; `order?`: `number`; `parentTaskId?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"` \| `"urgent"`; `projectId?`: `number`; `projectName?`: `string`; `projectPath?`: `string`; `selectedAgent?`: `any`; `selection?`: `any`; `status?`: `"pending"` \| `"completed"` \| `"failed"` \| `"cancelled"` \| `"in_progress"` \| `"created"` \| `"planned"` \| `"waiting_user"` \| `"review"` \| `"active"`; `statusUpdatedAt?`: `string` \| `Date`; `tags?`: `string`[]; `taskId?`: `string`; `updatedAt?`: `string` \| `Date`; `uploadedImages?`: `string`[]; \}; `taskId?`: `string`; `type?`: `"startTaskWithAgentResponse"`; \}\>

Executes a task with a specific agent.
Assigns the agent and then starts the task.

##### Parameters

###### taskId

`string`

The task ID

###### agentId

`string`

The agent ID

##### Returns

`Promise`\<\{ `activityId?`: `string`; `agentId?`: `string`; `error?`: `string`; `success?`: `boolean`; `task?`: \{ `assignedTo?`: `string`; `cancellationReason?`: `string`; `children?`: `any`[]; `completed?`: `boolean`; `completedAt?`: `string` \| `Date`; `controlFiles?`: `any`[]; `createdAt?`: `string` \| `Date`; `dependsOnTaskId?`: `string`; `dependsOnTaskName?`: `string`; `description?`: `string`; `dueDate?`: `string` \| `Date`; `errorMessage?`: `string`; `flowData?`: `any`; `groupId?`: `string`; `id?`: `number`; `links?`: `string`[]; `mentionedAgents?`: `any`[]; `mentionedDocs?`: `any`[]; `mentionedFiles?`: `string`[]; `mentionedFolders?`: `string`[]; `mentionedMCPs?`: `string`[]; `mentionedMultiFile?`: `string`[]; `messages?`: `any`[]; `name?`: `string`; `order?`: `number`; `parentTaskId?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"` \| `"urgent"`; `projectId?`: `number`; `projectName?`: `string`; `projectPath?`: `string`; `selectedAgent?`: `any`; `selection?`: `any`; `status?`: `"pending"` \| `"completed"` \| `"failed"` \| `"cancelled"` \| `"in_progress"` \| `"created"` \| `"planned"` \| `"waiting_user"` \| `"review"` \| `"active"`; `statusUpdatedAt?`: `string` \| `Date`; `tags?`: `string`[]; `taskId?`: `string`; `updatedAt?`: `string` \| `Date`; `uploadedImages?`: `string`[]; \}; `taskId?`: `string`; `type?`: `"startTaskWithAgentResponse"`; \}\>

#### getTaskDetail()

> **getTaskDetail**: (`options`) => `Promise`\<\{ `error?`: `string`; `success?`: `boolean`; `task?`: \{ `assignedTo?`: `string`; `cancellationReason?`: `string`; `children?`: `any`[]; `completed?`: `boolean`; `completedAt?`: `string` \| `Date`; `controlFiles?`: `any`[]; `createdAt?`: `string` \| `Date`; `dependsOnTaskId?`: `string`; `dependsOnTaskName?`: `string`; `description?`: `string`; `dueDate?`: `string` \| `Date`; `errorMessage?`: `string`; `flowData?`: `any`; `groupId?`: `string`; `id?`: `number`; `links?`: `string`[]; `mentionedAgents?`: `any`[]; `mentionedDocs?`: `any`[]; `mentionedFiles?`: `string`[]; `mentionedFolders?`: `string`[]; `mentionedMCPs?`: `string`[]; `mentionedMultiFile?`: `string`[]; `messages?`: `any`[]; `name?`: `string`; `order?`: `number`; `parentTaskId?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"` \| `"urgent"`; `projectId?`: `number`; `projectName?`: `string`; `projectPath?`: `string`; `selectedAgent?`: `any`; `selection?`: `any`; `status?`: `"pending"` \| `"completed"` \| `"failed"` \| `"cancelled"` \| `"in_progress"` \| `"created"` \| `"planned"` \| `"waiting_user"` \| `"review"` \| `"active"`; `statusUpdatedAt?`: `string` \| `Date`; `tags?`: `string`[]; `taskId?`: `string`; `updatedAt?`: `string` \| `Date`; `uploadedImages?`: `string`[]; \}; `taskId?`: `string`; `type?`: `"getTaskResponse"`; \}\>

Retrieves detailed information about a specific task.

##### Parameters

###### options

The task detail options

###### includeMessages?

`boolean`

###### includeSteps?

`boolean`

###### taskId?

`string`

##### Returns

`Promise`\<\{ `error?`: `string`; `success?`: `boolean`; `task?`: \{ `assignedTo?`: `string`; `cancellationReason?`: `string`; `children?`: `any`[]; `completed?`: `boolean`; `completedAt?`: `string` \| `Date`; `controlFiles?`: `any`[]; `createdAt?`: `string` \| `Date`; `dependsOnTaskId?`: `string`; `dependsOnTaskName?`: `string`; `description?`: `string`; `dueDate?`: `string` \| `Date`; `errorMessage?`: `string`; `flowData?`: `any`; `groupId?`: `string`; `id?`: `number`; `links?`: `string`[]; `mentionedAgents?`: `any`[]; `mentionedDocs?`: `any`[]; `mentionedFiles?`: `string`[]; `mentionedFolders?`: `string`[]; `mentionedMCPs?`: `string`[]; `mentionedMultiFile?`: `string`[]; `messages?`: `any`[]; `name?`: `string`; `order?`: `number`; `parentTaskId?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"` \| `"urgent"`; `projectId?`: `number`; `projectName?`: `string`; `projectPath?`: `string`; `selectedAgent?`: `any`; `selection?`: `any`; `status?`: `"pending"` \| `"completed"` \| `"failed"` \| `"cancelled"` \| `"in_progress"` \| `"created"` \| `"planned"` \| `"waiting_user"` \| `"review"` \| `"active"`; `statusUpdatedAt?`: `string` \| `Date`; `tags?`: `string`[]; `taskId?`: `string`; `updatedAt?`: `string` \| `Date`; `uploadedImages?`: `string`[]; \}; `taskId?`: `string`; `type?`: `"getTaskResponse"`; \}\>

#### getTaskList()

> **getTaskList**: (`options`) => `Promise`\<\{ `error?`: `string`; `success?`: `boolean`; `tasks?`: `object`[]; `totalCount?`: `number`; `type?`: `"listTasksResponse"`; \}\>

Retrieves a list of tasks.

##### Parameters

###### options

Optional filters for tasks

###### limit?

`number`

###### offset?

`number`

###### startedByUser?

`string`

###### status?

`"pending"` \| `"completed"` \| `"processing"` \| `"all"`

###### threadId?

`string`

##### Returns

`Promise`\<\{ `error?`: `string`; `success?`: `boolean`; `tasks?`: `object`[]; `totalCount?`: `number`; `type?`: `"listTasksResponse"`; \}\>

#### getTaskStatus()

> **getTaskStatus**: (`taskId`) => `Promise`\<`undefined` \| `string`\>

Gets the status of a task.

##### Parameters

###### taskId

`string`

The task ID

##### Returns

`Promise`\<`undefined` \| `string`\>

The task status

#### getTaskSummary()

> **getTaskSummary**: (`taskId`) => `Promise`\<`undefined` \| `string`\>

Gets the summary (description) of a task.

##### Parameters

###### taskId

`string`

The task ID

##### Returns

`Promise`\<`undefined` \| `string`\>

The task description

#### updateTask()

> **updateTask**: (`taskId`, `updates`) => `Promise`\<\{ `error?`: `string`; `success?`: `boolean`; `task?`: \{ `assignedTo?`: `string`; `cancellationReason?`: `string`; `children?`: `any`[]; `completed?`: `boolean`; `completedAt?`: `string` \| `Date`; `controlFiles?`: `any`[]; `createdAt?`: `string` \| `Date`; `dependsOnTaskId?`: `string`; `dependsOnTaskName?`: `string`; `description?`: `string`; `dueDate?`: `string` \| `Date`; `errorMessage?`: `string`; `flowData?`: `any`; `groupId?`: `string`; `id?`: `number`; `links?`: `string`[]; `mentionedAgents?`: `any`[]; `mentionedDocs?`: `any`[]; `mentionedFiles?`: `string`[]; `mentionedFolders?`: `string`[]; `mentionedMCPs?`: `string`[]; `mentionedMultiFile?`: `string`[]; `messages?`: `any`[]; `name?`: `string`; `order?`: `number`; `parentTaskId?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"` \| `"urgent"`; `projectId?`: `number`; `projectName?`: `string`; `projectPath?`: `string`; `selectedAgent?`: `any`; `selection?`: `any`; `status?`: `"pending"` \| `"completed"` \| `"failed"` \| `"cancelled"` \| `"in_progress"` \| `"created"` \| `"planned"` \| `"waiting_user"` \| `"review"` \| `"active"`; `statusUpdatedAt?`: `string` \| `Date`; `tags?`: `string`[]; `taskId?`: `string`; `updatedAt?`: `string` \| `Date`; `uploadedImages?`: `string`[]; \}; `type?`: `"updateTaskResponse"`; \}\>

Updates an existing task.

##### Parameters

###### taskId

`string`

The task ID to update

###### updates

The task update parameters

###### assignedTo?

`string`

###### completed?

`boolean`

###### dependsOnTaskId?

`string`

###### dependsOnTaskName?

`string`

###### dueDate?

`Date`

###### environment?

`string`

###### environmentType?

`"local"` \| `"remote"`

###### executionType?

`"scheduled"` \| `"immediate"` \| `"manual"` \| `"conditional"`

###### groupId?

`string`

###### isKanbanTask?

`boolean`

###### isRemoteTask?

`boolean`

###### name?

`string`

###### selectedAgent?

`any`

###### startOption?

`"manual"` \| `"immediately"` \| `"based_on_group"` \| `"ontaskfinish"`

###### steps?

`object`[]

###### taskType?

`"scheduled"` \| `"interactive"`

##### Returns

`Promise`\<\{ `error?`: `string`; `success?`: `boolean`; `task?`: \{ `assignedTo?`: `string`; `cancellationReason?`: `string`; `children?`: `any`[]; `completed?`: `boolean`; `completedAt?`: `string` \| `Date`; `controlFiles?`: `any`[]; `createdAt?`: `string` \| `Date`; `dependsOnTaskId?`: `string`; `dependsOnTaskName?`: `string`; `description?`: `string`; `dueDate?`: `string` \| `Date`; `errorMessage?`: `string`; `flowData?`: `any`; `groupId?`: `string`; `id?`: `number`; `links?`: `string`[]; `mentionedAgents?`: `any`[]; `mentionedDocs?`: `any`[]; `mentionedFiles?`: `string`[]; `mentionedFolders?`: `string`[]; `mentionedMCPs?`: `string`[]; `mentionedMultiFile?`: `string`[]; `messages?`: `any`[]; `name?`: `string`; `order?`: `number`; `parentTaskId?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"` \| `"urgent"`; `projectId?`: `number`; `projectName?`: `string`; `projectPath?`: `string`; `selectedAgent?`: `any`; `selection?`: `any`; `status?`: `"pending"` \| `"completed"` \| `"failed"` \| `"cancelled"` \| `"in_progress"` \| `"created"` \| `"planned"` \| `"waiting_user"` \| `"review"` \| `"active"`; `statusUpdatedAt?`: `string` \| `Date`; `tags?`: `string`[]; `taskId?`: `string`; `updatedAt?`: `string` \| `Date`; `uploadedImages?`: `string`[]; \}; `type?`: `"updateTaskResponse"`; \}\>

***

### terminal

> **terminal**: `object` = `cbterminal`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:143](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L143)

#### eventEmitter

> **eventEmitter**: `CustomEventEmitter`

#### executeCommand()

> **executeCommand**: (`command`, `returnEmptyStringOnSuccess`) => `Promise`\<`CommandOutput` \| `CommandError` \| `CommandFinish`\>

Executes a given command and returns the result.
Listens for messages from the WebSocket that indicate the output, error, or finish state
of the executed command and resolves the promise accordingly.

##### Parameters

###### command

`string`

The command to be executed.

###### returnEmptyStringOnSuccess

`boolean` = `false`

##### Returns

`Promise`\<`CommandOutput` \| `CommandError` \| `CommandFinish`\>

A promise that resolves with the command's output, error, or finish signal.

#### executeCommandRunUntilError()

> **executeCommandRunUntilError**: (`command`, `executeInMain`) => `Promise`\<`CommandError`\>

Executes a given command and keeps running until an error occurs.
Listens for messages from the WebSocket and resolves the promise when an error is encountered.

##### Parameters

###### command

`string`

The command to be executed.

###### executeInMain

`boolean` = `false`

##### Returns

`Promise`\<`CommandError`\>

A promise that resolves when an error occurs during command execution.

#### executeCommandRunUntilInterrupt()

> **executeCommandRunUntilInterrupt**: (`command`, `executeInMain`) => `Promise`\<`CommandError`\>

Executes a given command and keeps running until manually interrupted.
Listens for messages from the WebSocket and resolves the promise when interrupted.

##### Parameters

###### command

`string`

The command to be executed.

###### executeInMain

`boolean` = `false`

Whether to execute in main terminal.

##### Returns

`Promise`\<`CommandError`\>

A promise that resolves when the command is interrupted.

#### executeCommandWithStream()

> **executeCommandWithStream**(`command`, `executeInMain`): `CustomEventEmitter`

Executes a given command and streams the output.
Listens for messages from the WebSocket and streams the output data.

##### Parameters

###### command

`string`

The command to be executed.

###### executeInMain

`boolean` = `false`

##### Returns

`CustomEventEmitter`

A promise that streams the output data during command execution.

#### sendManualInterrupt()

> **sendManualInterrupt**(): `Promise`\<`TerminalInterruptResponse`\>

Sends a manual interrupt signal to the terminal.

##### Returns

`Promise`\<`TerminalInterruptResponse`\>

***

### thread

> **thread**: `object`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:154](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L154)

#### createAndStartThread()

> **createAndStartThread**: (`options`) => `Promise`\<\{ `activityId?`: `string`; `error?`: `string`; `success?`: `boolean`; `thread?`: \{ `activeStepId?`: `string`; `assignedTo?`: `string`; `attachedMemories?`: `object`[]; `cancellationReason?`: `string`; `completed?`: `boolean`; `completedAt?`: `Date`; `createdAt?`: `Date`; `dependsOnThreadId?`: `string`; `dependsOnThreadName?`: `string`; `description?`: `string`; `environment?`: `Record`\<`string`, `any`\>; `environmentType?`: `"local"` \| `"remote"`; `errorMessage?`: `string`; `executionType?`: `"scheduled"` \| `"immediate"` \| `"manual"` \| `"conditional"`; `flowData?`: `any`; `groupId?`: `string`; `id?`: `number`; `isKanbanTask?`: `boolean`; `isRemoteTask?`: `boolean`; `messages?`: `object`[]; `name?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"` \| `"urgent"`; `progress?`: \{ `completedSteps?`: `number`; `percentage?`: `number`; `totalSteps?`: `number`; \}; `projectId?`: `number`; `projectName?`: `string`; `projectPath?`: `string`; `startOption?`: `"manual"` \| `"immediately"` \| `"based_on_group"` \| `"ontaskfinish"`; `status?`: `"pending"` \| `"completed"` \| `"failed"` \| `"cancelled"` \| `"in_progress"` \| `"created"` \| `"planned"` \| `"waiting_user"` \| `"review"` \| `"active"`; `statusUpdatedAt?`: `Date`; `stepActivatedAt?`: `Date`; `steps?`: `object`[]; `tags?`: `string`[]; `threadId?`: `string`; `threadType?`: `"scheduled"` \| `"interactive"`; `updatedAt?`: `Date`; \}; `threadId?`: `string`; `type?`: `"startThreadResponse"`; \}\>

Creates and immediately starts a new thread.

##### Parameters

###### options

The thread creation and start parameters

###### activeStepId?

`string`

###### agentId?

`string`

###### currentStep?

`any`

###### description?

`string`

###### environment?

`any`

###### groupId?

`string`

###### isGrouped?

`boolean`

###### isRemoteTask?

`boolean`

###### mentionedAgents?

`any`[]

###### mentionedMCPs?

`any`[]

###### messageId?

`string`

###### metadata?

`Record`\<`string`, `any`\>

###### processId?

`string`

###### remixPrompt?

`string`

###### remoteProvider?

\{ `id?`: `string`; `name?`: `string`; \}

###### remoteProvider.id?

`string`

###### remoteProvider.name?

`string`

###### selectedAgent?

`any`

###### selection?

\{ `selectedText?`: `string`; \}

###### selection.selectedText?

`string`

###### status?

`string`

###### stepId?

`string`

###### steps?

`any`[]

###### tags?

`string`[]

###### taskId?

`string`

###### title?

`string`

###### userMessage?

`string`

##### Returns

`Promise`\<\{ `activityId?`: `string`; `error?`: `string`; `success?`: `boolean`; `thread?`: \{ `activeStepId?`: `string`; `assignedTo?`: `string`; `attachedMemories?`: `object`[]; `cancellationReason?`: `string`; `completed?`: `boolean`; `completedAt?`: `Date`; `createdAt?`: `Date`; `dependsOnThreadId?`: `string`; `dependsOnThreadName?`: `string`; `description?`: `string`; `environment?`: `Record`\<`string`, `any`\>; `environmentType?`: `"local"` \| `"remote"`; `errorMessage?`: `string`; `executionType?`: `"scheduled"` \| `"immediate"` \| `"manual"` \| `"conditional"`; `flowData?`: `any`; `groupId?`: `string`; `id?`: `number`; `isKanbanTask?`: `boolean`; `isRemoteTask?`: `boolean`; `messages?`: `object`[]; `name?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"` \| `"urgent"`; `progress?`: \{ `completedSteps?`: `number`; `percentage?`: `number`; `totalSteps?`: `number`; \}; `projectId?`: `number`; `projectName?`: `string`; `projectPath?`: `string`; `startOption?`: `"manual"` \| `"immediately"` \| `"based_on_group"` \| `"ontaskfinish"`; `status?`: `"pending"` \| `"completed"` \| `"failed"` \| `"cancelled"` \| `"in_progress"` \| `"created"` \| `"planned"` \| `"waiting_user"` \| `"review"` \| `"active"`; `statusUpdatedAt?`: `Date`; `stepActivatedAt?`: `Date`; `steps?`: `object`[]; `tags?`: `string`[]; `threadId?`: `string`; `threadType?`: `"scheduled"` \| `"interactive"`; `updatedAt?`: `Date`; \}; `threadId?`: `string`; `type?`: `"startThreadResponse"`; \}\>

A promise that resolves with the thread start response

#### createThread()

> **createThread**: (`options`) => `Promise`\<\{ `error?`: `string`; `success?`: `boolean`; `thread?`: \{ `activeStepId?`: `string`; `assignedTo?`: `string`; `attachedMemories?`: `object`[]; `cancellationReason?`: `string`; `completed?`: `boolean`; `completedAt?`: `Date`; `createdAt?`: `Date`; `dependsOnThreadId?`: `string`; `dependsOnThreadName?`: `string`; `description?`: `string`; `environment?`: `Record`\<`string`, `any`\>; `environmentType?`: `"local"` \| `"remote"`; `errorMessage?`: `string`; `executionType?`: `"scheduled"` \| `"immediate"` \| `"manual"` \| `"conditional"`; `flowData?`: `any`; `groupId?`: `string`; `id?`: `number`; `isKanbanTask?`: `boolean`; `isRemoteTask?`: `boolean`; `messages?`: `object`[]; `name?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"` \| `"urgent"`; `progress?`: \{ `completedSteps?`: `number`; `percentage?`: `number`; `totalSteps?`: `number`; \}; `projectId?`: `number`; `projectName?`: `string`; `projectPath?`: `string`; `startOption?`: `"manual"` \| `"immediately"` \| `"based_on_group"` \| `"ontaskfinish"`; `status?`: `"pending"` \| `"completed"` \| `"failed"` \| `"cancelled"` \| `"in_progress"` \| `"created"` \| `"planned"` \| `"waiting_user"` \| `"review"` \| `"active"`; `statusUpdatedAt?`: `Date`; `stepActivatedAt?`: `Date`; `steps?`: `object`[]; `tags?`: `string`[]; `threadId?`: `string`; `threadType?`: `"scheduled"` \| `"interactive"`; `updatedAt?`: `Date`; \}; `type?`: `"createThreadResponse"`; \}\>

Creates a new thread with comprehensive options.

##### Parameters

###### options

The thread creation parameters

###### activeStepId?

`string`

###### currentStep?

`any`

###### dependsOnTaskId?

`string`

###### dependsOnTaskName?

`string`

###### dueDate?

`Date`

###### environment?

`string`

###### environmentType?

`"local"` \| `"remote"`

###### executionType?

`"scheduled"` \| `"immediate"` \| `"manual"` \| `"conditional"`

###### groupId?

`string`

###### isGrouped?

`boolean`

###### isKanbanTask?

`boolean`

###### isRemoteTask?

`boolean`

###### mentionedAgents?

`any`[]

###### mentionedMCPs?

`any`[]

###### messageId?

`string`

###### name?

`string`

###### processId?

`string`

###### remixPrompt?

`string`

###### remoteProvider?

\{ `id?`: `string`; `name?`: `string`; \}

###### remoteProvider.id?

`string`

###### remoteProvider.name?

`string`

###### selectedAgent?

`any`

###### selection?

\{ `selectedText?`: `string`; \}

###### selection.selectedText?

`string`

###### startOption?

`"manual"` \| `"immediately"` \| `"based_on_group"` \| `"ontaskfinish"`

###### stepId?

`string`

###### steps?

`object`[]

###### taskType?

`"scheduled"` \| `"interactive"`

###### threadId?

`string`

###### userMessage?

`string`

##### Returns

`Promise`\<\{ `error?`: `string`; `success?`: `boolean`; `thread?`: \{ `activeStepId?`: `string`; `assignedTo?`: `string`; `attachedMemories?`: `object`[]; `cancellationReason?`: `string`; `completed?`: `boolean`; `completedAt?`: `Date`; `createdAt?`: `Date`; `dependsOnThreadId?`: `string`; `dependsOnThreadName?`: `string`; `description?`: `string`; `environment?`: `Record`\<`string`, `any`\>; `environmentType?`: `"local"` \| `"remote"`; `errorMessage?`: `string`; `executionType?`: `"scheduled"` \| `"immediate"` \| `"manual"` \| `"conditional"`; `flowData?`: `any`; `groupId?`: `string`; `id?`: `number`; `isKanbanTask?`: `boolean`; `isRemoteTask?`: `boolean`; `messages?`: `object`[]; `name?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"` \| `"urgent"`; `progress?`: \{ `completedSteps?`: `number`; `percentage?`: `number`; `totalSteps?`: `number`; \}; `projectId?`: `number`; `projectName?`: `string`; `projectPath?`: `string`; `startOption?`: `"manual"` \| `"immediately"` \| `"based_on_group"` \| `"ontaskfinish"`; `status?`: `"pending"` \| `"completed"` \| `"failed"` \| `"cancelled"` \| `"in_progress"` \| `"created"` \| `"planned"` \| `"waiting_user"` \| `"review"` \| `"active"`; `statusUpdatedAt?`: `Date`; `stepActivatedAt?`: `Date`; `steps?`: `object`[]; `tags?`: `string`[]; `threadId?`: `string`; `threadType?`: `"scheduled"` \| `"interactive"`; `updatedAt?`: `Date`; \}; `type?`: `"createThreadResponse"`; \}\>

A promise that resolves with the thread creation response

#### createThreadInBackground()

> **createThreadInBackground**: (`options`) => `Promise`\<\{ `agentId?`: `string`; `error?`: `string`; `instanceId?`: `string`; `success?`: `boolean`; `threadId?`: `string`; `type?`: `"ThreadAgentStarted"`; \} \| \{ `agentId?`: `string`; `error?`: `string`; `success?`: `boolean`; `threadId?`: `string`; `type?`: `"ThreadAgentStartFailed"`; \}\>

Creates a thread in the background and resolves when the agent starts or fails.

##### Parameters

###### options

The thread creation and start parameters

###### activeStepId?

`string`

###### agentId?

`string`

###### currentStep?

`any`

###### description?

`string`

###### environment?

`any`

###### groupId?

`string`

###### isGrouped?

`boolean`

###### isRemoteTask?

`boolean`

###### mentionedAgents?

`any`[]

###### mentionedMCPs?

`any`[]

###### messageId?

`string`

###### metadata?

`Record`\<`string`, `any`\>

###### processId?

`string`

###### remixPrompt?

`string`

###### remoteProvider?

\{ `id?`: `string`; `name?`: `string`; \}

###### remoteProvider.id?

`string`

###### remoteProvider.name?

`string`

###### selectedAgent?

`any`

###### selection?

\{ `selectedText?`: `string`; \}

###### selection.selectedText?

`string`

###### status?

`string`

###### stepId?

`string`

###### steps?

`any`[]

###### tags?

`string`[]

###### taskId?

`string`

###### title?

`string`

###### userMessage?

`string`

##### Returns

`Promise`\<\{ `agentId?`: `string`; `error?`: `string`; `instanceId?`: `string`; `success?`: `boolean`; `threadId?`: `string`; `type?`: `"ThreadAgentStarted"`; \} \| \{ `agentId?`: `string`; `error?`: `string`; `success?`: `boolean`; `threadId?`: `string`; `type?`: `"ThreadAgentStartFailed"`; \}\>

A promise that resolves with ThreadAgentStarted or ThreadAgentStartFailed response

#### deleteThread()

> **deleteThread**: (`threadId`) => `Promise`\<\{ `deleted?`: `boolean`; `error?`: `string`; `success?`: `boolean`; `threadId?`: `string`; `type?`: `"deleteThreadResponse"`; \}\>

Deletes a thread.

##### Parameters

###### threadId

`string`

The thread ID to delete

##### Returns

`Promise`\<\{ `deleted?`: `boolean`; `error?`: `string`; `success?`: `boolean`; `threadId?`: `string`; `type?`: `"deleteThreadResponse"`; \}\>

A promise that resolves with the thread deletion response

#### getThreadDetail()

> **getThreadDetail**: (`options`) => `Promise`\<\{ `error?`: `string`; `success?`: `boolean`; `thread?`: \{ `activeStepId?`: `string`; `assignedTo?`: `string`; `attachedMemories?`: `object`[]; `cancellationReason?`: `string`; `completed?`: `boolean`; `completedAt?`: `Date`; `createdAt?`: `Date`; `dependsOnThreadId?`: `string`; `dependsOnThreadName?`: `string`; `description?`: `string`; `environment?`: `Record`\<`string`, `any`\>; `environmentType?`: `"local"` \| `"remote"`; `errorMessage?`: `string`; `executionType?`: `"scheduled"` \| `"immediate"` \| `"manual"` \| `"conditional"`; `flowData?`: `any`; `groupId?`: `string`; `id?`: `number`; `isKanbanTask?`: `boolean`; `isRemoteTask?`: `boolean`; `messages?`: `object`[]; `name?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"` \| `"urgent"`; `progress?`: \{ `completedSteps?`: `number`; `percentage?`: `number`; `totalSteps?`: `number`; \}; `projectId?`: `number`; `projectName?`: `string`; `projectPath?`: `string`; `startOption?`: `"manual"` \| `"immediately"` \| `"based_on_group"` \| `"ontaskfinish"`; `status?`: `"pending"` \| `"completed"` \| `"failed"` \| `"cancelled"` \| `"in_progress"` \| `"created"` \| `"planned"` \| `"waiting_user"` \| `"review"` \| `"active"`; `statusUpdatedAt?`: `Date`; `stepActivatedAt?`: `Date`; `steps?`: `object`[]; `tags?`: `string`[]; `threadId?`: `string`; `threadType?`: `"scheduled"` \| `"interactive"`; `updatedAt?`: `Date`; \}; `threadId?`: `string`; `type?`: `"getThreadResponse"`; \}\>

Retrieves detailed information about a specific thread.

##### Parameters

###### options

The thread detail options

###### includeMessages?

`boolean`

###### includeSteps?

`boolean`

###### taskId?

`string`

##### Returns

`Promise`\<\{ `error?`: `string`; `success?`: `boolean`; `thread?`: \{ `activeStepId?`: `string`; `assignedTo?`: `string`; `attachedMemories?`: `object`[]; `cancellationReason?`: `string`; `completed?`: `boolean`; `completedAt?`: `Date`; `createdAt?`: `Date`; `dependsOnThreadId?`: `string`; `dependsOnThreadName?`: `string`; `description?`: `string`; `environment?`: `Record`\<`string`, `any`\>; `environmentType?`: `"local"` \| `"remote"`; `errorMessage?`: `string`; `executionType?`: `"scheduled"` \| `"immediate"` \| `"manual"` \| `"conditional"`; `flowData?`: `any`; `groupId?`: `string`; `id?`: `number`; `isKanbanTask?`: `boolean`; `isRemoteTask?`: `boolean`; `messages?`: `object`[]; `name?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"` \| `"urgent"`; `progress?`: \{ `completedSteps?`: `number`; `percentage?`: `number`; `totalSteps?`: `number`; \}; `projectId?`: `number`; `projectName?`: `string`; `projectPath?`: `string`; `startOption?`: `"manual"` \| `"immediately"` \| `"based_on_group"` \| `"ontaskfinish"`; `status?`: `"pending"` \| `"completed"` \| `"failed"` \| `"cancelled"` \| `"in_progress"` \| `"created"` \| `"planned"` \| `"waiting_user"` \| `"review"` \| `"active"`; `statusUpdatedAt?`: `Date`; `stepActivatedAt?`: `Date`; `steps?`: `object`[]; `tags?`: `string`[]; `threadId?`: `string`; `threadType?`: `"scheduled"` \| `"interactive"`; `updatedAt?`: `Date`; \}; `threadId?`: `string`; `type?`: `"getThreadResponse"`; \}\>

A promise that resolves with the thread detail response

#### getThreadFileChanges()

> **getThreadFileChanges**: (`threadId`) => `Promise`\<`ThreadFileChangesResponse`\>

Retrieves file changes associated with a specific thread.

##### Parameters

###### threadId

`string`

The thread ID

##### Returns

`Promise`\<`ThreadFileChangesResponse`\>

A promise that resolves with the file changes

#### getThreadFileChangesSummary()

> **getThreadFileChangesSummary**: (`threadId`) => `Promise`\<`ThreadFileChangesSummaryResponse`\>

Retrieves file changes summary for ChangesSummaryPanel.
Returns data in the format: { title, changes, files }

##### Parameters

###### threadId

`string`

The thread ID

##### Returns

`Promise`\<`ThreadFileChangesSummaryResponse`\>

A promise that resolves with the file changes summary

#### getThreadList()

> **getThreadList**: (`options`) => `Promise`\<\{ `agentId?`: `string`; `error?`: `string`; `limit?`: `number`; `offset?`: `number`; `status?`: `string`; `success?`: `boolean`; `taskId?`: `string`; `threads?`: `object`[]; `totalCount?`: `number`; `type?`: `"listThreadsResponse"`; \}\>

Retrieves a list of threads with optional filtering.

##### Parameters

###### options

Optional filters for threads

###### limit?

`number`

###### offset?

`number`

###### startedByUser?

`string`

###### status?

`"pending"` \| `"completed"` \| `"processing"` \| `"all"`

###### threadId?

`string`

##### Returns

`Promise`\<\{ `agentId?`: `string`; `error?`: `string`; `limit?`: `number`; `offset?`: `number`; `status?`: `string`; `success?`: `boolean`; `taskId?`: `string`; `threads?`: `object`[]; `totalCount?`: `number`; `type?`: `"listThreadsResponse"`; \}\>

A promise that resolves with the thread list response

#### getThreadMessages()

> **getThreadMessages**: (`options`) => `Promise`\<\{ `error?`: `string`; `limit?`: `number`; `messages?`: `object`[]; `offset?`: `number`; `success?`: `boolean`; `threadId?`: `string`; `totalCount?`: `number`; `type?`: `"getThreadMessagesResponse"`; \}\>

Retrieves messages for a specific thread.

##### Parameters

###### options

The thread messages options

###### limit?

`number`

###### messageType?

`"info"` \| `"error"` \| `"warning"` \| `"success"` \| `"feedback"` \| `"steering"` \| `"instruction"`

###### offset?

`number`

###### stepId?

`string`

###### taskId?

`string`

##### Returns

`Promise`\<\{ `error?`: `string`; `limit?`: `number`; `messages?`: `object`[]; `offset?`: `number`; `success?`: `boolean`; `threadId?`: `string`; `totalCount?`: `number`; `type?`: `"getThreadMessagesResponse"`; \}\>

A promise that resolves with the thread messages response

#### startThread()

> **startThread**: (`threadId`) => `Promise`\<\{ `activityId?`: `string`; `error?`: `string`; `success?`: `boolean`; `thread?`: \{ `activeStepId?`: `string`; `assignedTo?`: `string`; `attachedMemories?`: `object`[]; `cancellationReason?`: `string`; `completed?`: `boolean`; `completedAt?`: `Date`; `createdAt?`: `Date`; `dependsOnThreadId?`: `string`; `dependsOnThreadName?`: `string`; `description?`: `string`; `environment?`: `Record`\<`string`, `any`\>; `environmentType?`: `"local"` \| `"remote"`; `errorMessage?`: `string`; `executionType?`: `"scheduled"` \| `"immediate"` \| `"manual"` \| `"conditional"`; `flowData?`: `any`; `groupId?`: `string`; `id?`: `number`; `isKanbanTask?`: `boolean`; `isRemoteTask?`: `boolean`; `messages?`: `object`[]; `name?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"` \| `"urgent"`; `progress?`: \{ `completedSteps?`: `number`; `percentage?`: `number`; `totalSteps?`: `number`; \}; `projectId?`: `number`; `projectName?`: `string`; `projectPath?`: `string`; `startOption?`: `"manual"` \| `"immediately"` \| `"based_on_group"` \| `"ontaskfinish"`; `status?`: `"pending"` \| `"completed"` \| `"failed"` \| `"cancelled"` \| `"in_progress"` \| `"created"` \| `"planned"` \| `"waiting_user"` \| `"review"` \| `"active"`; `statusUpdatedAt?`: `Date`; `stepActivatedAt?`: `Date`; `steps?`: `object`[]; `tags?`: `string`[]; `threadId?`: `string`; `threadType?`: `"scheduled"` \| `"interactive"`; `updatedAt?`: `Date`; \}; `threadId?`: `string`; `type?`: `"startThreadResponse"`; \}\>

Starts a thread.

##### Parameters

###### threadId

`string`

The thread ID to start

##### Returns

`Promise`\<\{ `activityId?`: `string`; `error?`: `string`; `success?`: `boolean`; `thread?`: \{ `activeStepId?`: `string`; `assignedTo?`: `string`; `attachedMemories?`: `object`[]; `cancellationReason?`: `string`; `completed?`: `boolean`; `completedAt?`: `Date`; `createdAt?`: `Date`; `dependsOnThreadId?`: `string`; `dependsOnThreadName?`: `string`; `description?`: `string`; `environment?`: `Record`\<`string`, `any`\>; `environmentType?`: `"local"` \| `"remote"`; `errorMessage?`: `string`; `executionType?`: `"scheduled"` \| `"immediate"` \| `"manual"` \| `"conditional"`; `flowData?`: `any`; `groupId?`: `string`; `id?`: `number`; `isKanbanTask?`: `boolean`; `isRemoteTask?`: `boolean`; `messages?`: `object`[]; `name?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"` \| `"urgent"`; `progress?`: \{ `completedSteps?`: `number`; `percentage?`: `number`; `totalSteps?`: `number`; \}; `projectId?`: `number`; `projectName?`: `string`; `projectPath?`: `string`; `startOption?`: `"manual"` \| `"immediately"` \| `"based_on_group"` \| `"ontaskfinish"`; `status?`: `"pending"` \| `"completed"` \| `"failed"` \| `"cancelled"` \| `"in_progress"` \| `"created"` \| `"planned"` \| `"waiting_user"` \| `"review"` \| `"active"`; `statusUpdatedAt?`: `Date`; `stepActivatedAt?`: `Date`; `steps?`: `object`[]; `tags?`: `string`[]; `threadId?`: `string`; `threadType?`: `"scheduled"` \| `"interactive"`; `updatedAt?`: `Date`; \}; `threadId?`: `string`; `type?`: `"startThreadResponse"`; \}\>

A promise that resolves with the thread start response

#### updateThread()

> **updateThread**: (`threadId`, `updates`) => `Promise`\<\{ `error?`: `string`; `success?`: `boolean`; `thread?`: \{ `activeStepId?`: `string`; `assignedTo?`: `string`; `attachedMemories?`: `object`[]; `cancellationReason?`: `string`; `completed?`: `boolean`; `completedAt?`: `Date`; `createdAt?`: `Date`; `dependsOnThreadId?`: `string`; `dependsOnThreadName?`: `string`; `description?`: `string`; `environment?`: `Record`\<`string`, `any`\>; `environmentType?`: `"local"` \| `"remote"`; `errorMessage?`: `string`; `executionType?`: `"scheduled"` \| `"immediate"` \| `"manual"` \| `"conditional"`; `flowData?`: `any`; `groupId?`: `string`; `id?`: `number`; `isKanbanTask?`: `boolean`; `isRemoteTask?`: `boolean`; `messages?`: `object`[]; `name?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"` \| `"urgent"`; `progress?`: \{ `completedSteps?`: `number`; `percentage?`: `number`; `totalSteps?`: `number`; \}; `projectId?`: `number`; `projectName?`: `string`; `projectPath?`: `string`; `startOption?`: `"manual"` \| `"immediately"` \| `"based_on_group"` \| `"ontaskfinish"`; `status?`: `"pending"` \| `"completed"` \| `"failed"` \| `"cancelled"` \| `"in_progress"` \| `"created"` \| `"planned"` \| `"waiting_user"` \| `"review"` \| `"active"`; `statusUpdatedAt?`: `Date`; `stepActivatedAt?`: `Date`; `steps?`: `object`[]; `tags?`: `string`[]; `threadId?`: `string`; `threadType?`: `"scheduled"` \| `"interactive"`; `updatedAt?`: `Date`; \}; `threadId?`: `string`; `type?`: `"updateThreadResponse"`; \}\>

Updates an existing thread.

##### Parameters

###### threadId

`string`

The thread ID to update

###### updates

The thread update parameters

###### activeStepId?

`string`

###### completed?

`boolean`

###### currentStep?

`any`

###### dependsOnTaskId?

`string`

###### dependsOnTaskName?

`string`

###### dueDate?

`Date`

###### environment?

`string`

###### environmentType?

`"local"` \| `"remote"`

###### executionType?

`"scheduled"` \| `"immediate"` \| `"manual"` \| `"conditional"`

###### groupId?

`string`

###### isGrouped?

`boolean`

###### isKanbanTask?

`boolean`

###### isRemoteTask?

`boolean`

###### mentionedAgents?

`any`[]

###### mentionedMCPs?

`any`[]

###### messageId?

`string`

###### name?

`string`

###### processId?

`string`

###### remixPrompt?

`string`

###### remoteProvider?

\{ `id?`: `string`; `name?`: `string`; \}

###### remoteProvider.id?

`string`

###### remoteProvider.name?

`string`

###### selectedAgent?

`any`

###### selection?

\{ `selectedText?`: `string`; \}

###### selection.selectedText?

`string`

###### startOption?

`"manual"` \| `"immediately"` \| `"based_on_group"` \| `"ontaskfinish"`

###### stepId?

`string`

###### steps?

`object`[]

###### taskType?

`"scheduled"` \| `"interactive"`

###### userMessage?

`string`

##### Returns

`Promise`\<\{ `error?`: `string`; `success?`: `boolean`; `thread?`: \{ `activeStepId?`: `string`; `assignedTo?`: `string`; `attachedMemories?`: `object`[]; `cancellationReason?`: `string`; `completed?`: `boolean`; `completedAt?`: `Date`; `createdAt?`: `Date`; `dependsOnThreadId?`: `string`; `dependsOnThreadName?`: `string`; `description?`: `string`; `environment?`: `Record`\<`string`, `any`\>; `environmentType?`: `"local"` \| `"remote"`; `errorMessage?`: `string`; `executionType?`: `"scheduled"` \| `"immediate"` \| `"manual"` \| `"conditional"`; `flowData?`: `any`; `groupId?`: `string`; `id?`: `number`; `isKanbanTask?`: `boolean`; `isRemoteTask?`: `boolean`; `messages?`: `object`[]; `name?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"` \| `"urgent"`; `progress?`: \{ `completedSteps?`: `number`; `percentage?`: `number`; `totalSteps?`: `number`; \}; `projectId?`: `number`; `projectName?`: `string`; `projectPath?`: `string`; `startOption?`: `"manual"` \| `"immediately"` \| `"based_on_group"` \| `"ontaskfinish"`; `status?`: `"pending"` \| `"completed"` \| `"failed"` \| `"cancelled"` \| `"in_progress"` \| `"created"` \| `"planned"` \| `"waiting_user"` \| `"review"` \| `"active"`; `statusUpdatedAt?`: `Date`; `stepActivatedAt?`: `Date`; `steps?`: `object`[]; `tags?`: `string`[]; `threadId?`: `string`; `threadType?`: `"scheduled"` \| `"interactive"`; `updatedAt?`: `Date`; \}; `threadId?`: `string`; `type?`: `"updateThreadResponse"`; \}\>

A promise that resolves with the thread update response

#### updateThreadStatus()

> **updateThreadStatus**: (`threadId`, `status`) => `Promise`\<\{ `error?`: `string`; `status?`: `string`; `success?`: `boolean`; `thread?`: \{ `activeStepId?`: `string`; `assignedTo?`: `string`; `attachedMemories?`: `object`[]; `cancellationReason?`: `string`; `completed?`: `boolean`; `completedAt?`: `Date`; `createdAt?`: `Date`; `dependsOnThreadId?`: `string`; `dependsOnThreadName?`: `string`; `description?`: `string`; `environment?`: `Record`\<`string`, `any`\>; `environmentType?`: `"local"` \| `"remote"`; `errorMessage?`: `string`; `executionType?`: `"scheduled"` \| `"immediate"` \| `"manual"` \| `"conditional"`; `flowData?`: `any`; `groupId?`: `string`; `id?`: `number`; `isKanbanTask?`: `boolean`; `isRemoteTask?`: `boolean`; `messages?`: `object`[]; `name?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"` \| `"urgent"`; `progress?`: \{ `completedSteps?`: `number`; `percentage?`: `number`; `totalSteps?`: `number`; \}; `projectId?`: `number`; `projectName?`: `string`; `projectPath?`: `string`; `startOption?`: `"manual"` \| `"immediately"` \| `"based_on_group"` \| `"ontaskfinish"`; `status?`: `"pending"` \| `"completed"` \| `"failed"` \| `"cancelled"` \| `"in_progress"` \| `"created"` \| `"planned"` \| `"waiting_user"` \| `"review"` \| `"active"`; `statusUpdatedAt?`: `Date`; `stepActivatedAt?`: `Date`; `steps?`: `object`[]; `tags?`: `string`[]; `threadId?`: `string`; `threadType?`: `"scheduled"` \| `"interactive"`; `updatedAt?`: `Date`; \}; `threadId?`: `string`; `type?`: `"updateThreadStatusResponse"`; \}\>

Updates the status of a thread.

##### Parameters

###### threadId

`string`

The thread ID

###### status

`string`

The new status

##### Returns

`Promise`\<\{ `error?`: `string`; `status?`: `string`; `success?`: `boolean`; `thread?`: \{ `activeStepId?`: `string`; `assignedTo?`: `string`; `attachedMemories?`: `object`[]; `cancellationReason?`: `string`; `completed?`: `boolean`; `completedAt?`: `Date`; `createdAt?`: `Date`; `dependsOnThreadId?`: `string`; `dependsOnThreadName?`: `string`; `description?`: `string`; `environment?`: `Record`\<`string`, `any`\>; `environmentType?`: `"local"` \| `"remote"`; `errorMessage?`: `string`; `executionType?`: `"scheduled"` \| `"immediate"` \| `"manual"` \| `"conditional"`; `flowData?`: `any`; `groupId?`: `string`; `id?`: `number`; `isKanbanTask?`: `boolean`; `isRemoteTask?`: `boolean`; `messages?`: `object`[]; `name?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"` \| `"urgent"`; `progress?`: \{ `completedSteps?`: `number`; `percentage?`: `number`; `totalSteps?`: `number`; \}; `projectId?`: `number`; `projectName?`: `string`; `projectPath?`: `string`; `startOption?`: `"manual"` \| `"immediately"` \| `"based_on_group"` \| `"ontaskfinish"`; `status?`: `"pending"` \| `"completed"` \| `"failed"` \| `"cancelled"` \| `"in_progress"` \| `"created"` \| `"planned"` \| `"waiting_user"` \| `"review"` \| `"active"`; `statusUpdatedAt?`: `Date`; `stepActivatedAt?`: `Date`; `steps?`: `object`[]; `tags?`: `string`[]; `threadId?`: `string`; `threadType?`: `"scheduled"` \| `"interactive"`; `updatedAt?`: `Date`; \}; `threadId?`: `string`; `type?`: `"updateThreadStatusResponse"`; \}\>

A promise that resolves with the thread status update response

***

### todo

> **todo**: `object`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:165](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L165)

#### addTodo()

> **addTodo**: (`params`) => `Promise`\<`AddTodoResponse`\>

**`Function`**

addTodo

##### Parameters

###### params

The parameters for adding a todo.

###### priority?

`"low"` \| `"medium"` \| `"high"`

The priority of the todo.

###### tags?

`string`[]

Tags for the todo.

###### title

`string`

The title of the todo.

##### Returns

`Promise`\<`AddTodoResponse`\>

A promise that resolves with the server response.

##### Description

Adds a new todo item.

#### exportTodos()

> **exportTodos**: (`params?`) => `Promise`\<`ExportTodosResponse`\>

**`Function`**

exportTodos

##### Parameters

###### params?

The parameters for exporting todos.

###### format?

`"json"` \| `"markdown"`

The export format.

###### listId?

`string`

Optional list ID to filter.

###### status?

`string`[]

Optional status filter.

##### Returns

`Promise`\<`ExportTodosResponse`\>

A promise that resolves with the exported data.

##### Description

Exports todos in the specified format.

#### getAllIncompleteTodos()

> **getAllIncompleteTodos**: () => `Promise`\<`GetAllIncompleteTodosResponse`\>

**`Function`**

getAllIncompleteTodos

##### Returns

`Promise`\<`GetAllIncompleteTodosResponse`\>

A promise that resolves with the server response.

##### Description

Retrieves all incomplete todo items.

#### getTodoList()

> **getTodoList**: (`params?`) => `Promise`\<`GetTodoListResponse`\>

**`Function`**

getTodoList

##### Parameters

###### params?

`any`

The parameters for getting the todo list.

##### Returns

`Promise`\<`GetTodoListResponse`\>

A promise that resolves with the server response.

##### Description

Retrieves the todo list.

#### importTodos()

> **importTodos**: (`params`) => `Promise`\<`ImportTodosResponse`\>

**`Function`**

importTodos

##### Parameters

###### params

The parameters for importing todos.

###### data

`string`

The import data (JSON or markdown).

###### format?

`"json"` \| `"markdown"`

The format of the import data.

###### listId?

`string`

Optional target list ID.

###### mergeStrategy?

`"replace"` \| `"merge"`

How to handle existing todos.

##### Returns

`Promise`\<`ImportTodosResponse`\>

A promise that resolves with the import result.

##### Description

Imports todos from the specified format.

#### updateTodo()

> **updateTodo**: (`params`) => `Promise`\<`UpdateTodoResponse`\>

**`Function`**

updateTodo

##### Parameters

###### params

The parameters for updating a todo.

###### id

`string`

The ID of the todo to update.

###### priority?

`"low"` \| `"medium"` \| `"high"`

The new priority.

###### status?

`"pending"` \| `"completed"` \| `"processing"` \| `"cancelled"`

The new status.

###### tags?

`string`[]

The new tags.

###### title?

`string`

The new title.

##### Returns

`Promise`\<`UpdateTodoResponse`\>

A promise that resolves with the server response.

##### Description

Updates an existing todo item.

***

### tokenizer

> **tokenizer**: `object`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:157](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L157)

#### addToken()

> **addToken**: (`key`) => `Promise`\<`AddTokenResponse`\>

Adds a token to the system via WebSocket.

##### Parameters

###### key

`string`

The key associated with the token to be added.

##### Returns

`Promise`\<`AddTokenResponse`\>

A promise that resolves with the response from the add token event.

#### getToken()

> **getToken**: (`key`) => `Promise`\<`GetTokenResponse`\>

Retrieves a token from the system via WebSocket.

##### Parameters

###### key

`string`

The key associated with the token to be retrieved.

##### Returns

`Promise`\<`GetTokenResponse`\>

A promise that resolves with the response from the get token event.

***

### userMessage

> **userMessage**: `object` = `userMessageUtilities`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:198](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L198)

User message utilities for accessing current user message and context

#### clear()

> **clear**: () => `void`

Clear current user message

##### Returns

`void`

#### getCurrent()

> **getCurrent**: () => `undefined` \| `FlatUserMessage`

Get the current user message object

##### Returns

`undefined` \| `FlatUserMessage`

Current UserMessage or undefined

#### getCurrentFile()

> **getCurrentFile**: () => `undefined` \| `string`

Get current file path

##### Returns

`undefined` \| `string`

Current file path or undefined

#### getMentionedAgents()

> **getMentionedAgents**: () => `any`[]

Get mentioned agents from current message

##### Returns

`any`[]

Array of agent objects

#### getMentionedFiles()

> **getMentionedFiles**: () => `string`[]

Get mentioned files from current message

##### Returns

`string`[]

Array of file paths

#### getMentionedFolders()

> **getMentionedFolders**: () => `string`[]

Get mentioned folders from current message

##### Returns

`string`[]

Array of folder paths

#### getMentionedMCPs()

> **getMentionedMCPs**: () => `string`[]

Get mentioned MCPs from current message

##### Returns

`string`[]

Array of MCP tools

#### getMessageId()

> **getMessageId**: () => `undefined` \| `string`

Get message ID

##### Returns

`undefined` \| `string`

Message ID or undefined

#### getProcessingConfig()

> **getProcessingConfig**: () => `AgentProcessingConfig`

Get processing configuration

##### Returns

`AgentProcessingConfig`

Processing configuration object

#### getRemixPrompt()

> **getRemixPrompt**: () => `undefined` \| `string`

Get remix prompt from current message

##### Returns

`undefined` \| `string`

Remix prompt string or undefined

#### getSelection()

> **getSelection**: () => `undefined` \| `string`

Get text selection from current message

##### Returns

`undefined` \| `string`

Selected text or undefined

#### getSessionData()

> **getSessionData**: (`key`) => `any`

Get session data

##### Parameters

###### key

`string`

Session data key

##### Returns

`any`

Session data value

#### getText()

> **getText**: () => `string`

Get the user message text content

##### Returns

`string`

Message text string

#### getThreadId()

> **getThreadId**: () => `undefined` \| `string`

Get thread ID

##### Returns

`undefined` \| `string`

Thread ID or undefined

#### getTimestamp()

> **getTimestamp**: () => `undefined` \| `string`

Get message timestamp

##### Returns

`undefined` \| `string`

Timestamp when message was received

#### getUploadedImages()

> **getUploadedImages**: () => `any`[]

Get uploaded images from current message

##### Returns

`any`[]

Array of image objects

#### hasMessage()

> **hasMessage**: () => `boolean`

Check if there's a current message

##### Returns

`boolean`

Whether there's a current message

#### isProcessingEnabled()

> **isProcessingEnabled**: (`type`) => `boolean`

Check if a processing type is enabled

##### Parameters

###### type

Processing type to check

`"processMentionedMCPs"` | `"processRemixPrompt"` | `"processMentionedFiles"` | `"processMentionedAgents"`

##### Returns

`boolean`

Whether the processing type is enabled

#### setSessionData()

> **setSessionData**: (`key`, `value`) => `void`

Set session data

##### Parameters

###### key

`string`

Session data key

###### value

`any`

Session data value

##### Returns

`void`

#### updateProcessingConfig()

> **updateProcessingConfig**: (`config`) => `void`

Update processing configuration

##### Parameters

###### config

`any`

New processing configuration

##### Returns

`void`

***

### utils

> **utils**: `object` = `cbutils`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:161](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L161)

#### editFileAndApplyDiff()

> **editFileAndApplyDiff**: (`filePath`, `diff`, `diffIdentifier`, `prompt`, `applyModel?`) => `Promise`\<`FsEditFileAndApplyDiffResponse`\>

Edits a file and applies a diff with AI assistance.

##### Parameters

###### filePath

`string`

The path to the file to edit.

###### diff

`string`

The diff to apply.

###### diffIdentifier

`string`

The identifier for the diff.

###### prompt

`string`

The prompt for the AI model.

###### applyModel?

`string`

Optional model to use for applying the diff.

##### Returns

`Promise`\<`FsEditFileAndApplyDiffResponse`\>

A promise that resolves with the edit response.

***

### vectordb

> **vectordb**: `object` = `vectorDB`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:155](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L155)

#### addVectorItem()

> **addVectorItem**: (`item`) => `Promise`\<`AddVectorItemResponse`\>

Adds a new vector item to the vector database.

##### Parameters

###### item

`any`

The item to add to the vector.

##### Returns

`Promise`\<`AddVectorItemResponse`\>

A promise that resolves when the item is successfully added.

#### getVector()

> **getVector**: (`key`) => `Promise`\<`GetVectorResponse`\>

Retrieves a vector from the vector database based on the provided key.

##### Parameters

###### key

`string`

The key of the vector to retrieve.

##### Returns

`Promise`\<`GetVectorResponse`\>

A promise that resolves with the retrieved vector.

#### queryVectorItem()

> **queryVectorItem**: (`key`) => `Promise`\<`QueryVectorItemResponse`\>

Queries a vector item from the vector database based on the provided key.

##### Parameters

###### key

`string`

The key of the vector to query the item from.

##### Returns

`Promise`\<`QueryVectorItemResponse`\>

A promise that resolves with the queried vector item.

#### queryVectorItems()

> **queryVectorItems**: (`items`, `dbPath`) => `Promise`\<`QueryVectorItemResponse`\>

Queries a vector item from the vector database based on the provided key.

##### Parameters

###### items

\[\]

###### dbPath

`string`

##### Returns

`Promise`\<`QueryVectorItemResponse`\>

A promise that resolves with the queried vector item.

***

### websocket

> **websocket**: `null` \| `WebSocket` = `null`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:72](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L72)

## Accessors

### ready

#### Get Signature

> **get** **ready**(): `boolean`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:131](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L131)

##### Method

isReady

##### Description

Checks if the Codebolt instance is ready for use.

##### Returns

`boolean`

True if the instance is ready, false otherwise.

## Methods

### getMessage()

> **getMessage**(): `Promise`\<`FlatUserMessage`\>

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:237](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L237)

Gets the current or next incoming message.
Priority order:
1. Returns the current message being processed (if called during message handling)
2. Returns a queued message (if any are waiting)
3. Waits for the next message to arrive

This allows getMessage() to work both during active message processing
and when waiting for new messages in a loop.

#### Returns

`Promise`\<`FlatUserMessage`\>

A promise that resolves with the message

***

### handleIncomingMessage()

> `private` **handleIncomingMessage**(`message`): `void`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:270](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L270)

Handles an incoming message by either resolving a waiting promise
or adding it to the queue if no promises are waiting.

#### Parameters

##### message

`FlatUserMessage`

#### Returns

`void`

***

### initializeConnection()

> `private` **initializeConnection**(): `Promise`\<`void`\>

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:96](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L96)

#### Returns

`Promise`\<`void`\>

#### Method

initializeConnection

#### Description

Initializes the WebSocket connection asynchronously.

***

### onActionBlockInvocation()

> **onActionBlockInvocation**(`handler`): `void`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:405](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L405)

Sets up a listener for ActionBlock invocation events.
This is called when a Side Execution ActionBlock is invoked by a parent agent.

#### Parameters

##### handler

(`threadContext`, `metadata`) => `any`

The handler function to call when ActionBlock is invoked.
  - params: The parameters passed to the ActionBlock
  - threadContext: The thread context from the parent agent
  - metadata: Additional metadata (sideExecutionId, threadId, parentAgentId, etc.)

#### Returns

`void`

***

### onCloseSignal()

> **onCloseSignal**(`handler`): `void`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:996](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L996)

Sets up a listener for close signal events.

#### Parameters

##### handler

() => `any`

The handler function to call when close signal is received.

#### Returns

`void`

***

### onCopyFile()

> **onCopyFile**(`handler`): `void`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:876](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L876)

Sets up a listener for copy file events.

#### Parameters

##### handler

(`sourcePath`, `destinationPath`) => `any`

The handler function to call when copy file is requested.

#### Returns

`void`

***

### onCopyFolder()

> **onCopyFolder**(`handler`): `void`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:916](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L916)

Sets up a listener for copy folder events.

#### Parameters

##### handler

(`sourcePath`, `destinationPath`) => `any`

The handler function to call when copy folder is requested.

#### Returns

`void`

***

### onCreateFolder()

> **onCreateFolder**(`handler`): `void`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:836](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L836)

Sets up a listener for create folder events.

#### Parameters

##### handler

(`path`) => `any`

The handler function to call when create folder is requested.

#### Returns

`void`

***

### onCreatePatchRequest()

> **onCreatePatchRequest**(`handler`): `void`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:1034](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L1034)

Sets up a listener for create patch request events.

#### Parameters

##### handler

() => `any`

The handler function to call when patch request is created.

#### Returns

`void`

***

### onCreatePullRequestRequest()

> **onCreatePullRequestRequest**(`handler`): `void`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:1072](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L1072)

Sets up a listener for create pull request events.

#### Parameters

##### handler

() => `any`

The handler function to call when pull request is created.

#### Returns

`void`

***

### onDeleteFile()

> **onDeleteFile**(`handler`): `void`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:716](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L716)

Sets up a listener for delete file events.

#### Parameters

##### handler

(`path`) => `any`

The handler function to call when delete file is requested.

#### Returns

`void`

***

### onDeleteFolder()

> **onDeleteFolder**(`handler`): `void`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:756](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L756)

Sets up a listener for delete folder events.

#### Parameters

##### handler

(`path`) => `any`

The handler function to call when delete folder is requested.

#### Returns

`void`

***

### onEnvironmentHeartbeatRequest()

> **onEnvironmentHeartbeatRequest**(`handler`): `void`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:1342](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L1342)

Sets up a listener for environment heartbeat requests.
Environment executors should respond with their current status.

#### Parameters

##### handler

(`request`) => `void` \| `Promise`\<`void`\> \| \{ `remoteExecutorStatus`: `"error"` \| `"running"` \| `"starting"` \| `"stopped"` \| `"restarting"`; `status`: `"active"` \| `"degraded"` \| `"unreachable"`; \} \| `Promise`\<\{ `remoteExecutorStatus`: `"error"` \| `"running"` \| `"starting"` \| `"stopped"` \| `"restarting"`; `status`: `"active"` \| `"degraded"` \| `"unreachable"`; \}\>

The handler function to call when heartbeat is requested

#### Returns

`void`

***

### onEnvironmentRestartRequest()

> **onEnvironmentRestartRequest**(`handler`): `void`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:1397](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L1397)

Sets up a listener for environment restart requests from the main application.

#### Parameters

##### handler

(`request`) => `void` \| `Promise`\<`void`\> \| \{ `message?`: `string`; `success`: `boolean`; \} \| `Promise`\<\{ `message?`: `string`; `success`: `boolean`; \}\>

The handler function to restart the environment/remote executor

#### Returns

`void`

***

### onGetDiffFiles()

> **onGetDiffFiles**(`handler`): `void`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:597](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L597)

Sets up a listener for get diff files events.

#### Parameters

##### handler

() => `any`

The handler function to call when diff files are requested.

#### Returns

`void`

***

### onGetFullProject()

> **onGetFullProject**(`handler`): `void`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:956](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L956)

Sets up a listener for get full project events.

#### Parameters

##### handler

() => `any`

The handler function to call when get full project is requested.

#### Returns

`void`

***

### onGetTreeChildren()

> **onGetTreeChildren**(`handler`): `void`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:1190](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L1190)

Sets up a listener for get tree children events.

#### Parameters

##### handler

(`path`) => `any`

The handler function to call when tree children are requested.

#### Returns

`void`

***

### onMergeAsPatch()

> **onMergeAsPatch**(`handler`): `void`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:1110](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L1110)

Sets up a listener for merge as patch events.

#### Parameters

##### handler

() => `any`

The handler function to call when merge as patch is requested.

#### Returns

`void`

***

### onMessage()

> **onMessage**(`handler`): `void`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:335](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L335)

Sets up a listener for incoming messages with a direct handler function.
Note: Message extraction and resolver handling is done by setupMessageListener.
This method only adds the custom handler logic and sends processStoped response.

#### Parameters

##### handler

(`userMessage`, `additionalVariable?`) => `any`

The handler function to call when a message is received.

#### Returns

`void`

***

### onProviderAgentStart()

> **onProviderAgentStart**(`handler`): `void`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:517](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L517)

Sets up a listener for provider agent start events.

#### Parameters

##### handler

(`userMessage`) => `any`

The handler function to call when provider agent starts.

#### Returns

`void`

***

### onProviderHeartbeatRequest()

> **onProviderHeartbeatRequest**(`handler`): `void`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:1294](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L1294)

Sets up a listener for provider heartbeat requests from the main application.
Providers should respond with their current health status.

#### Parameters

##### handler

(`request`) => `void` \| `Promise`\<`void`\> \| \{ `connectedEnvironments`: `string`[]; `status`: `"error"` \| `"healthy"` \| `"degraded"`; \} \| `Promise`\<\{ `connectedEnvironments`: `string`[]; `status`: `"error"` \| `"healthy"` \| `"degraded"`; \}\>

The handler function to call when heartbeat is requested

#### Returns

`void`

***

### onProviderStart()

> **onProviderStart**(`handler`): `void`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:479](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L479)

Sets up a listener for provider start events.

#### Parameters

##### handler

(`initvars`) => `any`

The handler function to call when provider starts.

#### Returns

`void`

***

### onProviderStop()

> **onProviderStop**(`handler`): `void`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:558](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L558)

Sets up a listener for provider stop events.

#### Parameters

##### handler

(`initvars`) => `any`

The handler function to call when provider stops.

#### Returns

`void`

***

### onRawMessage()

> **onRawMessage**(`handler`): `void`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:461](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L461)

#### Parameters

##### handler

(`userMessage`) => `any`

#### Returns

`void`

***

### onReadFile()

> **onReadFile**(`handler`): `void`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:636](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L636)

Sets up a listener for read file events.

#### Parameters

##### handler

(`path`) => `any`

The handler function to call when read file is requested.

#### Returns

`void`

***

### onReady()

> **onReady**(`handler`): `void`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:206](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L206)

Sets up a handler function to be executed when the WebSocket connection is established.
If the connection is already established, the handler will be executed immediately.

#### Parameters

##### handler

() => `void` \| `Promise`\<`void`\>

The handler function to call when the connection is ready.

#### Returns

`void`

***

### onRenameItem()

> **onRenameItem**(`handler`): `void`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:796](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L796)

Sets up a listener for rename item events.

#### Parameters

##### handler

(`oldPath`, `newPath`) => `any`

The handler function to call when rename item is requested.

#### Returns

`void`

***

### onSendPR()

> **onSendPR**(`handler`): `void`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:1150](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L1150)

Sets up a listener for send PR events.

#### Parameters

##### handler

() => `any`

The handler function to call when send PR is requested.

#### Returns

`void`

***

### onWriteFile()

> **onWriteFile**(`handler`): `void`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:676](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L676)

Sets up a listener for write file events.

#### Parameters

##### handler

(`path`, `content`) => `any`

The handler function to call when write file is requested.

#### Returns

`void`

***

### sendEnvironmentHeartbeat()

> **sendEnvironmentHeartbeat**(`heartbeatData`): `void`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:1269](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L1269)

Sends an environment heartbeat request to the remote executor.

#### Parameters

##### heartbeatData

The heartbeat data to send

###### environmentId

`string`

The environment ID

###### providerId

`string`

The provider ID

#### Returns

`void`

***

### sendProviderHeartbeat()

> **sendProviderHeartbeat**(`heartbeatData`): `void`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:1237](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L1237)

Sends a provider heartbeat to the main application.
Should be called periodically by providers to indicate they are alive.

#### Parameters

##### heartbeatData

The heartbeat data to send

###### connectedEnvironments

`string`[]

Array of connected environment IDs

###### metadata?

`Record`\<`string`, `any`\>

Optional metadata

###### providerId

`string`

The provider ID

###### status

`"error"` \| `"healthy"` \| `"degraded"`

The provider health status ('healthy', 'degraded', 'error')

###### uptime?

`number`

#### Returns

`void`

***

### setupMessageListener()

> `private` **setupMessageListener**(): `void`

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:286](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L286)

Sets up a background listener for all messageResponse messages from the socket.
This ensures that getMessage() promises are always resolved even if onMessage() is not called.

#### Returns

`void`

***

### waitForReady()

> **waitForReady**(): `Promise`\<`void`\>

Defined in: [packages/codeboltjs/src/core/Codebolt.ts:122](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/core/Codebolt.ts#L122)

#### Returns

`Promise`\<`void`\>

A promise that resolves when the instance is ready.

#### Method

waitForReady

#### Description

Waits for the Codebolt instance to be fully initialized.
