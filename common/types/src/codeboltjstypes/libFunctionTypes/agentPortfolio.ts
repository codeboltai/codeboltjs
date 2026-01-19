/**
 * Agent Portfolio SDK Function Types
 * Types for the agent portfolio module functions
 */

// Base response interface for agent portfolio operations
export interface BaseAgentPortfolioSDKResponse {
  success?: boolean;
  message?: string;
  error?: string;
  /** Request identifier */
  requestId?: string;
  /** Response timestamp */
  timestamp?: string;
}

// Agent portfolio interfaces
export interface AgentProfile {
  /** Display name */
  displayName?: string;
  /** Bio/description */
  bio?: string;
  /** Specialties */
  specialties?: string[];
  /** Avatar URL */
  avatarUrl?: string;
  /** Location */
  location?: string;
  /** Website */
  website?: string;
}

export interface Talent {
  /** Talent ID */
  id: string;
  /** Talent name */
  name: string;
  /** Talent description */
  description?: string;
  /** Array of agent IDs who endorsed this talent */
  endorsements?: string[];
  /** Creation timestamp */
  createdAt?: string;
}

export interface KarmaEntry {
  /** Karma entry ID */
  id: string;
  /** Karma amount (positive or negative) */
  amount: number;
  /** Reason for karma change */
  reason?: string;
  /** Agent who gave karma */
  fromAgentId?: string;
  /** Timestamp */
  timestamp: string;
}

export interface Testimonial {
  /** Testimonial ID */
  id: string;
  /** Agent who gave testimonial */
  fromAgentId: string;
  /** Testimonial content */
  content: string;
  /** Project ID (optional) */
  projectId?: string;
  /** Timestamp */
  timestamp: string;
  /** From agent name (for display) */
  fromAgentName?: string;
}

export interface Appreciation {
  /** Appreciation ID */
  id: string;
  /** Agent who gave appreciation */
  fromAgentId: string;
  /** Appreciation message */
  message: string;
  /** Timestamp */
  timestamp: string;
  /** From agent name (for display) */
  fromAgentName?: string;
}

export interface AgentPortfolio {
  /** Agent ID */
  agentId: string;
  /** Agent profile */
  profile?: AgentProfile;
  /** Agent talents */
  talents?: Talent[];
  /** Karma history */
  karma?: KarmaEntry[];
  /** Testimonials */
  testimonials?: Testimonial[];
  /** Appreciations */
  appreciations?: Appreciation[];
  /** Total karma score */
  totalKarma?: number;
  /** Ranking/leaderboard position */
  ranking?: number;
}

export interface AgentConversation {
  /** Conversation ID */
  id: string;
  /** Other agent ID */
  agentId?: string;
  /** Thread ID */
  threadId?: string;
  /** Project ID */
  projectId?: string;
  /** Timestamp */
  timestamp: string;
  /** Message count */
  messageCount?: number;
  /** Last message preview */
  lastMessage?: string;
}

export interface RankingEntry {
  /** Agent ID */
  agentId: string;
  /** Agent name */
  agentName?: string;
  /** Score (karma/testimonials/endorsements) */
  score: number;
  /** Rank position */
  rank: number;
  /** Change in rank from previous period */
  rankChange?: number;
}

// Agent portfolio operation responses
export interface GetPortfolioResponse extends BaseAgentPortfolioSDKResponse {
  /** Agent portfolio data */
  portfolio?: AgentPortfolio;
}

export interface GetConversationsResponse extends BaseAgentPortfolioSDKResponse {
  /** Conversations list */
  conversations?: AgentConversation[];
  /** Total count */
  total?: number;
}

export interface AddTestimonialResponse extends BaseAgentPortfolioSDKResponse {
  /** Created testimonial ID */
  testimonialId?: string;
}

export interface UpdateTestimonialResponse extends BaseAgentPortfolioSDKResponse {
  /** Updated testimonial data */
  testimonial?: Testimonial;
}

export interface DeleteTestimonialResponse extends BaseAgentPortfolioSDKResponse {
  /** Whether deletion was successful */
  deleted?: boolean;
}

export interface AddKarmaResponse extends BaseAgentPortfolioSDKResponse {
  /** Karma entry ID */
  karmaId?: string;
  /** New total karma */
  newTotal?: number;
}

export interface GetKarmaHistoryResponse extends BaseAgentPortfolioSDKResponse {
  /** Karma history entries */
  history?: KarmaEntry[];
  /** Total count */
  total?: number;
}

export interface AddAppreciationResponse extends BaseAgentPortfolioSDKResponse {
  /** Appreciation ID */
  appreciationId?: string;
}

export interface AddTalentResponse extends BaseAgentPortfolioSDKResponse {
  /** Talent ID */
  talentId?: string;
}

export interface EndorseTalentResponse extends BaseAgentPortfolioSDKResponse {
  /** Updated talent data */
  talent?: Talent;
}

export interface GetTalentsResponse extends BaseAgentPortfolioSDKResponse {
  /** Talents list */
  talents?: Talent[];
}

export interface GetRankingResponse extends BaseAgentPortfolioSDKResponse {
  /** Ranking entries */
  ranking?: RankingEntry[];
}

export interface GetPortfoliosByProjectResponse extends BaseAgentPortfolioSDKResponse {
  /** Project portfolios */
  portfolios?: AgentPortfolio[];
}

export interface UpdateProfileResponse extends BaseAgentPortfolioSDKResponse {
  /** Updated profile data */
  profile?: AgentProfile;
}
