/**
 * Codebolt Tools - LLM-ready tool definitions that wrap SDK APIs
 *
 * This module provides tools in OpenAI-compatible format that can be used
 * with LLMs for agentic workflows. Each tool wraps underlying SDK functionality.
 */

// Export types
export * from './types';

// Export base classes
export {
    BaseToolInvocation,
    DeclarativeTool,
    BaseDeclarativeTool,
    Kind,
    type ToolInvocation,
    type ToolResult,
    type ToolLocation,
    type ToolCallConfirmationDetails,
} from './base-tool';

// Export registry
export { ToolRegistry, defaultRegistry } from './registry';

// Export utilities
export * from './utils';

// Export file tools
export {
    ReadFileTool,
    WriteFileTool,
    EditTool,
    ListDirectoryTool,
    ReadManyFilesTool,
    fileTools,
    type ReadFileToolParams,
    type WriteFileToolParams,
    type EditToolParams,
    type ListDirectoryToolParams,
    type ReadManyFilesToolParams,
} from './file';

// Export actionBlock tools
export {
    actionBlockTools,
} from './actionBlock';

// Export actionPlan tools
export {
    actionPlanTools,
} from './actionPlan';

// Export kvStore tools
export {
    kvStoreTools,
} from './kvStore';

// Export roadmap tools
export {
    roadmapTools,
} from './roadmap';

// Export reviewMergeRequest tools
export {
    reviewMergeRequestTools,
} from './reviewMergeRequest';

// Export memoryIngestion tools
export {
    memoryIngestionTools,
} from './memoryIngestion';

// Export rag tools
export {
    ragTools,
} from './rag';

// Export web search tools
export {
    webSearchTools,
} from './search/index-web';

// Export dbmemory tools
export {
    dbmemoryTools,
} from './dbmemory';

// Export agentEventQueue tools
export {
    agentEventQueueTools,
    EventQueueAddEventTool,
    EventQueueSendMessageTool,
    EventQueueGetStatsTool,
    EventQueueGetPendingTool,
    EventQueueWaitNextTool,
    EventQueueAcknowledgeTool,
    type EventQueueAddEventParams,
    type EventQueueSendMessageParams,
    type EventQueueGetStatsParams,
    type EventQueueGetPendingParams,
    type EventQueueWaitNextParams,
    type EventQueueAcknowledgeParams,
} from './agentEventQueue';

// Export search tools
export {
    GlobTool,
    GrepTool,
    SearchFilesTool,
    CodebaseSearchTool,
    SearchMcpToolTool,
    ListCodeDefinitionNamesTool,
    searchTools,
    type GlobToolParams,
    type GrepToolParams,
    type SearchFilesToolParams,
    type CodebaseSearchToolParams,
    type SearchMcpToolToolParams,
    type ListCodeDefinitionNamesToolParams,
} from './search';

// Export terminal tools
export {
    ExecuteCommandTool,
    terminalTools,
    type ExecuteCommandToolParams,
} from './terminal';

// Export git tools (individual tools)
export {
    GitInitTool,
    GitStatusTool,
    GitAddTool,
    GitCommitTool,
    GitPushTool,
    GitPullTool,
    GitCheckoutTool,
    GitBranchTool,
    GitLogsTool,
    GitDiffTool,
    GitCloneTool,
    gitTools,
    type GitInitParams,
    type GitStatusParams,
    type GitAddParams,
    type GitCommitParams,
    type GitPushParams,
    type GitPullParams,
    type GitCheckoutParams,
    type GitBranchParams,
    type GitLogsParams,
    type GitDiffParams,
    type GitCloneParams,
} from './git';

// Export browser tools (individual tools)
export {
    BrowserNavigateTool,
    BrowserScreenshotTool,
    BrowserClickTool,
    BrowserTypeTool,
    BrowserScrollTool,
    BrowserGetContentTool,
    BrowserGetHtmlTool,
    BrowserGetMarkdownTool,
    BrowserGetUrlTool,
    BrowserCloseTool,
    BrowserEnterTool,
    BrowserSearchTool,
    browserTools,
    type BrowserNavigateParams,
    type BrowserScreenshotParams,
    type BrowserClickParams,
    type BrowserTypeParams,
    type BrowserScrollParams,
    type BrowserGetContentParams,
    type BrowserGetHtmlParams,
    type BrowserGetMarkdownParams,
    type BrowserGetUrlParams,
    type BrowserCloseParams,
    type BrowserEnterParams,
    type BrowserSearchParams,
} from './browser';

// Export agent tools
export {
    AgentFindTool,
    AgentStartTool,
    AgentListTool,
    AgentDetailsTool,
    agentTools,
    type AgentFindParams,
    type AgentStartParams,
    type AgentListParams,
    type AgentDetailsParams,
} from './agent';

// Export thread tools
export {
    ThreadCreateTool,
    ThreadCreateStartTool,
    ThreadCreateBackgroundTool,
    ThreadListTool,
    ThreadGetTool,
    ThreadStartTool,
    ThreadUpdateTool,
    ThreadDeleteTool,
    ThreadGetMessagesTool,
    ThreadUpdateStatusTool,
    threadTools,
    type ThreadCreateParams,
    type ThreadCreateStartParams,
    type ThreadCreateBackgroundParams,
    type ThreadListParams,
    type ThreadGetParams,
    type ThreadStartParams,
    type ThreadUpdateParams,
    type ThreadDeleteParams,
    type ThreadGetMessagesParams,
    type ThreadUpdateStatusParams,
} from './thread';

// Export task tools
export {
    TaskCreateTool,
    TaskUpdateTool,
    TaskDeleteTool,
    TaskListTool,
    TaskGetTool,
    TaskAssignTool,
    TaskExecuteTool,
    taskTools,
    type TaskCreateParams,
    type TaskUpdateParams,
    type TaskDeleteParams,
    type TaskListParams,
    type TaskGetParams,
    type TaskAssignParams,
    type TaskExecuteParams,
} from './task';

// Export orchestrator tools
export {
    OrchestratorListTool,
    OrchestratorGetTool,
    OrchestratorGetSettingsTool,
    OrchestratorCreateTool,
    OrchestratorUpdateTool,
    OrchestratorUpdateSettingsTool,
    OrchestratorDeleteTool,
    OrchestratorUpdateStatusTool,
    orchestratorTools,
    type OrchestratorListParams,
    type OrchestratorGetParams,
    type OrchestratorGetSettingsParams,
    type OrchestratorCreateParams,
    type OrchestratorUpdateParams,
    type OrchestratorUpdateSettingsParams,
    type OrchestratorDeleteParams,
    type OrchestratorUpdateStatusParams,
} from './orchestrator';

// Export state tools
export { stateTools } from './state';
export * from './state';

// Export project tools
export { projectTools } from './project';
export * from './project';

// Export LLM tools
export { llmTools } from './llm';
export * from './llm';

// Export memory tools (includes basic memory, episodic memory, and persistent memory)
export { memoryTools } from './memory';
// Note: Don't re-export * from './memory' since individual modules (persistentMemory, episodicMemory) already export them

// Export todo tools
export { todoTools } from './todo';
export * from './todo';

// Export chat tools
export { chatTools } from './chat';
export * from './chat';

// Export capability tools
export { capabilityTools } from './capability';
export * from './capability';

// Export MCP tools
export { mcpTools } from './mcp';
export * from './mcp';

// Export knowledge graph tools
export { knowledgeTools } from './knowledge';
export * from './knowledge';

// Export planning tools (includes action plan and roadmap)
export { planningTools } from './planning';
export * from './planning';

// Export job tools
export { jobTools } from './job';
export * from './job';

// Export calendar tools
export { calendarTools } from './calendar';
export * from './calendar';

// Export testing tools
export { testingTools } from './testing';
export * from './testing';

// Export collaboration tools (includes deliberation, feedback, portfolio)
export { collaborationTools } from './collaboration';
// Note: Don't re-export * from './collaboration' since individual modules (agentDeliberation, agentPortfolio, groupFeedback) already export them

// Export review tools
export { reviewTools } from './review';
export * from './review';

// Export admin tools (includes hook, codemap, eventlog, orchestrator)
export { adminTools } from './admin';
// Note: Don't re-export * from './admin' since individual modules (hook, codemap, eventLog) already export them

// Export context tools
export { contextTools } from './context';
export * from './context';

// Export tokenizer tools
export { tokenizerTools } from './tokenizer';
export * from './tokenizer';

// Export vectordb tools
export { vectordbTools } from './vectordb';
export * from './vectordb';

// Export debug tools
export { debugTools } from './debug';
export * from './debug';

// Export codeutils tools
export { codeutilsTools } from './codeutils';
export * from './codeutils';

// Export history tools
export { historyTools } from './history';
export * from './history';

// Export agentDeliberation tools
export { agentDeliberationTools } from './agentDeliberation';
export * from './agentDeliberation';

// Export agentPortfolio tools
export { agentPortfolioTools } from './agentPortfolio';
export * from './agentPortfolio';

// Export codebaseSearch tools
export { codebaseSearchTools } from './codebaseSearch';
export * from './codebaseSearch';

// Export codemap tools
export { codemapTools } from './codemap';
export * from './codemap';

// Export backgroundChildThreads tools
export { backgroundChildThreadsTools } from './backgroundChildThreads';
export * from './backgroundChildThreads';

// Export contextAssembly tools
export { contextAssemblyTools } from './contextAssembly';
export * from './contextAssembly';

// Export contextRuleEngine tools
export { contextRuleEngineTools } from './contextRuleEngine';
export * from './contextRuleEngine';

// Export groupFeedback tools
export { groupFeedbackTools } from './groupFeedback';
export * from './groupFeedback';

// Export autoTesting tools
export { autoTestingTools } from './autoTesting';
export * from './autoTesting';

// Export episodicMemory tools
export { episodicMemoryTools } from './episodicMemory';
export * from './episodicMemory';

// Export eventLog tools
export { eventLogTools } from './eventLog';
export * from './eventLog';

// Export fs tools
export { fsTools } from './fs';
export * from './fs';

// Export hook tools
export { hookTools } from './hook';
export * from './hook';

// Export knowledgeGraph tools
export { knowledgeGraphTools } from './knowledgeGraph';
export * from './knowledgeGraph';

// Export outputparsers tools
export { outputParsersTools } from './outputparsers';
export * from './outputparsers';

// Export persistentMemory tools
export { persistentMemoryTools } from './persistentMemory';
export * from './persistentMemory';

// Export projectStructureUpdateRequest tools
export { projectStructureUpdateRequestTools } from './projectStructureUpdateRequest';
export * from './projectStructureUpdateRequest';

// Export requirementPlan tools
export { requirementPlanTools } from './requirementPlan';
export * from './requirementPlan';

// Export userMessageManager tools
export { userMessageManagerTools } from './userMessageManager';
export * from './userMessageManager';

// Export userMessageUtilities tools
export { userMessageUtilitiesTools } from './userMessageUtilities';
export * from './userMessageUtilities';

// Export utils tools
export { utilsTools } from './utils';
export * from './utils';

// Export completion tools
export { completionTools } from './completion';
export * from './completion';

// Import all tool arrays
import { fileTools } from './file';
import { searchTools } from './search';
import { terminalTools } from './terminal';
import { gitTools } from './git';
import { browserTools } from './browser';
import { agentTools } from './agent';
import { threadTools } from './thread';
import { taskTools } from './task';
import { orchestratorTools } from './orchestrator';
import { stateTools } from './state';
import { projectTools } from './project';
import { llmTools } from './llm';
import { memoryTools } from './memory';
import { todoTools } from './todo';
import { chatTools } from './chat';
import { capabilityTools } from './capability';
import { mcpTools } from './mcp';
import { knowledgeTools } from './knowledge';
import { planningTools } from './planning';
import { jobTools } from './job';
import { calendarTools } from './calendar';
import { testingTools } from './testing';
import { collaborationTools } from './collaboration';
import { reviewTools } from './review';
import { adminTools } from './admin';
import { contextTools } from './context';
import { tokenizerTools } from './tokenizer';
import { vectordbTools } from './vectordb';
import { debugTools } from './debug';
import { codeutilsTools } from './codeutils';
import { historyTools } from './history';
import { ToolRegistry } from './registry';
import { actionBlockTools } from './actionBlock';
import { actionPlanTools } from './actionPlan';
import { completionTools } from './completion';
import { kvStoreTools } from './kvStore';
import { roadmapTools } from './roadmap';
import { reviewMergeRequestTools } from './reviewMergeRequest';
import { memoryIngestionTools } from './memoryIngestion';
import { ragTools } from './rag';
import { webSearchTools } from './search/index-web';
import { dbmemoryTools } from './dbmemory';
import { agentDeliberationTools } from './agentDeliberation';
import { agentPortfolioTools } from './agentPortfolio';
import { codebaseSearchTools } from './codebaseSearch';
import { codemapTools } from './codemap';
import { backgroundChildThreadsTools } from './backgroundChildThreads';
import { agentEventQueueTools } from './agentEventQueue';
import { contextAssemblyTools } from './contextAssembly';
import { contextRuleEngineTools } from './contextRuleEngine';
import { groupFeedbackTools } from './groupFeedback';
import { autoTestingTools } from './autoTesting';
import { episodicMemoryTools } from './episodicMemory';
import { eventLogTools } from './eventLog';
import { fsTools } from './fs';
import { hookTools } from './hook';
import { knowledgeGraphTools } from './knowledgeGraph';
import { outputParsersTools } from './outputparsers';
import { persistentMemoryTools } from './persistentMemory';
import { projectStructureUpdateRequestTools } from './projectStructureUpdateRequest';
import { requirementPlanTools } from './requirementPlan';
import { userMessageManagerTools } from './userMessageManager';
import { userMessageUtilitiesTools } from './userMessageUtilities';
import { utilsTools } from './utils';

/**
 * All available tools combined
 */
export const allTools = [
    ...fileTools,
    // ...searchTools,
    ...terminalTools,
    // ...gitTools,
    // ...browserTools,
    // ...agentTools,
    ...threadTools,
    // ...taskTools,
    ...orchestratorTools,
    // ...stateTools,
    // ...projectTools,
    // ...llmTools,
    // ...memoryTools,
    // ...todoTools,
    // ...chatTools,
    // ...capabilityTools,
    // ...mcpTools,
    // ...knowledgeTools,
    ...planningTools,
    ...jobTools,
    // ...calendarTools,
    // ...testingTools,
    // ...collaborationTools,
    // ...reviewTools,
    // ...adminTools,
    // ...contextTools,
    // ...tokenizerTools,
    // ...vectordbTools,
    // ...debugTools,
    // ...codeutilsTools,
    // ...historyTools,
    ...actionBlockTools,
    ...actionPlanTools,
    // ...kvStoreTools,
    // ...roadmapTools,
    // ...reviewMergeRequestTools,
    // ...memoryIngestionTools,
    // ...ragTools,
    // ...webSearchTools,
    // ...dbmemoryTools,
    // ...agentDeliberationTools,
    // ...agentPortfolioTools,
    // ...codebaseSearchTools,
    // ...codemapTools,
    // ...backgroundChildThreadsTools,
    // ...contextAssemblyTools,
    // ...contextRuleEngineTools,
    // ...groupFeedbackTools,
    // ...autoTestingTools,
    // ...episodicMemoryTools,
    // ...eventLogTools,
    // ...fsTools,
    // ...hookTools,
    // ...knowledgeGraphTools,
    // ...outputParsersTools,
    // ...persistentMemoryTools,
    // ...projectStructureUpdateRequestTools,
    ...requirementPlanTools,
    // ...userMessageUtilitiesTools,
    // ...utilsTools,
    // ...agentEventQueueTools,
    ...completionTools,
];

/**
 * Create and populate the default tools registry
 */
const toolsRegistry = new ToolRegistry();
toolsRegistry.registerTools(allTools);

/**
 * Tools module providing LLM-ready tool definitions
 */
const tools = {
    /**
     * Get all available tools
     */
    getAllTools: () => allTools,

    /**
     * Get the tool registry
     */
    getRegistry: () => toolsRegistry,

    /**
     * Get OpenAI-compatible tool schemas for all tools
     */
    getToolSchemas: () => toolsRegistry.getToolSchemas(),

    /**
     * Get function call schemas for all tools
     */
    getFunctionCallSchemas: () => toolsRegistry.getFunctionCallSchemas(),

    /**
     * Execute a tool by name
     */
    executeTool: async (
        name: string,
        params: object,
        signal?: AbortSignal,
        updateOutput?: (output: string) => void,
    ) => toolsRegistry.executeTool(name, params, signal, updateOutput),

    /**
     * Get a specific tool by name
     */
    getTool: (name: string) => toolsRegistry.getTool(name),

    /**
     * Check if a tool exists
     */
    hasTool: (name: string) => toolsRegistry.hasTool(name),

    /**
     * Get tool names
     */
    getToolNames: () => toolsRegistry.getToolNames(),

    // Tool categories for convenience
    file: fileTools,
    search: searchTools,
    terminal: terminalTools,
    git: gitTools,
    browser: browserTools,
    agent: agentTools,
    thread: threadTools,
    task: taskTools,
    orchestrator: orchestratorTools,
    state: stateTools,
    project: projectTools,
    llm: llmTools,
    memory: memoryTools,
    todo: todoTools,
    chat: chatTools,
    capability: capabilityTools,
    mcp: mcpTools,
    knowledge: knowledgeTools,
    planning: planningTools,
    job: jobTools,
    calendar: calendarTools,
    testing: testingTools,
    collaboration: collaborationTools,
    review: reviewTools,
    admin: adminTools,
    context: contextTools,
    tokenizer: tokenizerTools,
    vectordb: vectordbTools,
    debug: debugTools,
    codeutils: codeutilsTools,
    history: historyTools,
    actionBlock: actionBlockTools,
    rag: ragTools,
    webSearch: webSearchTools,
    dbmemory: dbmemoryTools,
    agentDeliberation: agentDeliberationTools,
    agentPortfolio: agentPortfolioTools,
    codebaseSearch: codebaseSearchTools,
    codemap: codemapTools,
    backgroundChildThreads: backgroundChildThreadsTools,
    contextAssembly: contextAssemblyTools,
    contextRuleEngine: contextRuleEngineTools,
    groupFeedback: groupFeedbackTools,
    autoTesting: autoTestingTools,
    episodicMemory: episodicMemoryTools,
    eventLog: eventLogTools,
    fs: fsTools,
    hook: hookTools,
    knowledgeGraph: knowledgeGraphTools,
    outputParsers: outputParsersTools,
    persistentMemory: persistentMemoryTools,
    projectStructureUpdateRequest: projectStructureUpdateRequestTools,
    requirementPlan: requirementPlanTools,
    userMessageManager: userMessageManagerTools,
    userMessageUtilities: userMessageUtilitiesTools,
    utils: utilsTools,
    agentEventQueue: agentEventQueueTools,
    completion: completionTools,
};

export default tools;
