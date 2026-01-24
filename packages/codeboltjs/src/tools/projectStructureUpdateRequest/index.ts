/**
 * Project Structure Update Request Tools
 * 
 * Tools for managing project structure update requests for multi-agent coordination.
 */

export { UpdateRequestCreateTool } from './update-request-create';
export { UpdateRequestGetTool } from './update-request-get';
export { UpdateRequestListTool } from './update-request-list';
export { UpdateRequestUpdateTool } from './update-request-update';
export { UpdateRequestDeleteTool } from './update-request-delete';
export { UpdateRequestSubmitTool } from './update-request-submit';
export { UpdateRequestStartWorkTool } from './update-request-start-work';
export { UpdateRequestCompleteTool } from './update-request-complete';
export { UpdateRequestMergeTool } from './update-request-merge';
export { UpdateRequestAddDisputeTool } from './update-request-add-dispute';
export { UpdateRequestResolveDisputeTool } from './update-request-resolve-dispute';
export { UpdateRequestAddCommentTool } from './update-request-add-comment';
export { UpdateRequestWatchTool } from './update-request-watch';
export { UpdateRequestUnwatchTool } from './update-request-unwatch';

import { UpdateRequestCreateTool } from './update-request-create';
import { UpdateRequestGetTool } from './update-request-get';
import { UpdateRequestListTool } from './update-request-list';
import { UpdateRequestUpdateTool } from './update-request-update';
import { UpdateRequestDeleteTool } from './update-request-delete';
import { UpdateRequestSubmitTool } from './update-request-submit';
import { UpdateRequestStartWorkTool } from './update-request-start-work';
import { UpdateRequestCompleteTool } from './update-request-complete';
import { UpdateRequestMergeTool } from './update-request-merge';
import { UpdateRequestAddDisputeTool } from './update-request-add-dispute';
import { UpdateRequestResolveDisputeTool } from './update-request-resolve-dispute';
import { UpdateRequestAddCommentTool } from './update-request-add-comment';
import { UpdateRequestWatchTool } from './update-request-watch';
import { UpdateRequestUnwatchTool } from './update-request-unwatch';

/**
 * Array of all project structure update request tools
 */
export const projectStructureUpdateRequestTools = [
    new UpdateRequestCreateTool(),
    new UpdateRequestGetTool(),
    new UpdateRequestListTool(),
    new UpdateRequestUpdateTool(),
    new UpdateRequestDeleteTool(),
    new UpdateRequestSubmitTool(),
    new UpdateRequestStartWorkTool(),
    new UpdateRequestCompleteTool(),
    new UpdateRequestMergeTool(),
    new UpdateRequestAddDisputeTool(),
    new UpdateRequestResolveDisputeTool(),
    new UpdateRequestAddCommentTool(),
    new UpdateRequestWatchTool(),
    new UpdateRequestUnwatchTool(),
];
