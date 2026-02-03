import { CodeboltModule, param, fn } from './types';

export const reviewMergeRequestModule: CodeboltModule = {
  name: 'reviewMergeRequest',
  displayName: 'Review Merge Request',
  description: 'Code review and merge request management',
  category: 'review',
  functions: [
    fn('list', 'Lists merge requests', [
      param('filters', 'object', false, 'Filter options'),
    ], 'MergeRequestListResponse'),
    fn('get', 'Gets merge request', [
      param('id', 'string', true, 'Request ID'),
    ], 'MergeRequestResponse'),
    fn('create', 'Creates merge request', [
      param('data', 'object', true, 'Request data'),
    ], 'MergeRequestResponse'),
    fn('update', 'Updates merge request', [
      param('id', 'string', true, 'Request ID'),
      param('data', 'object', true, 'Update data'),
    ], 'MergeRequestResponse'),
    fn('delete', 'Deletes merge request', [
      param('id', 'string', true, 'Request ID'),
    ], 'DeleteResponse'),
    fn('addReview', 'Adds review feedback', [
      param('id', 'string', true, 'Request ID'),
      param('feedback', 'object', true, 'Feedback data'),
    ], 'ReviewResponse'),
    fn('updateStatus', 'Updates request status', [
      param('id', 'string', true, 'Request ID'),
      param('status', 'string', true, 'New status'),
    ], 'MergeRequestResponse'),
    fn('merge', 'Merges request', [
      param('id', 'string', true, 'Request ID'),
      param('mergedBy', 'string', true, 'Merger ID'),
    ], 'MergeResponse'),
    fn('addLinkedJob', 'Links a job', [
      param('id', 'string', true, 'Request ID'),
      param('jobId', 'string', true, 'Job ID'),
    ], 'MergeRequestResponse'),
    fn('removeLinkedJob', 'Removes job link', [
      param('id', 'string', true, 'Request ID'),
      param('jobId', 'string', true, 'Job ID'),
    ], 'MergeRequestResponse'),
    fn('pending', 'Gets pending requests', [], 'MergeRequestListResponse'),
    fn('readyToMerge', 'Gets ready-to-merge requests', [], 'MergeRequestListResponse'),
    fn('byAgent', 'Gets by agent', [
      param('agentId', 'string', true, 'Agent ID'),
    ], 'MergeRequestListResponse'),
    fn('bySwarm', 'Gets by swarm', [
      param('swarmId', 'string', true, 'Swarm ID'),
    ], 'MergeRequestListResponse'),
    fn('statistics', 'Gets statistics', [], 'StatisticsResponse'),
  ],
};

export const groupFeedbackModule: CodeboltModule = {
  name: 'groupFeedback',
  displayName: 'Group Feedback',
  description: 'Group feedback management',
  category: 'review',
  functions: [
    fn('create', 'Creates feedback', [
      param('topic', 'string', true, 'Feedback topic'),
      param('description', 'string', false, 'Feedback description'),
      param('participants', 'array', true, 'Participant IDs'),
    ], 'FeedbackResponse'),
    fn('get', 'Gets feedback', [
      param('feedbackId', 'string', true, 'Feedback ID'),
    ], 'FeedbackResponse'),
    fn('list', 'Lists feedback', [
      param('filters', 'object', false, 'Filter options'),
    ], 'FeedbackListResponse'),
    fn('respond', 'Responds to feedback', [
      param('feedbackId', 'string', true, 'Feedback ID'),
      param('agentId', 'string', true, 'Agent ID'),
      param('response', 'string', true, 'Response content'),
    ], 'ResponseResponse'),
    fn('reply', 'Replies to feedback', [
      param('feedbackId', 'string', true, 'Feedback ID'),
      param('responseId', 'string', true, 'Response ID'),
      param('reply', 'string', true, 'Reply content'),
    ], 'ReplyResponse'),
    fn('updateSummary', 'Updates summary', [
      param('feedbackId', 'string', true, 'Feedback ID'),
      param('summary', 'string', true, 'Summary content'),
    ], 'FeedbackResponse'),
    fn('updateStatus', 'Updates status', [
      param('feedbackId', 'string', true, 'Feedback ID'),
      param('status', 'string', true, 'New status'),
    ], 'FeedbackResponse'),
  ],
};

export const fileUpdateIntentModule: CodeboltModule = {
  name: 'fileUpdateIntent',
  displayName: 'File Update Intent',
  description: 'File update intent management',
  category: 'review',
  functions: [
    fn('create', 'Creates file update intent', [
      param('data', 'object', true, 'Intent data'),
      param('claimedBy', 'string', true, 'Claimed by agent ID'),
      param('claimedByName', 'string', false, 'Agent name'),
    ], 'IntentResponse'),
    fn('update', 'Updates intent', [
      param('id', 'string', true, 'Intent ID'),
      param('data', 'object', true, 'Update data'),
    ], 'IntentResponse'),
    fn('get', 'Gets intent', [
      param('id', 'string', true, 'Intent ID'),
    ], 'IntentResponse'),
    fn('list', 'Lists intents', [
      param('filters', 'object', false, 'Filter options'),
    ], 'IntentListResponse'),
    fn('complete', 'Completes intent', [
      param('id', 'string', true, 'Intent ID'),
      param('closedBy', 'string', true, 'Closed by agent ID'),
    ], 'IntentResponse'),
    fn('cancel', 'Cancels intent', [
      param('id', 'string', true, 'Intent ID'),
      param('cancelledBy', 'string', true, 'Cancelled by agent ID'),
    ], 'IntentResponse'),
    fn('checkOverlap', 'Checks for overlap', [
      param('environmentId', 'string', true, 'Environment ID'),
      param('filePaths', 'array', true, 'File paths'),
      param('priority', 'number', false, 'Priority level'),
    ], 'OverlapResponse'),
    fn('getBlockedFiles', 'Gets blocked files', [
      param('environmentId', 'string', true, 'Environment ID'),
    ], 'BlockedFilesResponse'),
    fn('getByAgent', 'Gets by agent', [
      param('agentId', 'string', true, 'Agent ID'),
    ], 'IntentListResponse'),
    fn('getFilesWithIntents', 'Gets files with intents', [
      param('environmentId', 'string', true, 'Environment ID'),
    ], 'FilesWithIntentsResponse'),
    fn('delete', 'Deletes intent', [
      param('id', 'string', true, 'Intent ID'),
    ], 'DeleteResponse'),
  ],
};

export const projectStructureUpdateRequestModule: CodeboltModule = {
  name: 'projectStructureUpdateRequest',
  displayName: 'Project Structure Update Request',
  description: 'Project structure update request management',
  category: 'review',
  functions: [
    fn('create', 'Creates update request', [
      param('data', 'object', true, 'Request data'),
      param('workspacePath', 'string', false, 'Workspace path'),
    ], 'UpdateRequestResponse'),
    fn('get', 'Gets update request', [
      param('id', 'string', true, 'Request ID'),
      param('workspacePath', 'string', false, 'Workspace path'),
    ], 'UpdateRequestResponse'),
    fn('list', 'Lists update requests', [
      param('filters', 'object', false, 'Filter options'),
      param('workspacePath', 'string', false, 'Workspace path'),
    ], 'UpdateRequestListResponse'),
    fn('update', 'Updates request', [
      param('id', 'string', true, 'Request ID'),
      param('updates', 'object', true, 'Update data'),
      param('workspacePath', 'string', false, 'Workspace path'),
    ], 'UpdateRequestResponse'),
    fn('delete', 'Deletes request', [
      param('id', 'string', true, 'Request ID'),
      param('workspacePath', 'string', false, 'Workspace path'),
    ], 'DeleteResponse'),
    fn('submit', 'Submits request', [
      param('id', 'string', true, 'Request ID'),
      param('workspacePath', 'string', false, 'Workspace path'),
    ], 'UpdateRequestResponse'),
    fn('startWork', 'Starts work on request', [
      param('id', 'string', true, 'Request ID'),
      param('workspacePath', 'string', false, 'Workspace path'),
    ], 'UpdateRequestResponse'),
    fn('complete', 'Completes work', [
      param('id', 'string', true, 'Request ID'),
      param('workspacePath', 'string', false, 'Workspace path'),
    ], 'UpdateRequestResponse'),
    fn('merge', 'Merges request', [
      param('id', 'string', true, 'Request ID'),
      param('workspacePath', 'string', false, 'Workspace path'),
    ], 'UpdateRequestResponse'),
    fn('addDispute', 'Adds dispute', [
      param('id', 'string', true, 'Request ID'),
      param('data', 'object', true, 'Dispute data'),
      param('workspacePath', 'string', false, 'Workspace path'),
    ], 'DisputeResponse'),
    fn('resolveDispute', 'Resolves dispute', [
      param('id', 'string', true, 'Request ID'),
      param('disputeId', 'string', true, 'Dispute ID'),
      param('resolutionSummary', 'string', false, 'Resolution summary'),
      param('workspacePath', 'string', false, 'Workspace path'),
    ], 'DisputeResponse'),
    fn('addComment', 'Adds comment', [
      param('id', 'string', true, 'Request ID'),
      param('disputeId', 'string', true, 'Dispute ID'),
      param('data', 'object', true, 'Comment data'),
      param('workspacePath', 'string', false, 'Workspace path'),
    ], 'CommentResponse'),
    fn('watch', 'Watches request', [
      param('id', 'string', true, 'Request ID'),
      param('data', 'object', true, 'Watcher data'),
      param('workspacePath', 'string', false, 'Workspace path'),
    ], 'WatchResponse'),
    fn('unwatch', 'Stops watching', [
      param('id', 'string', true, 'Request ID'),
      param('watcherId', 'string', true, 'Watcher ID'),
      param('workspacePath', 'string', false, 'Workspace path'),
    ], 'WatchResponse'),
  ],
};
