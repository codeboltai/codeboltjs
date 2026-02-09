// Roadmap API types

export type FeatureImpact = 'low' | 'medium' | 'high' | 'critical';
export type FeatureDifficulty = 'easy' | 'medium' | 'hard' | 'complex';
export type FeatureStatus = 'idea' | 'planned' | 'in-progress' | 'completed' | 'archived';
export type IdeaStatus = 'pending' | 'reviewed' | 'accepted' | 'rejected';

export interface Creator {
  id: string;
  name: string;
  type: 'user' | 'agent';
}

export interface RoadmapFeature {
  id: string;
  phaseId: string;
  title: string;
  description: string;
  impact: FeatureImpact;
  difficulty: FeatureDifficulty;
  priority: number;
  tags: string[];
  category: string;
  status: FeatureStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: Creator;
  linkedTaskId?: string;
  linkedThreadId?: string;
}

export interface RoadmapPhase {
  id: string;
  name: string;
  description: string;
  order: number;
  features: RoadmapFeature[];
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapIdea {
  id: string;
  title: string;
  description: string;
  category: string;
  suggestedImpact?: FeatureImpact;
  suggestedDifficulty?: FeatureDifficulty;
  tags: string[];
  status: IdeaStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: Creator;
  reviewedBy?: { id: string; name: string };
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface CreatePhaseRequest {
  name: string;
  description?: string;
  order?: number;
}

export interface UpdatePhaseRequest {
  name?: string;
  description?: string;
  order?: number;
}

export interface CreateFeatureRequest {
  title: string;
  description?: string;
  impact?: FeatureImpact;
  difficulty?: FeatureDifficulty;
  priority?: number;
  tags?: string[];
  category?: string;
  status?: FeatureStatus;
  createdBy?: Creator;
}

export interface UpdateFeatureRequest {
  title?: string;
  description?: string;
  impact?: FeatureImpact;
  difficulty?: FeatureDifficulty;
  priority?: number;
  tags?: string[];
  category?: string;
  status?: FeatureStatus;
}

export interface MoveFeatureRequest {
  targetPhaseId: string;
}

export interface CreateTaskFromFeatureRequest {
  assignee?: string;
}

export interface SendFeatureToChatRequest {
  threadId?: string;
}

export interface CreateIdeaRequest {
  title: string;
  description?: string;
  category?: string;
  suggestedImpact?: FeatureImpact;
  suggestedDifficulty?: FeatureDifficulty;
  tags?: string[];
  createdBy?: Creator;
}

export interface UpdateIdeaRequest {
  title?: string;
  description?: string;
  category?: string;
  suggestedImpact?: FeatureImpact;
  suggestedDifficulty?: FeatureDifficulty;
  tags?: string[];
}

export interface ReviewIdeaRequest {
  status: 'accepted' | 'rejected';
  reviewNotes?: string;
  reviewedBy: { id: string; name: string };
}

export interface MoveIdeaToRoadmapRequest {
  phaseId: string;
  featureOverrides?: Partial<CreateFeatureRequest>;
}
