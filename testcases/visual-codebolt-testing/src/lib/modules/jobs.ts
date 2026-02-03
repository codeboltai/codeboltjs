import { CodeboltModule, param, fn } from './types';

export const jobModule: CodeboltModule = {
  name: 'job',
  displayName: 'Job',
  description: 'Job and task management',
  category: 'jobs-tasks',
  functions: [
    fn('createJob', 'Creates a job', [
      param('groupId', 'string', true, 'Job group ID'),
      param('data', 'object', true, 'Job data'),
    ], 'JobResponse'),
    fn('getJob', 'Gets job details', [
      param('jobId', 'string', true, 'Job ID'),
    ], 'JobResponse'),
    fn('updateJob', 'Updates a job', [
      param('jobId', 'string', true, 'Job ID'),
      param('data', 'object', true, 'Update data'),
    ], 'JobResponse'),
    fn('deleteJob', 'Deletes a job', [
      param('jobId', 'string', true, 'Job ID'),
    ], 'DeleteResponse'),
    fn('deleteJobs', 'Deletes multiple jobs', [
      param('jobIds', 'array', true, 'Job IDs'),
    ], 'DeleteResponse'),
    fn('listJobs', 'Lists jobs', [
      param('filters', 'object', false, 'Filter options'),
    ], 'JobListResponse'),
    fn('createJobGroup', 'Creates a job group', [
      param('data', 'object', true, 'Group data'),
    ], 'JobGroupResponse'),
    fn('addDependency', 'Adds job dependency', [
      param('jobId', 'string', true, 'Job ID'),
      param('targetId', 'string', true, 'Target job ID'),
      param('type', 'string', false, 'Dependency type'),
    ], 'DependencyResponse'),
    fn('removeDependency', 'Removes job dependency', [
      param('jobId', 'string', true, 'Job ID'),
      param('targetId', 'string', true, 'Target job ID'),
    ], 'DependencyResponse'),
    fn('getReadyJobs', 'Gets ready jobs', [
      param('filters', 'object', false, 'Filter options'),
    ], 'JobListResponse'),
    fn('getBlockedJobs', 'Gets blocked jobs', [
      param('filters', 'object', false, 'Filter options'),
    ], 'JobListResponse'),
    fn('addLabel', 'Adds a label', [
      param('label', 'string', true, 'Label name'),
    ], 'LabelResponse'),
    fn('removeLabel', 'Removes a label', [
      param('label', 'string', true, 'Label name'),
    ], 'LabelResponse'),
    fn('listLabels', 'Lists all labels', [], 'LabelListResponse'),
    fn('getPheromoneTypes', 'Gets pheromone types', [], 'PheromoneTypesResponse'),
    fn('addPheromoneType', 'Adds pheromone type', [
      param('data', 'object', true, 'Pheromone type data'),
    ], 'PheromoneTypeResponse'),
    fn('removePheromoneType', 'Removes pheromone type', [
      param('name', 'string', true, 'Pheromone type name'),
    ], 'DeleteResponse'),
    fn('depositPheromone', 'Deposits pheromone', [
      param('jobId', 'string', true, 'Job ID'),
      param('deposit', 'object', true, 'Deposit data'),
    ], 'PheromoneResponse'),
    fn('removePheromone', 'Removes pheromone', [
      param('jobId', 'string', true, 'Job ID'),
      param('type', 'string', true, 'Pheromone type'),
      param('depositedBy', 'string', false, 'Deposited by'),
    ], 'PheromoneResponse'),
    fn('getPheromones', 'Gets pheromones', [
      param('jobId', 'string', true, 'Job ID'),
    ], 'PheromonesResponse'),
    fn('getPheromonesAggregated', 'Gets aggregated pheromones', [
      param('jobId', 'string', true, 'Job ID'),
    ], 'PheromonesResponse'),
    fn('listJobsByPheromone', 'Searches by pheromone', [
      param('type', 'string', true, 'Pheromone type'),
      param('minIntensity', 'number', false, 'Minimum intensity'),
    ], 'JobListResponse'),
    fn('getPheromonesWithDecay', 'Gets pheromones with decay', [
      param('jobId', 'string', true, 'Job ID'),
    ], 'PheromonesResponse'),
    fn('getPheromonesAggregatedWithDecay', 'Gets aggregated with decay', [
      param('jobId', 'string', true, 'Job ID'),
    ], 'PheromonesResponse'),
    fn('addSplitProposal', 'Adds split proposal', [
      param('jobId', 'string', true, 'Job ID'),
      param('proposal', 'object', true, 'Proposal data'),
    ], 'ProposalResponse'),
    fn('deleteSplitProposal', 'Deletes split proposal', [
      param('jobId', 'string', true, 'Job ID'),
      param('proposalId', 'string', true, 'Proposal ID'),
    ], 'DeleteResponse'),
    fn('acceptSplitProposal', 'Accepts split proposal', [
      param('jobId', 'string', true, 'Job ID'),
      param('proposalId', 'string', true, 'Proposal ID'),
    ], 'ProposalResponse'),
    fn('lockJob', 'Locks a job', [
      param('jobId', 'string', true, 'Job ID'),
      param('agentId', 'string', true, 'Agent ID'),
      param('agentName', 'string', false, 'Agent name'),
    ], 'LockResponse'),
    fn('unlockJob', 'Unlocks a job', [
      param('jobId', 'string', true, 'Job ID'),
      param('agentId', 'string', true, 'Agent ID'),
    ], 'LockResponse'),
    fn('isJobLocked', 'Checks if job is locked', [
      param('jobId', 'string', true, 'Job ID'),
    ], 'LockStatusResponse'),
    fn('addUnlockRequest', 'Adds unlock request', [
      param('jobId', 'string', true, 'Job ID'),
      param('request', 'object', true, 'Request data'),
    ], 'UnlockRequestResponse'),
    fn('approveUnlockRequest', 'Approves unlock request', [
      param('jobId', 'string', true, 'Job ID'),
      param('unlockRequestId', 'string', true, 'Request ID'),
      param('respondedBy', 'string', true, 'Responder ID'),
    ], 'UnlockRequestResponse'),
    fn('rejectUnlockRequest', 'Rejects unlock request', [
      param('jobId', 'string', true, 'Job ID'),
      param('unlockRequestId', 'string', true, 'Request ID'),
      param('respondedBy', 'string', true, 'Responder ID'),
    ], 'UnlockRequestResponse'),
    fn('deleteUnlockRequest', 'Deletes unlock request', [
      param('jobId', 'string', true, 'Job ID'),
      param('unlockRequestId', 'string', true, 'Request ID'),
    ], 'DeleteResponse'),
    fn('addBid', 'Adds a bid', [
      param('jobId', 'string', true, 'Job ID'),
      param('bid', 'object', true, 'Bid data'),
    ], 'BidResponse'),
    fn('withdrawBid', 'Withdraws a bid', [
      param('jobId', 'string', true, 'Job ID'),
      param('bidId', 'string', true, 'Bid ID'),
    ], 'BidResponse'),
    fn('acceptBid', 'Accepts a bid', [
      param('jobId', 'string', true, 'Job ID'),
      param('bidId', 'string', true, 'Bid ID'),
    ], 'BidResponse'),
    fn('listBids', 'Lists bids', [
      param('jobId', 'string', true, 'Job ID'),
    ], 'BidListResponse'),
    fn('addBlocker', 'Adds a blocker', [
      param('jobId', 'string', true, 'Job ID'),
      param('blocker', 'object', true, 'Blocker data'),
    ], 'BlockerResponse'),
    fn('removeBlocker', 'Removes a blocker', [
      param('jobId', 'string', true, 'Job ID'),
      param('blockerId', 'string', true, 'Blocker ID'),
    ], 'BlockerResponse'),
    fn('resolveBlocker', 'Resolves a blocker', [
      param('jobId', 'string', true, 'Job ID'),
      param('blockerId', 'string', true, 'Blocker ID'),
      param('resolvedBy', 'string', true, 'Resolver ID'),
    ], 'BlockerResponse'),
  ],
};

export const taskModule: CodeboltModule = {
  name: 'task',
  displayName: 'Task',
  description: 'Task management',
  category: 'jobs-tasks',
  functions: [
    fn('createTask', 'Creates a task', [
      param('title', 'string', true, 'Task title'),
      param('description', 'string', false, 'Task description'),
      param('priority', 'string', false, 'Task priority'),
      param('dueDate', 'string', false, 'Due date'),
    ], 'TaskResponse'),
    fn('updateTask', 'Updates a task', [
      param('taskId', 'string', true, 'Task ID'),
      param('updates', 'object', true, 'Update data'),
    ], 'TaskResponse'),
    fn('deleteTask', 'Deletes a task', [
      param('taskId', 'string', true, 'Task ID'),
    ], 'DeleteResponse'),
    fn('getTaskList', 'Gets task list', [
      param('options', 'object', false, 'Filter options'),
    ], 'TaskListResponse'),
    fn('getTaskDetail', 'Gets task details', [
      param('taskId', 'string', true, 'Task ID'),
    ], 'TaskResponse'),
    fn('assignAgentToTask', 'Assigns agent to task', [
      param('taskId', 'string', true, 'Task ID'),
      param('agentId', 'string', true, 'Agent ID'),
    ], 'TaskResponse'),
    fn('executeTaskWithAgent', 'Executes task with agent', [
      param('taskId', 'string', true, 'Task ID'),
      param('agentId', 'string', true, 'Agent ID'),
    ], 'ExecuteResponse'),
    fn('getTaskStatus', 'Gets task status', [
      param('taskId', 'string', true, 'Task ID'),
    ], 'TaskStatusResponse'),
    fn('getTaskSummary', 'Gets task summary', [
      param('taskId', 'string', true, 'Task ID'),
    ], 'TaskSummaryResponse'),
  ],
};

export const todoModule: CodeboltModule = {
  name: 'todo',
  displayName: 'Todo',
  description: 'Todo item management',
  category: 'jobs-tasks',
  functions: [
    fn('addTodo', 'Adds a todo item', [
      param('title', 'string', true, 'Todo title'),
      param('priority', 'string', false, 'Priority level'),
      param('tags', 'array', false, 'Todo tags'),
    ], 'TodoResponse'),
    fn('updateTodo', 'Updates a todo item', [
      param('id', 'string', true, 'Todo ID'),
      param('title', 'string', false, 'New title'),
      param('status', 'string', false, 'New status'),
      param('priority', 'string', false, 'New priority'),
      param('tags', 'array', false, 'New tags'),
    ], 'TodoResponse'),
    fn('getTodoList', 'Gets todo list', [
      param('filters', 'object', false, 'Filter options'),
    ], 'TodoListResponse'),
    fn('getAllIncompleteTodos', 'Gets incomplete todos', [], 'TodoListResponse'),
    fn('exportTodos', 'Exports todos', [
      param('format', 'string', false, 'Export format'),
    ], 'ExportResponse'),
    fn('importTodos', 'Imports todos', [
      param('data', 'string', true, 'Import data'),
      param('format', 'string', false, 'Data format'),
      param('mergeStrategy', 'string', false, 'Merge strategy'),
      param('listId', 'string', false, 'Target list ID'),
    ], 'ImportResponse'),
  ],
};

export const actionPlanModule: CodeboltModule = {
  name: 'actionPlan',
  displayName: 'Action Plan',
  description: 'Action plan management',
  category: 'jobs-tasks',
  functions: [
    fn('getAllPlans', 'Gets all action plans', [], 'ActionPlanListResponse'),
    fn('getPlanDetail', 'Gets plan details', [
      param('planId', 'string', true, 'Plan ID'),
    ], 'ActionPlanResponse'),
    fn('getActionPlanDetail', 'Gets action plan details', [
      param('planId', 'string', true, 'Plan ID'),
    ], 'ActionPlanResponse'),
    fn('createActionPlan', 'Creates an action plan', [
      param('name', 'string', true, 'Plan name'),
      param('description', 'string', false, 'Plan description'),
      param('agentId', 'string', false, 'Agent ID'),
    ], 'ActionPlanResponse'),
    fn('updateActionPlan', 'Updates an action plan', [
      param('planId', 'string', true, 'Plan ID'),
      param('updateData', 'object', true, 'Update data'),
    ], 'ActionPlanResponse'),
    fn('addTaskToActionPlan', 'Adds task to plan', [
      param('planId', 'string', true, 'Plan ID'),
      param('task', 'object', true, 'Task object'),
    ], 'ActionPlanResponse'),
    fn('addGroupToActionPlan', 'Adds group to plan', [
      param('planId', 'string', true, 'Plan ID'),
      param('group', 'object', true, 'Group object'),
    ], 'ActionPlanResponse'),
    fn('startTaskStep', 'Starts a task step', [
      param('planId', 'string', true, 'Plan ID'),
      param('taskId', 'string', true, 'Task ID'),
    ], 'TaskStepResponse'),
    fn('startTaskStepWithListener', 'Starts task with listener', [
      param('planId', 'string', true, 'Plan ID'),
      param('taskId', 'string', true, 'Task ID'),
      param('onResponse', 'object', true, 'Response handler'),
    ], 'TaskStepResponse'),
  ],
};

export const actionBlockModule: CodeboltModule = {
  name: 'actionBlock',
  displayName: 'Action Block',
  description: 'Action block management',
  category: 'jobs-tasks',
  functions: [
    fn('list', 'Lists action blocks', [
      param('filter', 'object', false, 'Filter options'),
    ], 'ActionBlockListResponse'),
    fn('getDetail', 'Gets action block details', [
      param('actionBlockName', 'string', true, 'Action block name'),
    ], 'ActionBlockResponse'),
    fn('start', 'Starts an action block', [
      param('actionBlockName', 'string', true, 'Action block name'),
      param('params', 'object', false, 'Execution parameters'),
    ], 'StartResponse'),
  ],
};

export const sideExecutionModule: CodeboltModule = {
  name: 'sideExecution',
  displayName: 'Side Execution',
  description: 'Side execution in child processes',
  category: 'jobs-tasks',
  functions: [
    fn('startWithActionBlock', 'Starts with action block', [
      param('actionBlockPath', 'string', true, 'Action block path'),
      param('params', 'object', false, 'Parameters'),
      param('timeout', 'number', false, 'Timeout in ms'),
    ], 'ExecutionResponse'),
    fn('startWithCode', 'Starts with inline code', [
      param('inlineCode', 'string', true, 'Code to execute'),
      param('params', 'object', false, 'Parameters'),
      param('timeout', 'number', false, 'Timeout in ms'),
    ], 'ExecutionResponse'),
    fn('stop', 'Stops execution', [
      param('sideExecutionId', 'string', true, 'Execution ID'),
    ], 'StopResponse'),
    fn('listActionBlocks', 'Lists action blocks', [
      param('projectPath', 'string', false, 'Project path'),
    ], 'ActionBlockListResponse'),
    fn('getStatus', 'Gets execution status', [
      param('sideExecutionId', 'string', true, 'Execution ID'),
    ], 'StatusResponse'),
  ],
};
