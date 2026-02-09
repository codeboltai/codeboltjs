// Planner API types

export interface PlannerOverview {
  agents: PlannerAgent[];
  tasks: PlannerTask[];
}

export interface PlannerAgent {
  id: string;
  name: string;
  taskCount?: number;
}

export interface PlannerTask {
  id: string;
  title: string;
  description?: string;
  agentId?: string;
  status?: string;
  priority?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePlannerTaskRequest {
  title: string;
  description?: string;
  agentId?: string;
  status?: string;
  priority?: number;
}

export interface UpdatePlannerTaskRequest {
  title?: string;
  description?: string;
  agentId?: string;
  status?: string;
  priority?: number;
}

export interface CreateTasksFromMarkdownRequest {
  markdown: string;
  agentId?: string;
}

export interface ExportMarkdownParams {
  agentId?: string;
}
