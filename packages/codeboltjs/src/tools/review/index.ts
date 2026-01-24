/**
 * Review operations tools
 */

export { ReviewCreateTool, type ReviewCreateToolParams } from './review-create';
export { ReviewGetTool, type ReviewGetToolParams } from './review-get';
export { ReviewListTool, type ReviewListToolParams } from './review-list';
export { ReviewUpdateTool, type ReviewUpdateToolParams } from './review-update';
export { ReviewSubmitTool, type ReviewSubmitToolParams } from './review-submit';
export { ReviewApproveTool, type ReviewApproveToolParams } from './review-approve';
export { ReviewRequestChangesTool, type ReviewRequestChangesToolParams } from './review-request-changes';
export { ReviewAddCommentTool, type ReviewAddCommentToolParams } from './review-add-comment';

// Create instances for convenience
import { ReviewCreateTool } from './review-create';
import { ReviewGetTool } from './review-get';
import { ReviewListTool } from './review-list';
import { ReviewUpdateTool } from './review-update';
import { ReviewSubmitTool } from './review-submit';
import { ReviewApproveTool } from './review-approve';
import { ReviewRequestChangesTool } from './review-request-changes';
import { ReviewAddCommentTool } from './review-add-comment';

/**
 * All review operation tools
 */
export const reviewTools = [
    new ReviewCreateTool(),
    new ReviewGetTool(),
    new ReviewListTool(),
    new ReviewUpdateTool(),
    new ReviewSubmitTool(),
    new ReviewApproveTool(),
    new ReviewRequestChangesTool(),
    new ReviewAddCommentTool(),
];
