---
title: contextAssembly
---

[**@codebolt/codeboltjs**](../README)

***

# Variable: contextAssembly

```ts
const contextAssembly: {
  evaluateRules: (request: ContextAssemblyRequest, ruleEngineIds?: string[]) => Promise<RuleEvaluationResponse>;
  getContext: (request: ContextAssemblyRequest) => Promise<ContextAssemblyResponse>;
  getRequiredVariables: (memoryNames: string[]) => Promise<RequiredVariablesResponse>;
  listMemoryTypes: () => Promise<MemoryTypesResponse>;
  validate: (request: ContextAssemblyRequest) => Promise<ContextValidateResponse>;
};
```

Defined in: [packages/codeboltjs/src/modules/contextAssembly.ts:17](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/contextAssembly.ts#L17)

## Type Declaration

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="evaluaterules"></a> `evaluateRules()` | (`request`: [`ContextAssemblyRequest`](../interfaces/ContextAssemblyRequest), `ruleEngineIds?`: `string`[]) => `Promise`\<[`RuleEvaluationResponse`](../interfaces/RuleEvaluationResponse)\> | Evaluate rules only without fetching memory content | [packages/codeboltjs/src/modules/contextAssembly.ts:67](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/contextAssembly.ts#L67) |
| <a id="getcontext"></a> `getContext()` | (`request`: [`ContextAssemblyRequest`](../interfaces/ContextAssemblyRequest)) => `Promise`\<[`ContextAssemblyResponse`](../interfaces/ContextAssemblyResponse)\> | Assemble context from various memory sources | [packages/codeboltjs/src/modules/contextAssembly.ts:22](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/contextAssembly.ts#L22) |
| <a id="getrequiredvariables"></a> `getRequiredVariables()` | (`memoryNames`: `string`[]) => `Promise`\<[`RequiredVariablesResponse`](../interfaces/RequiredVariablesResponse)\> | Get required variables for specific memory types | [packages/codeboltjs/src/modules/contextAssembly.ts:82](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/contextAssembly.ts#L82) |
| <a id="listmemorytypes"></a> `listMemoryTypes()` | () => `Promise`\<[`MemoryTypesResponse`](../interfaces/MemoryTypesResponse)\> | List available memory types | [packages/codeboltjs/src/modules/contextAssembly.ts:51](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/contextAssembly.ts#L51) |
| <a id="validate"></a> `validate()` | (`request`: [`ContextAssemblyRequest`](../interfaces/ContextAssemblyRequest)) => `Promise`\<[`ContextValidateResponse`](../interfaces/ContextValidateResponse)\> | Validate a context assembly request | [packages/codeboltjs/src/modules/contextAssembly.ts:37](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/contextAssembly.ts#L37) |
