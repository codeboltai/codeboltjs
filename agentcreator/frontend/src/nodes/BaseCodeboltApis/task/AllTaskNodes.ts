// Step Management Nodes
import { BaseAddStepToTaskNode } from '@agent-creator/shared-nodes';
import { BaseGetTaskMessagesNode } from '@agent-creator/shared-nodes';
import { BaseGetAllStepsNode } from '@agent-creator/shared-nodes';
import { BaseGetCurrentRunningStepNode } from '@agent-creator/shared-nodes';
import { BaseUpdateStepStatusNode } from '@agent-creator/shared-nodes';
import { BaseCompleteStepNode } from '@agent-creator/shared-nodes';
import { BaseSendSteeringMessageNode } from '@agent-creator/shared-nodes';

// Task Dependency Nodes
import { BaseCanTaskStartNode } from '@agent-creator/shared-nodes';
import { BaseGetTasksDependentOnNode } from '@agent-creator/shared-nodes';
import { BaseGetTasksReadyToStartNode } from '@agent-creator/shared-nodes';
import { BaseGetTaskDependencyChainNode } from '@agent-creator/shared-nodes';

// Utility and Statistics Nodes
import { BaseGetTaskStatsNode } from '@agent-creator/shared-nodes';
import { BaseGetTasksStartedByMeNode } from '@agent-creator/shared-nodes';
import { BaseAttachMemoryToTaskNode } from '@agent-creator/shared-nodes';
import { BaseGetAttachedMemoryForTaskNode } from '@agent-creator/shared-nodes';
import { BaseCreateTaskGroupNode } from '@agent-creator/shared-nodes';

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