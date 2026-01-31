/**
 * Roadmap Types
 * Type definitions for roadmap management functionality
 */

// Creator/User who created/reviewed an idea or feature
export interface RoadmapCreator {
    id: string;
    name: string;
    type?: 'user' | 'agent';
}

// Feature status
export type FeatureStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

// Idea status
export type IdeaStatus = 'pending' | 'accepted' | 'rejected';

// Impact level
export type ImpactLevel = 'low' | 'medium' | 'high' | 'critical';

// Difficulty level
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'very-hard';

// Feature in a roadmap phase
export interface Feature {
    id: string;
    title: string;
    description?: string;
    impact?: ImpactLevel;
    difficulty?: DifficultyLevel;
    priority?: number;
    tags?: string[];
    category?: string;
    status: FeatureStatus;
    phaseId: string;
    createdBy?: RoadmapCreator;
    createdAt: string;
    updatedAt: string;
}

// Phase in a roadmap
export interface Phase {
    id: string;
    name: string;
    description?: string;
    order: number;
    features: Feature[];
    createdAt: string;
    updatedAt: string;
}

// Idea (pre-roadmap suggestion)
export interface Idea {
    id: string;
    title: string;
    description?: string;
    category?: string;
    suggestedImpact?: ImpactLevel;
    suggestedDifficulty?: DifficultyLevel;
    tags?: string[];
    status: IdeaStatus;
    createdBy?: RoadmapCreator;
    reviewedBy?: RoadmapCreator;
    reviewNotes?: string;
    createdAt: string;
    updatedAt: string;
}

// Complete roadmap data
export interface RoadmapData {
    projectPath: string;
    phases: Phase[];
    ideas: Idea[];
    createdAt: string;
    updatedAt: string;
}

// Input types for creating/updating

export interface CreatePhaseData {
    name: string;
    description?: string;
    order?: number;
}

export interface UpdatePhaseData {
    name?: string;
    description?: string;
    order?: number;
}

export interface CreateFeatureData {
    title: string;
    description?: string;
    impact?: ImpactLevel;
    difficulty?: DifficultyLevel;
    priority?: number;
    tags?: string[];
    category?: string;
    status?: FeatureStatus;
    createdBy?: RoadmapCreator;
}

export interface UpdateFeatureData {
    title?: string;
    description?: string;
    impact?: ImpactLevel;
    difficulty?: DifficultyLevel;
    priority?: number;
    tags?: string[];
    category?: string;
    status?: FeatureStatus;
}

export interface MoveFeatureData {
    targetPhaseId: string;
}

export interface CreateIdeaData {
    title: string;
    description?: string;
    category?: string;
    suggestedImpact?: ImpactLevel;
    suggestedDifficulty?: DifficultyLevel;
    tags?: string[];
    createdBy?: RoadmapCreator;
}

export interface UpdateIdeaData {
    title?: string;
    description?: string;
    category?: string;
    suggestedImpact?: ImpactLevel;
    suggestedDifficulty?: DifficultyLevel;
    tags?: string[];
}

export interface ReviewIdeaData {
    status: 'accepted' | 'rejected';
    reviewNotes?: string;
    reviewedBy?: RoadmapCreator;
}

export interface MoveIdeaToRoadmapData {
    phaseId: string;
    featureOverrides?: Partial<CreateFeatureData>;
}

// Response types

export interface RoadmapGetResponse {
    roadmap: RoadmapData;
}

export interface RoadmapPhasesResponse {
    phases: Phase[];
    count: number;
}

export interface RoadmapPhaseResponse {
    phase: Phase;
}

export interface RoadmapDeleteResponse {
    success: boolean;
}

export interface RoadmapFeaturesResponse {
    features: Feature[];
    count: number;
}

export interface RoadmapFeatureResponse {
    feature: Feature;
}

export interface RoadmapIdeasResponse {
    ideas: Idea[];
    count: number;
}

export interface RoadmapIdeaResponse {
    idea: Idea;
}

export interface RoadmapMoveToRoadmapResponse {
    feature: Feature;
}
