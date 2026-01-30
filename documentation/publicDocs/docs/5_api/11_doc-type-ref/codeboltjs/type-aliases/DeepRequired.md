---
title: DeepRequired
---

[**@codebolt/codeboltjs**](../README)

***

# Type Alias: DeepRequired\<T\>

```ts
type DeepRequired<T> = { [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P] };
```

Defined in: [packages/codeboltjs/src/types/commonTypes.ts:269](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/commonTypes.ts#L269)

Makes all properties of T required recursively

## Type Parameters

| Type Parameter |
| ------ |
| `T` |
