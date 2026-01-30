import cbws from '../core/websocket';
import { randomUUID } from 'crypto';
import type {
    CreatePhaseData,
    UpdatePhaseData,
    CreateFeatureData,
    UpdateFeatureData,
    MoveFeatureData,
    CreateIdeaData,
    UpdateIdeaData,
    ReviewIdeaData,
    MoveIdeaToRoadmapData,
    RoadmapGetResponse,
    RoadmapPhasesResponse,
    RoadmapPhaseResponse,
    RoadmapDeleteResponse,
    RoadmapFeaturesResponse,
    RoadmapFeatureResponse,
    RoadmapIdeasResponse,
    RoadmapIdeaResponse,
    RoadmapMoveToRoadmapResponse
} from '@codebolt/types/lib';

/**
 * Roadmap Module for codeboltjs
 * Provides functionality for managing project roadmaps, phases, features, and ideas.
 * Mirrors the roadmapService.cli.ts operations via WebSocket.
 */
const codeboltRoadmap = {
    // ================================
    // Roadmap Operations
    // ================================

    /**
     * Get the complete roadmap for a project
     * @param projectPath - Optional project path (uses active project if not provided)
     */
    getRoadmap: async (projectPath?: string): Promise<RoadmapGetResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'roadmapEvent',
                action: 'roadmap.getRoadmap',
                requestId,
                message: { projectPath }
            },
            'roadmapGetResponse'
        );
    },

    // ================================
    // Phase Operations
    // ================================

    /**
     * Get all phases in the roadmap
     */
    getPhases: async (projectPath?: string): Promise<RoadmapPhasesResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'roadmapEvent',
                action: 'roadmap.getPhases',
                requestId,
                message: { projectPath }
            },
            'roadmapGetPhasesResponse'
        );
    },

    /**
     * Create a new phase in the roadmap
     */
    createPhase: async (data: CreatePhaseData, projectPath?: string): Promise<RoadmapPhaseResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'roadmapEvent',
                action: 'roadmap.createPhase',
                requestId,
                message: { ...data, projectPath }
            },
            'roadmapCreatePhaseResponse'
        );
    },

    /**
     * Update an existing phase
     */
    updatePhase: async (phaseId: string, data: UpdatePhaseData, projectPath?: string): Promise<RoadmapPhaseResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'roadmapEvent',
                action: 'roadmap.updatePhase',
                requestId,
                message: { phaseId, ...data, projectPath }
            },
            'roadmapUpdatePhaseResponse'
        );
    },

    /**
     * Delete a phase from the roadmap
     */
    deletePhase: async (phaseId: string, projectPath?: string): Promise<RoadmapDeleteResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'roadmapEvent',
                action: 'roadmap.deletePhase',
                requestId,
                message: { phaseId, projectPath }
            },
            'roadmapDeletePhaseResponse'
        );
    },

    // ================================
    // Feature Operations
    // ================================

    /**
     * Get features in a specific phase
     */
    getFeatures: async (phaseId: string, projectPath?: string): Promise<RoadmapFeaturesResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'roadmapEvent',
                action: 'roadmap.getFeatures',
                requestId,
                message: { phaseId, projectPath }
            },
            'roadmapGetFeaturesResponse'
        );
    },

    /**
     * Get all features across all phases
     */
    getAllFeatures: async (projectPath?: string): Promise<RoadmapFeaturesResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'roadmapEvent',
                action: 'roadmap.getAllFeatures',
                requestId,
                message: { projectPath }
            },
            'roadmapGetAllFeaturesResponse'
        );
    },

    /**
     * Create a new feature in a phase
     */
    createFeature: async (phaseId: string, data: CreateFeatureData, projectPath?: string): Promise<RoadmapFeatureResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'roadmapEvent',
                action: 'roadmap.createFeature',
                requestId,
                message: { phaseId, ...data, projectPath }
            },
            'roadmapCreateFeatureResponse'
        );
    },

    /**
     * Update an existing feature
     */
    updateFeature: async (featureId: string, data: UpdateFeatureData, projectPath?: string): Promise<RoadmapFeatureResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'roadmapEvent',
                action: 'roadmap.updateFeature',
                requestId,
                message: { featureId, ...data, projectPath }
            },
            'roadmapUpdateFeatureResponse'
        );
    },

    /**
     * Delete a feature
     */
    deleteFeature: async (featureId: string, projectPath?: string): Promise<RoadmapDeleteResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'roadmapEvent',
                action: 'roadmap.deleteFeature',
                requestId,
                message: { featureId, projectPath }
            },
            'roadmapDeleteFeatureResponse'
        );
    },

    /**
     * Move a feature to a different phase
     */
    moveFeature: async (featureId: string, data: MoveFeatureData, projectPath?: string): Promise<RoadmapFeatureResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'roadmapEvent',
                action: 'roadmap.moveFeature',
                requestId,
                message: { featureId, ...data, projectPath }
            },
            'roadmapMoveFeatureResponse'
        );
    },

    // ================================
    // Idea Operations
    // ================================

    /**
     * Get all ideas (pre-roadmap suggestions)
     */
    getIdeas: async (projectPath?: string): Promise<RoadmapIdeasResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'roadmapEvent',
                action: 'roadmap.getIdeas',
                requestId,
                message: { projectPath }
            },
            'roadmapGetIdeasResponse'
        );
    },

    /**
     * Create a new idea
     */
    createIdea: async (data: CreateIdeaData, projectPath?: string): Promise<RoadmapIdeaResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'roadmapEvent',
                action: 'roadmap.createIdea',
                requestId,
                message: { ...data, projectPath }
            },
            'roadmapCreateIdeaResponse'
        );
    },

    /**
     * Update an existing idea
     */
    updateIdea: async (ideaId: string, data: UpdateIdeaData, projectPath?: string): Promise<RoadmapIdeaResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'roadmapEvent',
                action: 'roadmap.updateIdea',
                requestId,
                message: { ideaId, ...data, projectPath }
            },
            'roadmapUpdateIdeaResponse'
        );
    },

    /**
     * Delete an idea
     */
    deleteIdea: async (ideaId: string, projectPath?: string): Promise<RoadmapDeleteResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'roadmapEvent',
                action: 'roadmap.deleteIdea',
                requestId,
                message: { ideaId, projectPath }
            },
            'roadmapDeleteIdeaResponse'
        );
    },

    /**
     * Review an idea (accept or reject)
     */
    reviewIdea: async (ideaId: string, data: ReviewIdeaData, projectPath?: string): Promise<RoadmapIdeaResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'roadmapEvent',
                action: 'roadmap.reviewIdea',
                requestId,
                message: { ideaId, ...data, projectPath }
            },
            'roadmapReviewIdeaResponse'
        );
    },

    /**
     * Move an accepted idea to the roadmap as a feature
     */
    moveIdeaToRoadmap: async (ideaId: string, data: MoveIdeaToRoadmapData, projectPath?: string): Promise<RoadmapMoveToRoadmapResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'roadmapEvent',
                action: 'roadmap.moveIdeaToRoadmap',
                requestId,
                message: { ideaId, ...data, projectPath }
            },
            'roadmapMoveIdeaToRoadmapResponse'
        );
    }
};

export default codeboltRoadmap;
