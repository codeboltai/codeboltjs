---
title: Optional
---

[**@codebolt/codeboltjs**](../index)

***

# Type Alias: Optional\<T, K\>

```ts
type Optional<T, K> = Omit<T, K> & Partial<Pick<T, K>>;
```

Defined in: [packages/codeboltjs/src/types/commonTypes.ts:283](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/commonTypes.ts#L283)

Make specific properties optional

## Type Parameters

| Type Parameter |
| ------ |
| `T` |
| `K` *extends* keyof `T` |
