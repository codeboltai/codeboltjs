// Step Management Nodes
import { BaseAddStepToTaskNode } from '@codebolt/agent-shared-nodes';
import { BaseGetTaskMessagesNode } from '@codebolt/agent-shared-nodes';
import { BaseGetAllStepsNode } from '@codebolt/agent-shared-nodes';
import { BaseGetCurrentRunningStepNode } from '@codebolt/agent-shared-nodes';
import { BaseUpdateStepStatusNode } from '@codebolt/agent-shared-nodes';
import { BaseCompleteStepNode } from '@codebolt/agent-shared-nodes';
import { BaseSendSteeringMessageNode } from '@codebolt/agent-shared-nodes';

// Task Dependency Nodes
import { BaseCanTaskStartNode } from '@codebolt/agent-shared-nodes';
import { BaseGetTasksDependentOnNode } from '@codebolt/agent-shared-nodes';
import { BaseGetTasksReadyToStartNode } from '@codebolt/agent-shared-nodes';
import { BaseGetTaskDependencyChainNode } from '@codebolt/agent-shared-nodes';

// Utility and Statistics Nodes
import { BaseGetTaskStatsNode } from '@codebolt/agent-shared-nodes';
import { BaseGetTasksStartedByMeNode } from '@codebolt/agent-shared-nodes';
import { BaseAttachMemoryToTaskNode } from '@codebolt/agent-shared-nodes';
import { BaseGetAttachedMemoryForTaskNode } from '@codebolt/agent-shared-nodes';
import { BaseCreateTaskGroupNode } from '@codebolt/agent-shared-nodes';

// Frontend AddStepToTask Node - UI only
export class AddStepToTaskNode extends BaseAddStepToTaskNode {
  constructor() {
    super();
  }
}

// Frontend GetTaskMessages Node - UI only
export class GetTaskMessagesNode extends BaseGetTaskMessagesNode {
  constructor() {
    super();
  }
}

// Frontend GetAllSteps Node - UI only
export class GetAllStepsNode extends BaseGetAllStepsNode {
  constructor() {
    super();
  }
}

// Frontend GetCurrentRunningStep Node - UI only
export class GetCurrentRunningStepNode extends BaseGetCurrentRunningStepNode {
  constructor() {
    super();
  }
}

// Frontend UpdateStepStatus Node - UI only
export class UpdateStepStatusNode extends BaseUpdateStepStatusNode {
  constructor() {
    super();
  }
}

// Frontend CompleteStep Node - UI only
export class CompleteStepNode extends BaseCompleteStepNode {
  constructor() {
    super();
  }
}

// Frontend SendSteeringMessage Node - UI only
export class SendSteeringMessageNode extends BaseSendSteeringMessageNode {
  constructor() {
    super();
  }
}

// Frontend CanTaskStart Node - UI only
export class CanTaskStartNode extends BaseCanTaskStartNode {
  constructor() {
    super();
  }
}

// Frontend GetTasksDependentOn Node - UI only
export class GetTasksDependentOnNode extends BaseGetTasksDependentOnNode {
  constructor() {
    super();
  }
}

// Frontend GetTasksReadyToStart Node - UI only
export class GetTasksReadyToStartNode extends BaseGetTasksReadyToStartNode {
  constructor() {
    super();
  }
}

// Frontend GetTaskDependencyChain Node - UI only
export class GetTaskDependencyChainNode extends BaseGetTaskDependencyChainNode {
  constructor() {
    super();
  }
}

// Frontend GetTaskStats Node - UI only
export class GetTaskStatsNode extends BaseGetTaskStatsNode {
  constructor() {
    super();
  }
}

// Frontend GetTasksStartedByMe Node - UI only
export class GetTasksStartedByMeNode extends BaseGetTasksStartedByMeNode {
  constructor() {
    super();
  }
}

// Frontend AttachMemoryToTask Node - UI only
export class AttachMemoryToTaskNode extends BaseAttachMemoryToTaskNode {
  constructor() {
    super();
  }
}

// Frontend GetAttachedMemoryForTask Node - UI only
export class GetAttachedMemoryForTaskNode extends BaseGetAttachedMemoryForTaskNode {
  constructor() {
    super();
  }
}

// Frontend CreateTaskGroup Node - UI only
export class CreateTaskGroupNode extends BaseCreateTaskGroupNode {
  constructor() {
    super();
  }
}