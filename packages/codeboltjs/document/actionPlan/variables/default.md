[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [packages/codeboltjs/src/modules/actionPlan.ts:19](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/actionPlan.ts#L19)

## Type Declaration

### addGroupToActionPlan()

> **addGroupToActionPlan**: (`planId`, `group`) => `Promise`\<`any`\>

Add a group to an action plan

#### Parameters

##### planId

`string`

The ID of the action plan

##### group

[`ActionPlanGroup`](../interfaces/ActionPlanGroup.md)

Group data to add (type, name, groupItems/loopTasks/ifTasks/waitTasks, etc.)

#### Returns

`Promise`\<`any`\>

Promise with added group and updated action plan

### addTaskToActionPlan()

> **addTaskToActionPlan**: (`planId`, `task`) => `Promise`\<`any`\>

Add a task to an action plan

#### Parameters

##### planId

`string`

The ID of the action plan

##### task

[`ActionPlanTask`](../interfaces/ActionPlanTask.md)

Task data to add (name, description, priority, taskType, etc.)

#### Returns

`Promise`\<`any`\>

Promise with added task and updated action plan

### createActionPlan()

> **createActionPlan**: (`payload`) => `Promise`\<`any`\>

Create a new action plan

#### Parameters

##### payload

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

#### Returns

`Promise`\<`any`\>

Promise with created action plan

### getActionPlanDetail()

> **getActionPlanDetail**: (`planId`) => `Promise`\<`any`\>

Get action plan detail by ID (alternative method)

#### Parameters

##### planId

`string`

The ID of the action plan

#### Returns

`Promise`\<`any`\>

Promise with action plan details

### getAllPlans()

> **getAllPlans**: () => `Promise`\<`any`\>

Get all action plans

#### Returns

`Promise`\<`any`\>

Promise with all action plans

### getPlanDetail()

> **getPlanDetail**: (`planId`) => `Promise`\<`any`\>

Get action plan detail by ID

#### Parameters

##### planId

`string`

The ID of the action plan

#### Returns

`Promise`\<`any`\>

Promise with action plan details

### startTaskStep()

> **startTaskStep**: (`planId`, `taskId`) => `Promise`\<`any`\>

Start/execute a task step in an action plan

#### Parameters

##### planId

`string`

The ID of the action plan

##### taskId

`string`

The ID of the task to start

#### Returns

`Promise`\<`any`\>

Promise with task execution status

### startTaskStepWithListener()

> **startTaskStepWithListener**: (`planId`, `taskId`, `onResponse`) => () => `void`

Start/execute a task step in an action plan with event listener

#### Parameters

##### planId

`string`

The ID of the action plan

##### taskId

`string`

The ID of the task to start

##### onResponse

(`response`) => `void`

Callback function that will be called when receiving responses for this task

#### Returns

Cleanup function to remove the event listener

> (): `void`

##### Returns

`void`

### updateActionPlan()

> **updateActionPlan**: (`planId`, `updateData`) => `Promise`\<`any`\>

Update an existing action plan

#### Parameters

##### planId

`string`

The ID of the action plan to update

##### updateData

[`ActionPlanUpdateData`](../interfaces/ActionPlanUpdateData.md)

Data to update in the action plan

#### Returns

`Promise`\<`any`\>

Promise with updated action plan
