---
title: ReviewRequestStatus
---

[**@codebolt/codeboltjs**](../index)

***

# Type Alias: ReviewRequestStatus

```ts
type ReviewRequestStatus = 
  | "draft"
  | "pending_review"
  | "in_review"
  | "changes_requested"
  | "approved"
  | "review_completed"
  | "merged"
  | "rejected"
  | "closed";
```

Defined in: [packages/codeboltjs/src/types/reviewMergeRequest.ts:6](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/reviewMergeRequest.ts#L6)

Request status types representing the lifecycle of a review request
