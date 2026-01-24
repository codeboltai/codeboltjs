import { CreateReviewMergeRequestTool } from './rmr-create';
import { ListReviewMergeRequestsTool } from './rmr-list';
import { MergeReviewMergeRequestTool } from './rmr-merge';

export const reviewMergeRequestTools = [
    new CreateReviewMergeRequestTool(),
    new ListReviewMergeRequestsTool(),
    new MergeReviewMergeRequestTool(),
];

export * from './rmr-create';
export * from './rmr-list';
export * from './rmr-merge';
