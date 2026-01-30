---
title: Required
---

[**@codebolt/codeboltjs**](../README)

***

# Type Alias: Required\<T, K\>

```ts
type Required<T, K> = T & { [P in K]-?: T[P] };
```

Defined in: [packages/codeboltjs/src/types/commonTypes.ts:288](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/commonTypes.ts#L288)

Make specific properties required

## Type Parameters

| Type Parameter |
| ------ |
| `T` |
| `K` *extends* keyof `T` |
