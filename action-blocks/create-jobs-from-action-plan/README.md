# Create Jobs from Action Plan - ActionBlock

This ActionBlock reads an action plan and automatically creates jobs for all tasks in a specified job group.

## Usage

```javascript
const result = await codebolt.actionBlock.start('create-jobs-from-action-plan', {
  planId: 'your-plan-id',
  groupId: 'your-group-id',
  workerAgentId: 'optional-agent-id'  // Optional
});
```

## Inputs

- **planId** (required): The action plan ID to process
- **groupId** (required): The job group ID where jobs will be created
- **requirementPlanPath** (optional): Path to requirement plan for context
- **specsPath** (optional): Path to specs file for context
- **workerAgentId** (optional): Agent ID to assign jobs to

## Outputs

- **success** (boolean): Whether all jobs were created successfully
- **jobsCreated** (array): List of created job IDs
- **failedTasks** (array): List of tasks that failed to create jobs
- **totalTasks** (number): Total number of tasks processed
- **error** (string): Error message if operation failed

## Features

- Automatically retrieves action plan details
- Iterates through all tasks in the plan
- Uses existing `create-jobs-for-task` action block for job creation
- Provides detailed progress notifications
- Returns comprehensive summary of created jobs and failures
