// Action Plans API types

export interface ActionPlan {
  id: string;
  name: string;
  description?: string;
  tasks: ActionPlanTask[];
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ActionPlanTask {
  id: string;
  title: string;
  description?: string;
  status?: string;
  order?: number;
}

export interface CreateActionPlanRequest {
  name: string;
  description?: string;
  tasks?: ActionPlanTask[];
}

export interface UpdateActionPlanRequest {
  name?: string;
  description?: string;
  tasks?: ActionPlanTask[];
  status?: string;
}

export interface AddActionPlanTaskRequest {
  title: string;
  description?: string;
  status?: string;
  order?: number;
}
