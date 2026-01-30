---
title: DeepPartial
---

[**@codebolt/codeboltjs**](../README)

***

# Type Alias: DeepPartial\<T\>

```ts
type DeepPartial<T> = { [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P] };
```

Defined in: [packages/codeboltjs/src/types/commonTypes.ts:262](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/commonTypes.ts#L262)

Makes all properties of T optional recursively

## Type Parameters

| Type Parameter |
| ------ |
| `T` |
