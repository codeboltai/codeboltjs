[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / ActionPlanGroup

# Interface: ActionPlanGroup

Defined in: common/types/dist/codeboltjstypes/libFunctionTypes/actionPlan.d.ts:38

Action plan group structure

## Properties

### condition?

> `optional` **condition**: `string`

Defined in: common/types/dist/codeboltjstypes/libFunctionTypes/actionPlan.d.ts:45

***

### groupItems?

> `optional` **groupItems**: `Record`\<`string`, [`ActionPlanTask`](ActionPlanTask.md)[]\>

Defined in: common/types/dist/codeboltjstypes/libFunctionTypes/actionPlan.d.ts:41

***

### ifTasks?

> `optional` **ifTasks**: [`ActionPlanTask`](ActionPlanTask.md)[]

Defined in: common/types/dist/codeboltjstypes/libFunctionTypes/actionPlan.d.ts:43

***

### loopTasks?

> `optional` **loopTasks**: [`ActionPlanTask`](ActionPlanTask.md)[]

Defined in: common/types/dist/codeboltjstypes/libFunctionTypes/actionPlan.d.ts:42

***

### metadata?

> `optional` **metadata**: `Record`\<`string`, `unknown`\>

Defined in: common/types/dist/codeboltjstypes/libFunctionTypes/actionPlan.d.ts:46

***

### name?

> `optional` **name**: `string`

Defined in: common/types/dist/codeboltjstypes/libFunctionTypes/actionPlan.d.ts:40

***

### type

> **type**: `ActionPlanGroupType`

Defined in: common/types/dist/codeboltjstypes/libFunctionTypes/actionPlan.d.ts:39

***

### waitTasks?

> `optional` **waitTasks**: [`ActionPlanTask`](ActionPlanTask.md)[]

Defined in: common/types/dist/codeboltjstypes/libFunctionTypes/actionPlan.d.ts:44
