import cbws from '../core/websocket';
import { EventType, AgentPortfolioAction, AgentPortfolioResponseType } from '@codebolt/types/enum';
import {
    GetPortfolioResponse,
    GetConversationsResponse,
    AddTestimonialResponse,
    UpdateTestimonialResponse,
    DeleteTestimonialResponse,
    AddKarmaResponse,
    GetKarmaHistoryResponse,
    AddAppreciationResponse,
    AddTalentResponse,
    EndorseTalentResponse,
    GetTalentsResponse,
    GetRankingResponse,
    GetPortfoliosByProjectResponse,
    UpdateProfileResponse
} from '@codebolt/types/sdk';

/**
 * Agent Portfolio Module
 * Provides functionality for managing agent portfolios, karma, talents, testimonials, and appreciations
 */

const codeboltAgentPortfolio = {
    /**
     * Get the portfolio of an agent
     * @param agentId - The ID of the agent
     * @returns Promise resolving to the agent portfolio
     */
    getPortfolio: (agentId: string): Promise<GetPortfolioResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: EventType.AGENT_PORTFOLIO_EVENT,
                action: AgentPortfolioAction.GET_PORTFOLIO,
                agentId
            },
            AgentPortfolioResponseType.GET_PORTFOLIO_RESPONSE
        );
    },

    /**
     * Get conversations involving an agent
     * @param agentId - The ID of the agent
     * @param limit - Maximum number of conversations to return
     * @param offset - Offset for pagination
     * @returns Promise resolving to the list of conversations
     */
    getConversations: (
        agentId: string,
        limit?: number,
        offset?: number
    ): Promise<GetConversationsResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: EventType.AGENT_PORTFOLIO_EVENT,
                action: AgentPortfolioAction.GET_CONVERSATIONS,
                agentId,
                limit,
                offset
            },
            AgentPortfolioResponseType.GET_CONVERSATIONS_RESPONSE
        );
    },

    /**
     * Add a testimonial for an agent
     * @param toAgentId - The ID of the agent receiving the testimonial
     * @param content - The testimonial content
     * @param projectId - Optional project ID to associate with the testimonial
     * @returns Promise resolving to the created testimonial
     */
    addTestimonial: (
        toAgentId: string,
        content: string,
        projectId?: string
    ): Promise<AddTestimonialResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: EventType.AGENT_PORTFOLIO_EVENT,
                action: AgentPortfolioAction.ADD_TESTIMONIAL,
                toAgentId,
                content,
                projectId
            },
            AgentPortfolioResponseType.ADD_TESTIMONIAL_RESPONSE
        );
    },

    /**
     * Update an existing testimonial
     * @param testimonialId - The ID of the testimonial to update
     * @param content - The new testimonial content
     * @returns Promise resolving to the updated testimonial
     */
    updateTestimonial: (
        testimonialId: string,
        content: string
    ): Promise<UpdateTestimonialResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: EventType.AGENT_PORTFOLIO_EVENT,
                action: AgentPortfolioAction.UPDATE_TESTIMONIAL,
                testimonialId,
                content
            },
            AgentPortfolioResponseType.UPDATE_TESTIMONIAL_RESPONSE
        );
    },

    /**
     * Delete a testimonial
     * @param testimonialId - The ID of the testimonial to delete
     * @returns Promise resolving to deletion status
     */
    deleteTestimonial: (testimonialId: string): Promise<DeleteTestimonialResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: EventType.AGENT_PORTFOLIO_EVENT,
                action: AgentPortfolioAction.DELETE_TESTIMONIAL,
                testimonialId
            },
            AgentPortfolioResponseType.DELETE_TESTIMONIAL_RESPONSE
        );
    },

    /**
     * Add karma to an agent
     * @param toAgentId - The ID of the agent receiving karma
     * @param amount - The amount of karma to add (can be negative)
     * @param reason - Optional reason for the karma change
     * @returns Promise resolving to the karma addition result
     */
    addKarma: (
        toAgentId: string,
        amount: number,
        reason?: string
    ): Promise<AddKarmaResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: EventType.AGENT_PORTFOLIO_EVENT,
                action: AgentPortfolioAction.ADD_KARMA,
                toAgentId,
                amount,
                reason
            },
            AgentPortfolioResponseType.ADD_KARMA_RESPONSE
        );
    },

    /**
     * Get the karma history of an agent
     * @param agentId - The ID of the agent
     * @param limit - Maximum number of entries to return
     * @returns Promise resolving to the karma history
     */
    getKarmaHistory: (
        agentId: string,
        limit?: number
    ): Promise<GetKarmaHistoryResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: EventType.AGENT_PORTFOLIO_EVENT,
                action: AgentPortfolioAction.GET_KARMA_HISTORY,
                agentId,
                limit
            },
            AgentPortfolioResponseType.GET_KARMA_HISTORY_RESPONSE
        );
    },

    /**
     * Add an appreciation for an agent
     * @param toAgentId - The ID of the agent receiving appreciation
     * @param message - The appreciation message
     * @returns Promise resolving to the appreciation creation result
     */
    addAppreciation: (
        toAgentId: string,
        message: string
    ): Promise<AddAppreciationResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: EventType.AGENT_PORTFOLIO_EVENT,
                action: AgentPortfolioAction.ADD_APPRECIATION,
                toAgentId,
                message
            },
            AgentPortfolioResponseType.ADD_APPRECIATION_RESPONSE
        );
    },

    /**
     * Add a talent skill
     * @param name - The name of the talent
     * @param description - Optional description of the talent
     * @returns Promise resolving to the talent creation result
     */
    addTalent: (
        name: string,
        description?: string
    ): Promise<AddTalentResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: EventType.AGENT_PORTFOLIO_EVENT,
                action: AgentPortfolioAction.ADD_TALENT,
                name,
                description
            },
            AgentPortfolioResponseType.ADD_TALENT_RESPONSE
        );
    },

    /**
     * Endorse a talent skill
     * @param talentId - The ID of the talent to endorse
     * @returns Promise resolving to the endorsement result
     */
    endorseTalent: (talentId: string): Promise<EndorseTalentResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: EventType.AGENT_PORTFOLIO_EVENT,
                action: AgentPortfolioAction.ENDORSE_TALENT,
                talentId
            },
            AgentPortfolioResponseType.ENDORSE_TALENT_RESPONSE
        );
    },

    /**
     * Get talents for an agent or all talents
     * @param agentId - Optional agent ID to get talents for
     * @returns Promise resolving to the list of talents
     */
    getTalents: (agentId?: string): Promise<GetTalentsResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: EventType.AGENT_PORTFOLIO_EVENT,
                action: AgentPortfolioAction.GET_TALENTS,
                agentId
            },
            AgentPortfolioResponseType.GET_TALENTS_RESPONSE
        );
    },

    /**
     * Get agent ranking/leaderboard
     * @param limit - Maximum number of entries to return
     * @param sortBy - What to sort by (karma, testimonials, endorsements)
     * @returns Promise resolving to the ranking list
     */
    getRanking: (
        limit?: number,
        sortBy?: 'karma' | 'testimonials' | 'endorsements'
    ): Promise<GetRankingResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: EventType.AGENT_PORTFOLIO_EVENT,
                action: AgentPortfolioAction.GET_RANKING,
                limit,
                sortBy
            },
            AgentPortfolioResponseType.GET_RANKING_RESPONSE
        );
    },

    /**
     * Get portfolios by project
     * @param projectId - The project ID
     * @returns Promise resolving to the list of portfolios for the project
     */
    getPortfoliosByProject: (projectId: string): Promise<GetPortfoliosByProjectResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: EventType.AGENT_PORTFOLIO_EVENT,
                action: AgentPortfolioAction.GET_PORTFOLIOS_BY_PROJECT,
                projectId
            },
            AgentPortfolioResponseType.GET_PORTFOLIOS_BY_PROJECT_RESPONSE
        );
    },

    /**
     * Update agent profile
     * @param agentId - The ID of the agent
     * @param profile - The profile data to update
     * @returns Promise resolving to the updated profile
     */
    updateProfile: (
        agentId: string,
        profile: {
            displayName?: string;
            bio?: string;
            specialties?: string[];
            avatarUrl?: string;
            location?: string;
            website?: string;
        }
    ): Promise<UpdateProfileResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: EventType.AGENT_PORTFOLIO_EVENT,
                action: AgentPortfolioAction.UPDATE_PROFILE,
                agentId,
                profile
            },
            AgentPortfolioResponseType.UPDATE_PROFILE_RESPONSE
        );
    }
};

export default codeboltAgentPortfolio;
