---
title: Optional
---

[**@codebolt/codeboltjs**](../README)

***

# Type Alias: Optional\<T, K\>

```ts
type Optional<T, K> = Omit<T, K> & Partial<Pick<T, K>>;
```

Defined in: [packages/codeboltjs/src/types/commonTypes.ts:283](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/commonTypes.ts#L283)

Make specific properties optional

## Type Parameters

| Type Parameter |
| ------ |
| `T` |
| `K` *extends* keyof `T` |
