/**
 * Socket event map interfaces for every SDK socket channel.
 *
 * Each interface describes the events a client can listen to on that socket.
 * The common base events (message, error, connected, disconnected) are
 * factored into BaseSocketEvents and extended by every channel.
 */

import type { Task, SubTask } from '../api/tasks';
import type { ChatMessage } from '../api/chat';
import type { Job, CreateJobRequest, UpdateJobRequest, JobListFilters, JobBid, JobBlocker, JobSplitProposal, PheromoneDepositRequest, CreatePheromoneTypeRequest } from '../api/jobs';
import type { Capability, CapabilityExecutor } from '../api/capability';
import type {
  SwarmAgentInfo, SwarmTeam, SwarmRole, SwarmVacancy,
  SwarmConfig, SwarmStatusUpdate, SpawnRequest, AgentRegistration,
  AgentStatusUpdateRequest, CreateSpawnRequestBody, CreateTerminationRequestBody,
} from '../api/swarm';
import type {
  ReviewMergeRequest, CreateReviewMergeRequest, UpdateReviewMergeRequest,
  AddReviewFeedbackRequest, AddPheromoneRequest, LockReviewRequest,
  CreateUnlockRequest, AddProposedJobRequest, AddLinkedJobRequest,
} from '../api/review-merge';
import type { CalendarEvent, CreateCalendarEventRequest, UpdateCalendarEventRequest, CalendarFilterOptions, CalendarRSVPRequest, CalendarStatus } from '../api/calendar';
import type {
  CreatePhaseRequest, UpdatePhaseRequest,
  CreateFeatureRequest, UpdateFeatureRequest,
  CreateIdeaRequest, UpdateIdeaRequest, ReviewIdeaRequest,
  RoadmapPhase, RoadmapFeature, RoadmapIdea,
} from '../api/roadmap';
import type {
  AgentPortfolio, CreateTestimonialRequest, AwardKarmaRequest,
  SendAppreciationRequest, AddTalentRequest, EndorseTalentRequest, AgentRankingParams,
} from '../api/agent-portfolio';
import type { UpdateRequest, CreateUpdateRequestRequest, UpdateUpdateRequestRequest } from '../api/update-requests';
import type { WorkspaceMetadata, SaveWorkspaceMetadataRequest } from '../api/project-structure';
import type { PersistentMemoryType } from '../api/persistent-memory';
import type { FileUpdateIntent } from '../api/file-update-intents';
import type { KnowledgeCollection, KnowledgeDocument } from '../api/knowledge';
import type { KvStoreInstance, KvValue } from '../api/kv-store';
import type { EventLogInstance, EventLogEvent } from '../api/event-log';
import type { ContextAssembleResult } from '../api/context-assembly';
import type { IconViewMessage, IconViewHistoryEntry } from '../api/icon-view';
import type { LocalModel } from '../api/local-models';
import type { BackgroundAgentInstance } from '../api/background-agents';
import type { AgentDebugInstance, AgentDebugLog } from '../api/agent-debug';
import type { EnvironmentDebugInstance, EnvironmentDebugLog } from '../api/environment-debug';
import type { BrowserSendActionRequest } from '../api/browser';
import type { EditorTreeNode } from '../api/editor';

// ─── Base ────────────────────────────────────────────────────────────────────

/** Common events emitted by every socket channel */
export interface BaseSocketEvents {
  message: (data: unknown) => void;
  error: (error: unknown) => void;
  connected: () => void;
  disconnected: () => void;
  [key: string]: (...args: any[]) => void;
}

// ─── Shell ───────────────────────────────────────────────────────────────────

export interface ShellSocketEvents extends BaseSocketEvents {
  output: (data: string) => void;
}

// ─── Chat ────────────────────────────────────────────────────────────────────

export interface ChatSocketEvents extends BaseSocketEvents {}

// ─── Debug ───────────────────────────────────────────────────────────────────

export interface DebugSocketEvents extends BaseSocketEvents {}

// ─── Codebolt (Agent CLI) ────────────────────────────────────────────────────

export interface CodeboltSocketEvents extends BaseSocketEvents {}

// ─── Browser ─────────────────────────────────────────────────────────────────

export interface BrowserSocketEvents extends BaseSocketEvents {}

// ─── Tasks ───────────────────────────────────────────────────────────────────

export interface TasksSocketEvents extends BaseSocketEvents {
  taskAdded: (data: Task) => void;
  taskUpdated: (data: Task) => void;
  taskDeleted: (data: { taskId: string }) => void;
  subtaskAdded: (data: SubTask) => void;
  subtaskUpdated: (data: SubTask) => void;
  subtaskDeleted: (data: { taskId: string; subtaskId: string }) => void;
  allTasks: (data: Task[]) => void;
  tasksByAgent: (data: Task[]) => void;
  tasksByCategory: (data: Task[]) => void;
  allAgents: (data: string[]) => void;
  tasksFromMarkdownCreated: (data: Task[]) => void;
  tasksExportedToMarkdown: (data: string) => void;
  initial: (data: Task[]) => void;
}

// ─── Jobs ────────────────────────────────────────────────────────────────────

export interface JobsSocketEvents extends BaseSocketEvents {}

// ─── AI Terminal ─────────────────────────────────────────────────────────────

export interface AiTerminalSocketEvents extends BaseSocketEvents {
  output: (data: string) => void;
  logRestore: (data: unknown) => void;
}

// ─── Editor ──────────────────────────────────────────────────────────────────

export interface EditorSocketEvents extends BaseSocketEvents {
  fileChanged: (data: { path: string; type: string }) => void;
  folderContents: (data: EditorTreeNode[]) => void;
  folderAdded: (data: { path: string }) => void;
}

// ─── Main ────────────────────────────────────────────────────────────────────

export interface MainSocketEvents extends BaseSocketEvents {}

// ─── LSP ─────────────────────────────────────────────────────────────────────

export interface LspSocketEvents extends BaseSocketEvents {}

// ─── Capability ──────────────────────────────────────────────────────────────

export interface CapabilitySocketEvents extends BaseSocketEvents {
  capabilities: (data: Capability[]) => void;
  executors: (data: CapabilityExecutor[]) => void;
  capabilityTypes: (data: string[]) => void;
  activeExecutions: (data: unknown[]) => void;
  capabilityExecutionStarted: (data: unknown) => void;
  capabilityExecutionResult: (data: unknown) => void;
  capabilityChanged: (data: Capability) => void;
  executorChanged: (data: CapabilityExecutor) => void;
  registryRefreshed: (data: unknown) => void;
}

// ─── Swarm (Socket.IO) ──────────────────────────────────────────────────────

export interface SwarmSocketEvents extends BaseSocketEvents {
  'agent:registered': (data: SwarmAgentInfo) => void;
  'agent:unregistered': (data: { agentId: string }) => void;
  'agent:status-changed': (data: SwarmAgentInfo) => void;
  'team:member-joined': (data: { teamId: string; agentId: string }) => void;
  'team:member-left': (data: { teamId: string; agentId: string }) => void;
  'role:assigned': (data: { roleId: string; agentId: string }) => void;
  'role:unassigned': (data: { roleId: string; agentId: string }) => void;
  'vacancy:created': (data: SwarmVacancy) => void;
  'vacancy:closed': (data: { vacancyId: string }) => void;
  'swarm:event': (data: unknown) => void;
  'swarm:terminated': (data: { swarmId: string }) => void;
  'swarm:config-updated': (data: SwarmConfig) => void;
  'swarm:status-changed': (data: SwarmStatusUpdate) => void;
  'swarm:agent-started': (data: { agentId: string; swarmId: string }) => void;
  'swarm:agent-completed': (data: { agentId: string; swarmId: string }) => void;
  'spawn-request:created': (data: SpawnRequest) => void;
  'spawn-request:approved': (data: SpawnRequest) => void;
  'spawn-request:rejected': (data: SpawnRequest) => void;
  'termination-request:created': (data: unknown) => void;
  'termination-request:approved': (data: unknown) => void;
  'termination-request:rejected': (data: unknown) => void;
}

// ─── Review Merge ────────────────────────────────────────────────────────────

export interface ReviewMergeSocketEvents extends BaseSocketEvents {}

// ─── Agent Portfolio ─────────────────────────────────────────────────────────

export interface AgentPortfolioSocketEvents extends BaseSocketEvents {}

// ─── Calendar ────────────────────────────────────────────────────────────────

export interface CalendarSocketEvents extends BaseSocketEvents {
  'calendar:create-event:response': (data: unknown) => void;
  'calendar:update-event:response': (data: unknown) => void;
  'calendar:delete-event:response': (data: unknown) => void;
  'calendar:get-event:response': (data: unknown) => void;
  'calendar:list-events:response': (data: unknown) => void;
  'calendar:get-upcoming:response': (data: unknown) => void;
  'calendar:rsvp:response': (data: unknown) => void;
  'calendar:get-status:response': (data: unknown) => void;
}

// ─── Episodic Memory ─────────────────────────────────────────────────────────

export interface EpisodicMemorySocketEvents extends BaseSocketEvents {}

// ─── Roadmap ─────────────────────────────────────────────────────────────────

export interface RoadmapSocketEvents extends BaseSocketEvents {}

// ─── Project Structure ───────────────────────────────────────────────────────

export interface ProjectStructureSocketEvents extends BaseSocketEvents {}

// ─── Update Request ──────────────────────────────────────────────────────────

export interface UpdateRequestSocketEvents extends BaseSocketEvents {}

// ─── Background Agent ────────────────────────────────────────────────────────

export interface BackgroundAgentSocketEvents extends BaseSocketEvents {
  'background-agent:list': (data: BackgroundAgentInstance[]) => void;
  'background-agent:details': (data: BackgroundAgentInstance) => void;
  'background-agent:started': (data: BackgroundAgentInstance) => void;
  'background-agent:status-update': (data: BackgroundAgentInstance) => void;
  'background-agent:log': (data: unknown) => void;
  'background-agent:stopped': (data: BackgroundAgentInstance) => void;
}

// ─── Knowledge ───────────────────────────────────────────────────────────────

export interface KnowledgeSocketEvents extends BaseSocketEvents {
  'knowledge:collection-created': (data: KnowledgeCollection) => void;
  'knowledge:collection-updated': (data: KnowledgeCollection) => void;
  'knowledge:collection-deleted': (data: { collectionId: string }) => void;
  'knowledge:document-added': (data: KnowledgeDocument) => void;
  'knowledge:document-deleted': (data: { documentId: string }) => void;
  'knowledge:chunking-started': (data: { collectionId: string }) => void;
  'knowledge:chunking-progress': (data: { collectionId: string; progress: number }) => void;
  'knowledge:chunking-completed': (data: { collectionId: string }) => void;
  'knowledge:chunking-failed': (data: { collectionId: string; error: string }) => void;
  'knowledge:chunk-updated': (data: unknown) => void;
}

// ─── File Update Intent ──────────────────────────────────────────────────────

export interface FileUpdateIntentSocketEvents extends BaseSocketEvents {
  'fileUpdateIntent:created': (data: FileUpdateIntent) => void;
  'fileUpdateIntent:updated': (data: FileUpdateIntent) => void;
  'fileUpdateIntent:deleted': (data: { intentId: string }) => void;
  list: (data: FileUpdateIntent[]) => void;
}

// ─── Persistent Memory ──────────────────────────────────────────────────────

export interface PersistentMemorySocketEvents extends BaseSocketEvents {
  'persistentMemory:created': (data: PersistentMemoryType) => void;
  'persistentMemory:updated': (data: PersistentMemoryType) => void;
  'persistentMemory:deleted': (data: { id: string }) => void;
  'persistentMemory:pipeline-executed': (data: unknown) => void;
}

// ─── Context Assembly ────────────────────────────────────────────────────────

export interface ContextAssemblySocketEvents extends BaseSocketEvents {
  'contextAssembly:started': (data: unknown) => void;
  'contextAssembly:rulesEvaluated': (data: unknown) => void;
  'contextAssembly:pipelineComplete': (data: unknown) => void;
  'contextAssembly:complete': (data: ContextAssembleResult) => void;
  'contextAssembly:error': (data: { error: string }) => void;
}

// ─── KV Store ────────────────────────────────────────────────────────────────

export interface KvStoreSocketEvents extends BaseSocketEvents {
  'kvStore:instance-created': (data: KvStoreInstance) => void;
  'kvStore:instance-updated': (data: KvStoreInstance) => void;
  'kvStore:instance-deleted': (data: { instanceId: string }) => void;
  'kvStore:record-set': (data: KvValue) => void;
  'kvStore:record-deleted': (data: { instanceId: string; namespace: string; key: string }) => void;
  'kvStore:namespace-cleared': (data: { instanceId: string; namespace: string }) => void;
}

// ─── Event Log ───────────────────────────────────────────────────────────────

export interface EventLogSocketEvents extends BaseSocketEvents {
  'eventLog:instance-created': (data: EventLogInstance) => void;
  'eventLog:instance-updated': (data: EventLogInstance) => void;
  'eventLog:instance-deleted': (data: { instanceId: string }) => void;
  'eventLog:event-appended': (data: EventLogEvent) => void;
  'eventLog:events-appended': (data: EventLogEvent[]) => void;
}

// ─── Icon View ───────────────────────────────────────────────────────────────

export interface IconViewSocketEvents extends BaseSocketEvents {
  'icon-view:message': (data: IconViewMessage) => void;
  'icon-view:initial': (data: IconViewMessage[]) => void;
  'icon-view:history': (data: IconViewHistoryEntry[]) => void;
  'icon-view:detail': (data: IconViewMessage) => void;
}

// ─── Local Model ─────────────────────────────────────────────────────────────

export interface LocalModelSocketEvents extends BaseSocketEvents {
  'local-model:download-started': (data: { modelId: string }) => void;
  'local-model:download-progress': (data: { modelId: string; progress: number }) => void;
  'local-model:download-complete': (data: LocalModel) => void;
  'local-model:download-error': (data: { modelId: string; error: string }) => void;
  'local-model:deleted': (data: { modelId: string }) => void;
}

// ─── System Alert ────────────────────────────────────────────────────────────

export interface SystemAlertSocketEvents extends BaseSocketEvents {
  'system-alert:created': (data: unknown) => void;
  'system-alert:updated': (data: unknown) => void;
  'system-alert:removed': (data: unknown) => void;
  'system-alert:cleared': (data: unknown) => void;
  'system-alert:cleared-completed': (data: unknown) => void;
  'system-alert:all': (data: unknown[]) => void;
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

export interface OrchestratorSocketEvents extends BaseSocketEvents {
  'orchestrator:thread-update': (data: unknown) => void;
  'orchestrator:message-update': (data: unknown) => void;
}

// ─── Agent Debug ─────────────────────────────────────────────────────────────

export interface AgentDebugSocketEvents extends BaseSocketEvents {
  'agent-debug:list': (data: AgentDebugInstance[]) => void;
  'agent-debug:details': (data: AgentDebugInstance) => void;
  'agent-debug:logs': (data: AgentDebugLog[]) => void;
  'agent-debug:session-started': (data: AgentDebugInstance) => void;
  'agent-debug:log': (data: AgentDebugLog) => void;
  'agent-debug:session-ended': (data: AgentDebugInstance) => void;
}

// ─── Environment Debug ───────────────────────────────────────────────────────

export interface EnvironmentDebugSocketEvents extends BaseSocketEvents {
  'environment-debug:list': (data: EnvironmentDebugInstance[]) => void;
  'environment-debug:details': (data: EnvironmentDebugInstance) => void;
  'environment-debug:logs': (data: EnvironmentDebugLog[]) => void;
  'environment-debug:session-started': (data: EnvironmentDebugInstance) => void;
  'environment-debug:log': (data: EnvironmentDebugLog) => void;
  'environment-debug:session-ended': (data: EnvironmentDebugInstance) => void;
  'environment-debug:state-changed': (data: EnvironmentDebugInstance) => void;
  'environment-debug:health-check': (data: unknown) => void;
}
