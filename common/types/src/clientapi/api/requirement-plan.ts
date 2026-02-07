// Requirement Plan API types

export interface RequirementPlan {
  id: string;
  name: string;
  content: string;
  type?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRequirementPlanRequest {
  name: string;
  content: string;
  type?: string;
}

export interface UpdateRequirementPlanRequest {
  id: string;
  name?: string;
  content?: string;
  type?: string;
}

export interface GetRequirementPlanParams {
  id?: string;
  name?: string;
}

export interface EnsureRequirementPlanFolderRequest {
  path?: string;
}
