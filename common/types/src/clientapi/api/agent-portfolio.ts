// Agent Portfolio API types

export interface AgentPortfolio {
  agentId: string;
  agentName?: string;
  bio?: string;
  avatar?: string;
  talents: AgentTalent[];
  karma: number;
  testimonials: AgentTestimonial[];
  conversationCount?: number;
}

export interface AgentTalent {
  id: string;
  name: string;
  description?: string;
  endorsements: number;
}

export interface AgentTestimonial {
  id: string;
  agentId: string;
  authorId: string;
  authorName?: string;
  content: string;
  rating?: number;
  createdAt: string;
}

export interface AgentKarma {
  agentId: string;
  total: number;
  history: KarmaEntry[];
}

export interface KarmaEntry {
  id: string;
  amount: number;
  reason: string;
  awardedBy: string;
  awardedAt: string;
}

export interface UpdateAgentProfileRequest {
  bio?: string;
  avatar?: string;
}

export interface CreateTestimonialRequest {
  agentId: string;
  authorId: string;
  authorName?: string;
  content: string;
  rating?: number;
}

export interface UpdateTestimonialRequest {
  content?: string;
  rating?: number;
}

export interface AwardKarmaRequest {
  agentId: string;
  amount: number;
  reason: string;
  awardedBy: string;
}

export interface SendAppreciationRequest {
  agentId: string;
  message: string;
  fromId: string;
  fromName?: string;
}

export interface AddTalentRequest {
  agentId: string;
  name: string;
  description?: string;
}

export interface EndorseTalentRequest {
  agentId: string;
  talentId: string;
  endorsedBy: string;
}

export interface AgentRankingParams {
  sortBy?: string;
  limit?: number;
  offset?: number;
}

export interface AgentByProjectParams {
  projectId?: string;
  limit?: number;
  offset?: number;
}
