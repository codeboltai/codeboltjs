export interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'working' | 'idle' | 'error' | 'offline';
  currentTask?: string;
  model: string;
  tasksCompleted: number;
  lastHeartbeat: string;
  uptime: string;
  capabilities: string[];
  avatar?: string;
  color?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  assignedAgent?: Agent;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  needsApproval: boolean;
  projectId?: string;
  timeElapsed?: number;
  activityLog?: TaskActivity[];
  comments?: TaskComment[];
  files?: string[];
}

export type TaskStatus = 'inbox' | 'assigned' | 'in_progress' | 'testing' | 'review' | 'done' | 'archived';

export interface TaskActivity {
  id: string;
  type: 'status_change' | 'tool_used' | 'file_modified' | 'comment' | 'completed';
  description: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

export interface TaskComment {
  id: string;
  author: string;
  authorType: 'user' | 'agent';
  content: string;
  timestamp: string;
}

export interface Mission {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'paused' | 'complete';
  tasks: Task[];
  completedTasks: number;
  totalTasks: number;
  agents: Agent[];
  lastActivity: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  agentCount: number;
  taskCount: number;
  fileCount: number;
  lastActivity: string;
  status: 'active' | 'paused' | 'archived';
  progress: number;
  createdAt: string;
}

export interface Schedule {
  id: string;
  name: string;
  taskDescription: string;
  scheduleType: 'interval' | 'daily' | 'weekly' | 'monthly' | 'cron';
  scheduleValue: string;
  humanReadable: string;
  agentId: string;
  agentName: string;
  projectId?: string;
  projectName?: string;
  enabled: boolean;
  lastRun?: ScheduleRun;
  nextRun?: string;
  deliveryType: 'announce' | 'webhook' | 'silent';
  deliveryTarget?: string;
}

export interface ScheduleRun {
  time: string;
  duration: number;
  status: 'success' | 'failed' | 'skipped' | 'timeout';
  summary: string;
}

export interface Channel {
  id: string;
  platform: ChannelPlatform;
  name: string;
  status: 'connected' | 'disconnected' | 'reconnecting';
  identifier: string;
  messageCount: number;
  assignedAgent?: Agent;
  connectedSince?: string;
  lastMessage?: string;
  config: ChannelConfig;
}

export type ChannelPlatform = 'webchat' | 'whatsapp' | 'telegram' | 'slack' | 'discord' | 'teams' | 'email' | 'sms' | 'webhook' | 'custom';

export interface ChannelConfig {
  autoReply?: boolean;
  autoReplyMessage?: string;
  welcomeMessage?: string;
  allowList?: string[];
  blockList?: string[];
  workingHours?: { start: string; end: string };
  outOfHoursMessage?: string;
  mediaSupport?: boolean;
}

export interface RoutingRule {
  id: string;
  name: string;
  channels: string[];
  matchType: 'always' | 'contact' | 'keyword' | 'regex' | 'sender_group';
  matchValue: string;
  routeToAgent: string;
  sessionScope: 'shared' | 'per-contact' | 'per-channel-contact';
  priority: number;
  enabled: boolean;
}

export interface FileItem {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  extension?: string;
  size?: number;
  lastModified: string;
  modifiedBy?: string;
  children?: FileItem[];
}

export interface VersionSnapshot {
  id: string;
  agentName: string;
  description: string;
  filesChanged: string[];
  timestamp: string;
  canRestore: boolean;
}

export interface FeedEvent {
  id: string;
  type: 'tool' | 'user' | 'agent' | 'error' | 'warning';
  timestamp: string;
  agentId?: string;
  agentName?: string;
  description: string;
  details?: Record<string, unknown>;
  expandable?: boolean;
}

export interface SquadMessage {
  id: string;
  timestamp: string;
  fromAgent: Agent;
  toAgent: Agent;
  content: string;
  type: 'delegation' | 'review_request' | 'discussion' | 'approval' | 'conflict' | 'standup';
}

export interface ApprovalRequest {
  id: string;
  agentId: string;
  agentName: string;
  description: string;
  category: 'deploy' | 'delete' | 'config_change' | 'external_api' | 'cost';
  timestamp: string;
  riskLevel: 'low' | 'medium' | 'high';
  details?: Record<string, unknown>;
  status: 'pending' | 'approved' | 'rejected';
}

export interface UsageStats {
  todayCost: number;
  weekCost: number;
  todayTokens: number;
  activeAgentHours: number;
  byAgent: AgentUsage[];
}

export interface AgentUsage {
  agentId: string;
  agentName: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
  apiCalls: number;
  toolCalls: number;
  cost: number;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderType: 'user' | 'agent' | 'system';
  senderName?: string;
  content: string;
  timestamp: string;
  templateType?: string;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  name: string;
  args: Record<string, unknown>;
  result?: unknown;
  status: 'pending' | 'running' | 'success' | 'error';
}

export interface Notification {
  id: string;
  type: 'task' | 'approval' | 'error' | 'system';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface AppSettings {
  displayName: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  defaultProject?: string;
  aiProvider: string;
  apiKey?: string;
  defaultModel: string;
  fallbackModel?: string;
  maxTokens: number;
  defaultAutonomy: 'low' | 'medium' | 'high';
  thinkingMode: boolean;
  autoCreateAgents: boolean;
  sessionTimeout: number;
  notifications: NotificationSettings;
}

export interface NotificationSettings {
  desktop: boolean;
  taskCompleted: boolean;
  errorOccurred: boolean;
  approvalNeeded: boolean;
  dailySummary: boolean;
  dailySummaryTime?: string;
  webhook?: string;
}

export interface Integration {
  id: string;
  name: string;
  category: 'version_control' | 'deployment' | 'communication' | 'database' | 'design' | 'tools';
  icon: string;
  connected: boolean;
  config?: Record<string, unknown>;
}

export interface LogEntry {
  id: string;
  level: 'error' | 'warning' | 'info' | 'debug';
  message: string;
  timestamp: string;
  agentId?: string;
  details?: Record<string, unknown>;
}
