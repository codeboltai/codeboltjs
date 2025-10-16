/**
 * Types for marketplace agents from the Codebolt API
 */

/**
 * Metadata for default agent LLM configuration
 */
export interface DefaultAgentLLM {
  strict: boolean;
  modelorder: string[];
}

/**
 * LLM role configuration
 */
export interface LLMRole {
  name: string;
  description: string;
  strict: boolean;
  modelorder: string[];
}

/**
 * Agent routing configuration
 */
export interface AgentRouting {
  worksonblankcode: boolean;
  supportedframeworks: string[];
  supportedlanguages: string[];
  worksonexistingcode: boolean;
}

/**
 * SDLC (Software Development Life Cycle) steps managed by the agent
 */
export interface SdlcStepManaged {
  example_instructions: string[];
  name: string;
}

/**
 * Metadata structure for marketplace agents
 */
export interface MarketplaceAgentMetadata {
  defaultagentllm?: DefaultAgentLLM;
  llm_role?: LLMRole[];
  agent_routing?: AgentRouting;
  sdlc_steps_managed?: SdlcStepManaged[];
}

/**
 * Action definition for marketplace agents
 */
export interface MarketplaceAgentAction {
  detailDescription: string;
  name: string;
  description: string;
  actionPrompt: string;
}

/**
 * Marketplace agent structure from the Codebolt API
 */
export interface MarketplaceAgent {
  id: number;
  unique_id: string;
  title: string;
  description: string;
  longDescription?: string;
  zipFilePath?: string;
  avatarSrc?: string;
  avatarFallback?: string;
  metadata?: MarketplaceAgentMetadata;
  initial_message?: string;
  actions?: MarketplaceAgentAction[];
  tags?: string[];
  version?: string;
  author?: string;
  updatedAt?: string;
  createdByUser?: string;
  agent_id?: string;
  slug?: string;
  status?: number;
  sourceCodeUrl?: string | null;
  lastUpdatedUI?: number;
  githubUrl?: string | null;
  isInvalid?: number;
  isVerified?: number;
  isDisabled?: number;
  isPrivate?: number;
}