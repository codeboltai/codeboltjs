---
title: Workflow
---

[**@codebolt/agent**](../../README)

***

# Class: Workflow

Defined in: [packages/agent/src/unified/agent/workflow.ts:4](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/agent/workflow.ts#L4)

## Implements

- `BaseWorkflow`

## Constructors

### Constructor

```ts
new Workflow(config: workflowConfig): Workflow;
```

Defined in: [packages/agent/src/unified/agent/workflow.ts:12](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/agent/workflow.ts#L12)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `config` | `workflowConfig` |

#### Returns

`Workflow`

## Methods

### execute()

```ts
execute(): WorkflowResult;
```

Defined in: [packages/agent/src/unified/agent/workflow.ts:16](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/agent/workflow.ts#L16)

#### Returns

`WorkflowResult`

#### Implementation of

```ts
BaseWorkflow.execute
```

***

### executeAsync()

```ts
executeAsync(): Promise<WorkflowResult>;
```

Defined in: [packages/agent/src/unified/agent/workflow.ts:188](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/agent/workflow.ts#L188)

#### Returns

`Promise`\<`WorkflowResult`\>

***

### executeStep()

```ts
executeStep(): workflowStepOutput;
```

Defined in: [packages/agent/src/unified/agent/workflow.ts:65](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/agent/workflow.ts#L65)

#### Returns

`workflowStepOutput`

#### Implementation of

```ts
BaseWorkflow.executeStep
```

***

### executeStepAsync()

```ts
executeStepAsync(): Promise<workflowStepOutput>;
```

Defined in: [packages/agent/src/unified/agent/workflow.ts:236](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/agent/workflow.ts#L236)

#### Returns

`Promise`\<`workflowStepOutput`\>

***

### executeSteps()

```ts
executeSteps(): workflowStepOutput[];
```

Defined in: [packages/agent/src/unified/agent/workflow.ts:104](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/agent/workflow.ts#L104)

#### Returns

`workflowStepOutput`[]

#### Implementation of

```ts
BaseWorkflow.executeSteps
```

***

### executeStepsAsync()

```ts
executeStepsAsync(): Promise<workflowStepOutput[]>;
```

Defined in: [packages/agent/src/unified/agent/workflow.ts:278](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/agent/workflow.ts#L278)

#### Returns

`Promise`\<`workflowStepOutput`[]\>

***

### getContext()

```ts
getContext(): any;
```

Defined in: [packages/agent/src/unified/agent/workflow.ts:149](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/agent/workflow.ts#L149)

#### Returns

`any`

#### Implementation of

```ts
BaseWorkflow.getContext
```

***

### getCurrentStepIndex()

```ts
getCurrentStepIndex(): number;
```

Defined in: [packages/agent/src/unified/agent/workflow.ts:166](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/agent/workflow.ts#L166)

#### Returns

`number`

***

### getExecutionId()

```ts
getExecutionId(): string;
```

Defined in: [packages/agent/src/unified/agent/workflow.ts:174](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/agent/workflow.ts#L174)

#### Returns

`string`

***

### getStepResults()

```ts
getStepResults(): workflowStepOutput[];
```

Defined in: [packages/agent/src/unified/agent/workflow.ts:182](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/agent/workflow.ts#L182)

#### Returns

`workflowStepOutput`[]

***

### getTotalSteps()

```ts
getTotalSteps(): number;
```

Defined in: [packages/agent/src/unified/agent/workflow.ts:170](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/agent/workflow.ts#L170)

#### Returns

`number`

***

### reset()

```ts
reset(): void;
```

Defined in: [packages/agent/src/unified/agent/workflow.ts:158](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/agent/workflow.ts#L158)

#### Returns

`void`

***

### setInitialContext()

```ts
setInitialContext(context: any): void;
```

Defined in: [packages/agent/src/unified/agent/workflow.ts:178](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/agent/workflow.ts#L178)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `context` | `any` |

#### Returns

`void`

***

### updateContext()

```ts
updateContext(newContext: any): void;
```

Defined in: [packages/agent/src/unified/agent/workflow.ts:153](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/agent/src/unified/agent/workflow.ts#L153)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `newContext` | `any` |

#### Returns

`void`

#### Implementation of

```ts
BaseWorkflow.updateContext
```
