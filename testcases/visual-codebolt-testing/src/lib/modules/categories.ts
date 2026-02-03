import { ModuleCategory } from './types';

export const MODULE_CATEGORIES: ModuleCategory[] = [
  {
    id: 'file-system',
    name: 'FILE_SYSTEM',
    description: 'File and code operations',
    icon: 'FolderOpen',
    modules: ['fs', 'codeutils', 'outputparsers'],
  },
  {
    id: 'browser',
    name: 'BROWSER',
    description: 'Browser automation and control',
    icon: 'Globe',
    modules: ['browser', 'crawler'],
  },
  {
    id: 'communication',
    name: 'COMMUNICATION',
    description: 'Chat, mail, and terminal',
    icon: 'MessageSquare',
    modules: ['chat', 'mail', 'terminal'],
  },
  {
    id: 'version-control',
    name: 'VERSION_CONTROL',
    description: 'Git operations',
    icon: 'GitBranch',
    modules: ['git'],
  },
  {
    id: 'ai-llm',
    name: 'AI_&_LLM',
    description: 'Language models and MCP tools',
    icon: 'Brain',
    modules: ['llm', 'mcp'],
  },
  {
    id: 'agents',
    name: 'AGENTS',
    description: 'Agent management and coordination',
    icon: 'Bot',
    modules: ['agent', 'swarm', 'agentDeliberation', 'agentEventQueue', 'agentPortfolio'],
  },
  {
    id: 'jobs-tasks',
    name: 'JOBS_&_TASKS',
    description: 'Job and task management',
    icon: 'ListTodo',
    modules: ['job', 'task', 'todo', 'actionPlan', 'actionBlock', 'sideExecution'],
  },
  {
    id: 'memory',
    name: 'MEMORY_SYSTEMS',
    description: 'Memory storage and retrieval',
    icon: 'Database',
    modules: ['memory', 'episodicMemory', 'persistentMemory', 'knowledgeGraph', 'memoryIngestion', 'contextAssembly'],
  },
  {
    id: 'project',
    name: 'PROJECT_MGMT',
    description: 'Project structure and roadmap',
    icon: 'FolderKanban',
    modules: ['project', 'projectStructure', 'roadmap', 'codemap', 'requirementPlan'],
  },
  {
    id: 'testing',
    name: 'TESTING',
    description: 'Automated testing',
    icon: 'TestTube',
    modules: ['autoTesting'],
  },
  {
    id: 'calendar',
    name: 'CALENDAR_&_EVENTS',
    description: 'Calendar, events, and hooks',
    icon: 'Calendar',
    modules: ['calendar', 'eventLog', 'hook'],
  },
  {
    id: 'search',
    name: 'SEARCH',
    description: 'Search and vector operations',
    icon: 'Search',
    modules: ['search', 'codebaseSearch', 'vectordb'],
  },
  {
    id: 'config',
    name: 'CONFIGURATION',
    description: 'State and storage',
    icon: 'Settings',
    modules: ['capability', 'state', 'kvStore', 'contextRuleEngine'],
  },
  {
    id: 'orchestration',
    name: 'ORCHESTRATION',
    description: 'Thread and process management',
    icon: 'Network',
    modules: ['orchestrator', 'backgroundChildThreads', 'thread'],
  },
  {
    id: 'review',
    name: 'REVIEW_&_FEEDBACK',
    description: 'Code review and feedback',
    icon: 'GitPullRequest',
    modules: ['reviewMergeRequest', 'groupFeedback', 'fileUpdateIntent', 'projectStructureUpdateRequest'],
  },
  {
    id: 'utilities',
    name: 'UTILITIES',
    description: 'Utility functions',
    icon: 'Wrench',
    modules: ['utils', 'tokenizer', 'debug', 'history', 'userMessageUtilities'],
  },
];

export const getCategoryById = (id: string): ModuleCategory | undefined => {
  return MODULE_CATEGORIES.find(cat => cat.id === id);
};

export const getCategoryByModuleName = (moduleName: string): ModuleCategory | undefined => {
  return MODULE_CATEGORIES.find(cat => cat.modules.includes(moduleName));
};
