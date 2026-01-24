/**
 * Portfolio Update Profile Tool
 * 
 * Updates an agent profile.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbagentPortfolio from '../../modules/agentPortfolio';

/**
 * Parameters for updating an agent profile
 */
export interface PortfolioUpdateProfileParams {
    /** The ID of the agent */
    agentId: string;
    /** The profile data to update */
    profile: {
        /** Optional display name */
        displayName?: string;
        /** Optional bio */
        bio?: string;
        /** Optional specialties */
        specialties?: string[];
        /** Optional avatar URL */
        avatarUrl?: string;
        /** Optional location */
        location?: string;
        /** Optional website */
        website?: string;
    };
}

class PortfolioUpdateProfileInvocation extends BaseToolInvocation<PortfolioUpdateProfileParams, ToolResult> {
    constructor(params: PortfolioUpdateProfileParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbagentPortfolio.updateProfile(
                this.params.agentId,
                this.params.profile
            );

            const profile = response.payload?.profile;

            if (!profile) {
                return {
                    llmContent: 'Error: Failed to update profile - no profile returned',
                    returnDisplay: 'Error: Failed to update profile',
                    error: {
                        message: 'No profile returned from update operation',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully updated profile for agent ${this.params.agentId}`,
                returnDisplay: `Updated profile for agent ${this.params.agentId}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                llmContent: `Error: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Tool for updating an agent profile
 */
export class PortfolioUpdateProfileTool extends BaseDeclarativeTool<PortfolioUpdateProfileParams, ToolResult> {
    constructor() {
        super(
            'portfolio_update_profile',
            'Update Portfolio Profile',
            'Updates an agent profile with display name, bio, specialties, avatar, location, and website.',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    agentId: {
                        type: 'string',
                        description: 'The ID of the agent',
                    },
                    profile: {
                        type: 'object',
                        properties: {
                            displayName: {
                                type: 'string',
                                description: 'Optional display name',
                            },
                            bio: {
                                type: 'string',
                                description: 'Optional bio',
                            },
                            specialties: {
                                type: 'array',
                                items: { type: 'string' },
                                description: 'Optional specialties',
                            },
                            avatarUrl: {
                                type: 'string',
                                description: 'Optional avatar URL',
                            },
                            location: {
                                type: 'string',
                                description: 'Optional location',
                            },
                            website: {
                                type: 'string',
                                description: 'Optional website',
                            },
                        },
                        description: 'The profile data to update',
                    },
                },
                required: ['agentId', 'profile'],
            }
        );
    }

    protected override createInvocation(params: PortfolioUpdateProfileParams): ToolInvocation<PortfolioUpdateProfileParams, ToolResult> {
        return new PortfolioUpdateProfileInvocation(params);
    }
}
