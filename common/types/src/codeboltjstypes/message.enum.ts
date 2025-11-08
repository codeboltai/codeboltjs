export enum EventType {
    AGENT_EVENT = "agentEvent",
    BROWSER_EVENT = "browserEvent",
    CHAT_EVENT = "chatEvent",
    CODE_EVENT = "codeEvent",
    FS_EVENT = "fsEvent",
    GIT_EVENT = "gitEvent",
    LLM_EVENT = "inference",
    STATE_EVENT = "stateEvent",
    CODEBOLT_TOOLS_EVENT = "codebolttools",
    TASK_EVENT = "taskEvent",
    TERMINAL_EVENT = "terminalEvent",
    VECTOR_DB_EVENT = "vectorDbEvent",
    TOKENIZER_EVENT = "tokenizerEvent",
    PROJECT_EVENT = "projectEvent",
    CHAT_SUMMARY_EVENT = "chatSummaryEvent",
    MEMORY_EVENT = "memoryEvent",
    ACTION_PLAN="actionPlanEvent"
    
}

export enum AgentAction {
    FIND_AGENT = "findAgent",
    START_AGENT = "startAgent",
    LIST_AGENTS = "listAgents",
    AGENTS_DETAIL = "agentsDetail",
}


export enum ActionPlanAction{
    GETALL_ACTION_PLAN="getAllActionPlans",
    GET_PLAN_DETAIL="getPlanDetail",
    GET_ACTION_PLAN_DETAIL="getActionPlanDetail",
    CREATE_ACTION_PLAN="createActionPlan",
    UPDATE_ACTION_PLAN="updateActionPlan",
    ADD_TASK_TO_ACTION_PLAN="addTaskToActionPlan",
    START_TASK_STEP="startTaskStep"
}

export enum ActionPlanResponseType{
    GETALL_ACTION_PLAN_RESPONSE="getAllActionPlanResponse",
    GET_PLAN_DETAIL_RESPONSE="getPlanDetailResponse",
    GET_ACTION_PLAN_DETAIL_RESPONSE="getActionPlanDetailResponse",
    CREATE_ACTION_PLAN_RESPONSE="createActionPlanResponse",
    UPDATE_ACTION_PLAN_RESPONSE="updateActionPlanResponse",
    ADD_TASK_TO_ACTION_PLAN_RESPONSE="addTaskToActionPlanResponse",
    START_TASK_STEP_RESPONSE="startTaskStepResponse"
}

export enum AgentResponseType {
    FIND_AGENT_BY_TASK_RESPONSE = "findAgentByTaskResponse",
    TASK_COMPLETION_RESPONSE = "taskCompletionResponse",
    LIST_AGENTS_RESPONSE = "listAgentsResponse",
    AGENTS_DETAIL_RESPONSE = "agentsDetailResponse",
}

export enum AgentLocation {
    ALL = "all",
    LOCAL_ONLY = "local_only",
    REMOTE_ONLY = "remote_only",
}

export enum Agents {
    LOCAL = "local",
    ALL = "all",
    DOWNLOADED = "downloaded",
}

export enum FilterUsing {
    USE_AI = "use_ai",
    USE_VECTOR_DB = "use_vector_db",
    USE_BOTH = "use_both",
}


export enum BrowserAction {
    NEW_PAGE = "newPage",
    GET_URL = "getUrl",
    GO_TO_PAGE = "goToPage",
    SCREENSHOT = "screenshot",
    GET_HTML = "getHTML",
    GET_MARKDOWN = "getMarkdown",
    GET_PDF = "getPDF",
    PDF_TO_TEXT = "pdfToText",
    GET_CONTENT = "getContent",
    GET_SNAPSHOT = "getSnapShot",
    GET_BROWSER_INFO = "getBrowserInfo",
    EXTRACT_TEXT = "extractText",
    CLOSE = "close",
    SCROLL = "scroll",
    TYPE = "type",
    CLICK = "click",
    ENTER = "enter",
    SEARCH = "search",
}

export enum BrowserResponseType {
    NEW_PAGE_RESPONSE = "newPageResponse",
    GET_URL_RESPONSE = "getUrlResponse",
    GO_TO_PAGE_RESPONSE = "goToPageResponse",
    SCREENSHOT_RESPONSE = "screenshotResponse",
    HTML_RECEIVED = "htmlReceived",
    GET_MARKDOWN_RESPONSE = "getMarkdownResponse",
    GET_CONTENT_RESPONSE = "getContentResponse",
    GET_SNAPSHOT_RESPONSE = "getSnapShotResponse",
    GET_BROWSER_INFO_RESPONSE = "getBrowserInfoResponse",
    EXTRACT_TEXT_RESPONSE = "extractTextResponse",
    SCROLL_RESPONSE = "scrollResponse",
    TYPE_RESPONSE = "typeResponse",
    CLICK_RESPONSE = "clickResponse",
    ENTER_RESPONSE = "EnterResponse",
    SEARCH_RESPONSE = "searchResponse",
}


export enum ChatEventType {
    GET_CHAT_HISTORY = "getChatHistory",
    SEND_MESSAGE = "sendMessage",
    WAIT_FOR_REPLY = "waitforReply",
    PROCESS_STARTED = "processStarted",
    PROCESS_STOPPED = "processStoped",
    PROCESS_FINISHED = "processFinished",
    CONFIRMATION_REQUEST = "confirmationRequest",
    NOTIFICATION_EVENT = "notificationEvent",
    STOP_PROCESS_CLICKED = "stopProcessClicked",
}

export enum ChatResponseType {
    GET_CHAT_HISTORY_RESPONSE = "getChatHistoryResponse",
    WAIT_FOR_MESSAGE_RESPONSE = "waitFormessageResponse",
    CONFIRMATION_RESPONSE = "confirmationResponse",
    FEEDBACK_RESPONSE = "feedbackResponse",
    CONFIRMATION_OR_FEEDBACK_RESPONSE = "confirmationResponse|feedbackResponse",
}

export enum NotificationType {
    DEBUG = "debug",
    GIT = "git",
    PLANNER = "planner",
    BROWSER = "browser",
    EDITOR = "editor",
    TERMINAL = "terminal",
    PREVIEW = "preview",
}


export enum CodeboltToolsAction {
    GetEnabledToolBoxes = "getEnabledToolBoxes",
    GetLocalToolBoxes = "getLocalToolBoxes",
    GetAvailableToolBoxes = "getAvailableToolBoxes",
    SearchAvailableToolBoxes = "searchAvailableToolBoxes",
    ListToolsFromToolBoxes = "listToolsFromToolBoxes",
    ConfigureToolBox = "configureToolBox",
    GetTools = "getTools",
    ExecuteTool = "executeTool",
}

export enum CodeboltToolsResponse {
    GetEnabledToolBoxesResponse = "getEnabledToolBoxesResponse",
    GetLocalToolBoxesResponse = "getLocalToolBoxesResponse",
    GetAvailableToolBoxesResponse = "getAvailableToolBoxesResponse",
    SearchAvailableToolBoxesResponse = "searchAvailableToolBoxesResponse",
    ListToolsFromToolBoxesResponse = "listToolsFromToolBoxesResponse",
    ConfigureToolBoxResponse = "configureToolBoxResponse",
    GetToolsResponse = "getToolsResponse",
    ExecuteToolResponse = "executeToolResponse",
}


export enum CodeAction {
    GET_ALL_FILES_MARKDOWN = "getAllFilesMarkdown",
    PERFORM_MATCH = "performMatch",
    GET_MATCHER_LIST = "getMatcherList",
    GET_MATCH_DETAIL = "getMatchDetail",
}

export enum CodeResponseType {
    GET_ALL_FILES_MARKDOWN_RESPONSE = "getAllFilesMarkdownResponse",
    MATCH_PROBLEM_RESPONSE = "matchProblemResponse",
    GET_MATCHER_LIST_TREE_RESPONSE = "getMatcherListTreeResponse",
    GET_MATCH_DETAIL_RESPONSE = "getMatchDetailResponse",
    GET_JS_TREE_RESPONSE = "getJsTreeResponse",
}


export enum FSAction {
    CREATE_FILE = "createFile",
    CREATE_FOLDER = "createFolder",
    READ_FILE = "readFile",
    UPDATE_FILE = "updateFile",
    DELETE_FILE = "deleteFile",
    DELETE_FOLDER = "deleteFolder",
    FILE_LIST = "fileList",
    LIST_CODE_DEFINITION_NAMES = "listCodeDefinitionNames",
    SEARCH_FILES = "searchFiles",
    WRITE_TO_FILE = "writeToFile",
    GREP_SEARCH = "grep_search",
    FILE_SEARCH = "file_search",
    EDIT_FILE_WITH_DIFF = "edit_file_with_diff",
    EDIT_FILE_AND_APPLY_DIFF = "edit_file_and_apply_diff",
    READ_MANY_FILES = "read_many_files",
    LIST_DIRECTORY = "list_directory",
}

export enum FSResponseType {
    CREATE_FILE_RESPONSE = "createFileResponse",
    CREATE_FOLDER_RESPONSE = "createFolderResponse",
    READ_FILE_RESPONSE = "readFileResponse",
    UPDATE_FILE_RESPONSE = "updateFileResponse",
    DELETE_FILE_RESPONSE = "deleteFileResponse",
    DELETE_FOLDER_RESPONSE = "deleteFolderResponse",
    FILE_LIST_RESPONSE = "fileListResponse",
    LIST_CODE_DEFINITION_NAMES_RESPONSE = "listCodeDefinitionNamesResponse",
    SEARCH_FILES_RESPONSE = "searchFilesResponse",
    WRITE_TO_FILE_RESPONSE = "writeToFileResponse",
    GREP_SEARCH_RESPONSE = "grepSearchResponse",
    FILE_SEARCH_RESPONSE = "fileSearchResponse",
    EDIT_FILE_AND_APPLY_DIFF_RESPONSE = "editFileAndApplyDiffResponse",
    READ_MANY_FILES_RESPONSE = "readManyFilesResponse",
    LIST_DIRECTORY_RESPONSE = "listDirectoryResponse",
}




export enum GitAction {
    INIT = "Init",
    PULL = "Pull",
    PUSH = "Push",
    STATUS = "Status",
    ADD = "Add",
    COMMIT = "Commit",
    CHECKOUT = "Checkout",
    GIT_BRANCH = "gitBranch",
    GIT_LOGS = "gitLogs",
    DIFF = "Diff",
}

export enum GitResponseType {
    GIT_INIT_RESPONSE = "gitInitResponse",
    PULL_RESPONSE = "PullResponse",
    PUSH_RESPONSE = "PushResponse",
    GIT_STATUS_RESPONSE = "gitStatusResponse",
    ADD_RESPONSE = "AddResponse",
    GIT_COMMIT_RESPONSE = "gitCommitResponse",
    GIT_CHECKOUT_RESPONSE = "gitCheckoutResponse",
    GIT_BRANCH_RESPONSE = "gitBranchResponse",
    GIT_LOGS_RESPONSE = "gitLogsResponse",
    DIFF_RESPONSE = "DiffResponse",
}



export enum LLMRole {
    USER = "user",
    ASSISTANT = "assistant",
    SYSTEM = "system",
    TOOL = "tool",
}

export enum ToolChoice {
    NONE = "none",
    AUTO = "auto",
    REQUIRED = "required",
}


export enum StateEventType {
    PROJECT_STATE_EVENT = "projectStateEvent",
    AGENT_STATE_EVENT = "agentStateEvent",
}

export enum StateAction {
    GET_APP_STATE = "getAppState",
    ADD_TO_AGENT_STATE = "addToAgentState",
    GET_AGENT_STATE = "getAgentState",
    GET_PROJECT_STATE = "getProjectState",
    UPDATE_PROJECT_STATE = "updateProjectState",
}

export enum StateResponseType {
    GET_APP_STATE_RESPONSE = "getAppStateResponse",
    ADD_TO_AGENT_STATE_RESPONSE = "addToAgentStateResponse",
    GET_AGENT_STATE_RESPONSE = "getAgentStateResponse",
    GET_PROJECT_STATE_RESPONSE = "getProjectStateResponse",
    UPDATE_PROJECT_STATE_RESPONSE = "updateProjectStateResponse",
}

export enum TaskAction {
    ADD_TASK = "addTask",
    GET_TASKS = "getTasks",
    GET_TASKS_BY_AGENT = "getTasksByAgent",
    GET_TASKS_BY_CATEGORY = "getTasksByCategory",
    GET_ALL_AGENTS = "getAllAgents",
    UPDATE_TASK = "updateTask",
    DELETE_TASK = "deleteTask",
    ADD_SUB_TASK = "addSubTask",
    UPDATE_SUB_TASK = "updateSubTask",
    DELETE_SUB_TASK = "deleteSubTask",
    CREATE_TASKS_FROM_MARKDOWN = "createTasksFromMarkdown",
    EXPORT_TASKS_TO_MARKDOWN = "exportTasksToMarkdown",
}

export enum TaskResponseType {
    ADD_TASK_RESPONSE = "addTaskResponse",
    GET_TASKS_RESPONSE = "getTasksResponse",
    GET_TASKS_BY_AGENT_RESPONSE = "getTasksByAgentResponse",
    GET_TASKS_BY_CATEGORY_RESPONSE = "getTasksByCategoryResponse",
    GET_ALL_AGENTS_RESPONSE = "getAllAgentsResponse",
    UPDATE_TASKS_RESPONSE = "updateTasksResponse",
    DELETE_TASK_RESPONSE = "deleteTaskResponse",
    ADD_SUB_TASK_RESPONSE = "addSubTaskResponse",
    UPDATE_SUB_TASK_RESPONSE = "updateSubTaskResponse",
    DELETE_SUB_TASK_RESPONSE = "deleteSubTaskResponse",
    CREATE_TASKS_FROM_MARKDOWN_RESPONSE = "createTasksFromMarkdownResponse",
    EXPORT_TASKS_TO_MARKDOWN_RESPONSE = "exportTasksToMarkdownResponse",
}

export enum TaskPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
}

export enum TaskPhase {
    PLANNING = "planning",
    DEVELOPMENT = "development",
    TESTING = "testing",
    DEPLOYMENT = "deployment",
    COMPLETED = "completed",
}

export enum TerminalEventType {
    EXECUTE_COMMAND = "executeCommand",
    EXECUTE_COMMAND_RUN_UNTIL_ERROR = "executeCommandRunUntilError",
    EXECUTE_COMMAND_WITH_STREAM = "executeCommandWithStream",
    SEND_INTERRUPT_TO_TERMINAL = "sendInterruptToTerminal",
}

export enum TerminalResponseType {
    COMMAND_OUTPUT = "commandOutput",
    COMMAND_ERROR = "commandError",
    COMMAND_FINISH = "commandFinish",
    TERMINAL_INTERRUPTED = "terminalInterrupted",
    COMMAND_ERROR_OR_FINISH = "commandError|commandFinish",
}

export enum VectorDBAction {
    GET_VECTOR = "getVector",
    ADD_VECTOR_ITEM = "addVectorItem",
    QUERY_VECTOR_ITEM = "queryVectorItem",
    QUERY_VECTOR_ITEMS = "queryVectorItems",
}

export enum VectorDBResponseType {
    GET_VECTOR_RESPONSE = "getVectorResponse",
    ADD_VECTOR_ITEM_RESPONSE = "addVectorItemResponse",
    QUERY_VECTOR_ITEM_RESPONSE = "qeryVectorItemResponse",
    QUERY_VECTOR_ITEMS_RESPONSE = "qeryVectorItemsResponse",
}

export enum TokenizerAction {
    ADD_TOKEN = "addToken",
    GET_TOKEN = "getToken",
}
    
export enum TokenizerResponseType {
    ADD_TOKEN_RESPONSE = "addTokenResponse",
    GET_TOKEN_RESPONSE = "getTokenResponse",
}

export enum ProjectAction {
    GET_PROJECT_SETTINGS = "getProjectSettings",
    GET_PROJECT_PATH = "getProjectPath",
    GET_EDITOR_FILE_STATUS = "getEditorFileStatus",
    GET_REPO_MAP = "getRepoMap",
    RUN_PROJECT = "runProject",
}

export enum ProjectResponseType {
    GET_PROJECT_SETTINGS_RESPONSE = "getProjectSettingsResponse",
    GET_PROJECT_PATH_RESPONSE = "getProjectPathResponse",
    GET_EDITOR_FILE_STATUS_RESPONSE = "getEditorFileStatusResponse",
    GET_REPO_MAP_RESPONSE = "getRepoMapResponse",
    RUN_PROJECT_RESPONSE = "runProjectResponse",
}

export enum ChatSummaryAction {
    SUMMARIZE_ALL = "summarizeAll",
    SUMMARIZE_PART = "summarize",
}

export enum ChatSummaryResponseType {
    SUMMARIZE_ALL_RESPONSE = "summarizeAllResponse",
    SUMMARIZE_PART_RESPONSE = "summarizePartResponse",
}

export enum MemoryAction {
    GET_MEMORY = "get",
    SET_MEMORY = "set",
}

export enum MemoryResponseType {
    GET_MEMORY_RESPONSE = "getMemoryResponse",
    SET_MEMORY_RESPONSE = "setMemoryResponse",
}

export enum LLMResponseType {   
    LLM_RESPONSE = "llmResponse",
}


