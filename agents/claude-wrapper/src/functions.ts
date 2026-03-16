// Import CodeboltJS main instance
import codebolt from '@codebolt/codeboltjs';

// User message notifications
export const sendUserMessageRecordNotification = (content: any, sessionId: string, parentToolUseId: string | null) => {
    // Use CodeboltJS UserMessageRequestNotify
    codebolt.notify.chat.UserMessageRequestNotify(
        typeof content === 'string' ? content : JSON.stringify(content),
        { sessionId, parentToolUseId }
    );
    
    console.log("👤 User Message:", {
        content,
        sessionId,
        parentToolUseId
    });
};

// Agent text response notifications
export const agentTextResponseNotification = (text: string) => {
    // Use CodeboltJS AgentTextResponseNotify
    codebolt.notify.chat.AgentTextResponseNotify(text);
    
    console.log("📝 Agent Text Response:", {text});
};

// File operation notifications
export const agentFileReadNotification = (toolId: string, input: any) => {
    // Use CodeboltJS FileReadRequestNotify
    codebolt.notify.fs.FileReadRequestNotify(
        input.path || input.file_path || input.filename,
        input.start_line?.toString(),
        input.end_line?.toString(),
        toolId
    );
    
    console.log("📖 Agent File Read:", {
        toolId,
        filePath: input.path || input.file_path || input.filename,
        startLine: input.start_line,
        endLine: input.end_line,
        explanation: input.explanation
    });
};

export const agentFileWriteNotification = (toolId: string, input: any) => {
    // Use CodeboltJS WriteToFileRequestNotify
    codebolt.notify.fs.WriteToFileRequestNotify(
        input.path || input.file_path || input.filename,
        input.text || input.content || '',
        toolId
    );
    
    console.log("✏️ Agent File Write:", {
        toolId,
        filePath: input.path || input.file_path || input.filename,
        content: input.text ? `${input.text.substring(0, 100)}...` : undefined
    });
};

export const agentFileEditNotification = (toolId: string, input: any) => {
    // Use CodeboltJS FileEditRequestNotify
    codebolt.notify.fs.FileEditRequestNotify(
        input.path?.split('/').pop() || 'file',
        input.path,
        input.newStr || input.newContent || '',
        toolId
    );
    
    console.log("✏️ Agent File Edit:", {
        toolId,
        filePath: input.path,
        oldStr: input.oldStr ? `${input.oldStr.substring(0, 50)}...` : undefined,
        newStr: input.newStr ? `${input.newStr.substring(0, 50)}...` : undefined
    });
};

export const agentMultiEditNotification = (toolId: string, input: any) => {
    // For multi-edit, we'll use a general file edit notification
    // Since CodeboltJS doesn't have a specific multi-edit function
    if (input.edits && Array.isArray(input.edits)) {
        input.edits.forEach((edit: any, index: number) => {
            codebolt.notify.fs.FileEditRequestNotify(
                edit.path?.split('/').pop() || `file-${index}`,
                edit.path,
                edit.newContent || edit.newStr || '',
                `${toolId}-${index}`
            );
        });
    }
    
    console.log("✏️ Agent Multi Edit:", {
        toolId,
        edits: input.edits ? input.edits.length : 0,
        files: input.files || input.paths
    });
};

// Directory and file listing notifications
export const agentListFilesNotification = (toolId: string, input: any) => {
    // Use CodeboltJS ListDirectoryRequestNotify
    codebolt.notify.fs.ListDirectoryRequestNotify(
        input.path || '.',
        toolId
    );
    
    console.log("📁 Agent List Files:", {
        toolId,
        path: input.path
    });
};

// Search notifications
export const agentGrepNotification = (toolId: string, input: any) => {
    // Use CodeboltJS GrepSearchRequestNotify
    codebolt.notify.codeutils.GrepSearchRequestNotify(
        input.query || input.pattern,
        input.filePath || input.includePattern,
        input.recursive,
        input.ignoreCase || !input.case_sensitive,
        input.maxResults,
        toolId
    );
    
    console.log("🔍 Agent Grep Search:", {
        toolId,
        query: input.query,
        includePattern: input.includePattern,
        excludePattern: input.excludePattern,
        explanation: input.explanation
    });
};

export const agentGlobNotification = (toolId: string, input: any) => {
    // Use CodeboltJS GlobSearchRequestNotify
    codebolt.notify.codeutils.GlobSearchRequestNotify(
        input.pattern,
        input.path || input.basePath,
        input.maxDepth,
        input.includeDirectories,
        toolId
    );
    
    console.log("🌐 Agent Glob Search:", {
        toolId,
        pattern: input.pattern,
        path: input.path,
        explanation: input.explanation
    });
};

// Task and execution notifications
export const agentTaskNotification = (toolId: string, input: any) => {
    // Use CodeboltJS AddTodoRequestNotify
    codebolt.notify.todo.AddTodoRequestNotify(
        input.task || input.description,
        undefined, // agentId
        input.description || input.task,
        input.phase,
        input.category,
        input.priority,
        input.tags,
        toolId
    );
    
    console.log("📋 Agent Task:", {
        toolId,
        task: input.task || input.description,
        priority: input.priority,
        status: input.status
    });
};

export const agentBashNotification = (toolId: string, input: any) => {
    // Use CodeboltJS CommandExecutionRequestNotify
    codebolt.notify.terminal.CommandExecutionRequestNotify(
        input.command,
        input.returnEmptyStringOnSuccess,
        input.executeInMain,
        toolId
    );
    
    console.log("⚡ Agent Bash Command:", {
        toolId,
        command: input.command,
        path: input.path,
        args: input.args
    });
};

export const agentTodoWriteNotification = (toolId: string, input: any) => {
    // Use CodeboltJS AddTodoRequestNotify for each todo
    if (input.todos && Array.isArray(input.todos)) {
        input.todos.forEach((todo: any, index: number) => {
            codebolt.notify.todo.AddTodoRequestNotify(
                todo.content,
                undefined, // agentId
                todo.content,
                todo.phase,
                todo.category,
                todo.priority,
                todo.tags,
                `${toolId}-${index}`
            );
        });
    }
    
    console.log("📝 Agent Todo Write:", {
        toolId,
        todosCount: input.todos ? input.todos.length : 0,
        todos: input.todos ? input.todos.map((todo: any) => ({
            id: todo.id,
            content: todo.content,
            status: todo.status,
            priority: todo.priority
        })) : []
    });
};

// Web operations notifications
export const agentWebFetchNotification = (toolId: string, input: any) => {
    // Use CodeboltJS WebFetchRequestNotify
    codebolt.notify.browser.WebFetchRequestNotify(
        input.url,
        input.method || 'GET',
        input.headers,
        input.body,
        input.timeout,
        toolId
    );
    
    console.log("🌐 Agent Web Fetch:", {
        toolId,
        url: input.url,
        method: input.method || 'GET',
        headers: input.headers
    });
};

export const agentWebSearchNotification = (toolId: string, input: any) => {
    // Use CodeboltJS WebSearchRequestNotify
    codebolt.notify.browser.WebSearchRequestNotify(
        input.query,
        input.maxResults || input.max_results,
        input.searchEngine || input.search_engine,
        input.filters,
        toolId
    );
    
    console.log("🔍 Agent Web Search:", {
        toolId,
        query: input.query,
        maxResults: input.maxResults || input.max_results,
        searchEngine: input.searchEngine || input.search_engine
    });
};

// Notebook operations notifications
export const agentNotebookReadNotification = (toolId: string, input: any) => {
    // Use FileReadRequestNotify for notebooks (treating as file read)
    codebolt.notify.fs.FileReadRequestNotify(
        input.path || input.notebook_path,
        input.cell_index?.toString(),
        undefined,
        toolId
    );
    
    console.log("📓 Agent Notebook Read:", {
        toolId,
        notebookPath: input.path || input.notebook_path,
        cellIndex: input.cell_index,
        explanation: input.explanation
    });
};

export const agentNotebookEditNotification = (toolId: string, input: any) => {
    // Use FileEditRequestNotify for notebooks (treating as file edit)
    codebolt.notify.fs.FileEditRequestNotify(
        (input.path || input.notebook_path)?.split('/').pop() || 'notebook',
        input.path || input.notebook_path,
        input.content || '',
        toolId
    );
    
    console.log("📓 Agent Notebook Edit:", {
        toolId,
        notebookPath: input.path || input.notebook_path,
        cellIndex: input.cell_index,
        content: input.content ? `${input.content.substring(0, 100)}...` : undefined,
        cellType: input.cell_type
    });
};

// Task completion notification
export const sendTaskCompletion = (result: string, duration: number, apiDuration: number, turns: number, cost: number, usage: any) => {
    // Use CodeboltJS AgentCompletionNotify
    codebolt.notify.system.AgentCompletionNotify(
        result,
        undefined, // sessionId
        `${duration}ms`
    );
    
    console.log("✅ Task Completion:", {
        result,
        duration: `${duration}ms`,
        apiDuration: `${apiDuration}ms`,
        turns,
        cost: `$${cost.toFixed(4)}`,
        usage
    });
};

// System initialization notification
export const sendSystemInitNotification = (apiKeySource: string, cwd: string, tools: string[], mcpServers: any[], model: string, permissionMode: string) => {
    // Use CodeboltJS AgentInitNotify
    codebolt.notify.system.AgentInitNotify();
    
    console.log("⚙️ System Initialization:", {
        apiKeySource,
        cwd,
        tools,
        mcpServers,
        model,
        permissionMode
    });
};

// Error notifications
export const sendMaxTurnsErrorNotification = (turns: number, duration: number, cost: number) => {
    // Use CodeboltJS AgentCompletionNotify with error indication
    codebolt.notify.system.AgentCompletionNotify(
        `Max turns error after ${turns} turns`,
        undefined, // sessionId
        `${duration}ms`
    );
    
    console.log("⚠️ Max Turns Error:", {
        turns,
        duration: `${duration}ms`,
        cost: `$${cost.toFixed(4)}`
    });
};

export const sendExecutionErrorNotification = (turns: number, duration: number, cost: number) => {
    // Use CodeboltJS AgentCompletionNotify with error indication
    codebolt.notify.system.AgentCompletionNotify(
        `Execution error after ${turns} turns`,
        undefined, // sessionId
        `${duration}ms`
    );
    
    console.log("❌ Execution Error:", {
        turns,
        duration: `${duration}ms`,
        cost: `$${cost.toFixed(4)}`
    });
};

// Custom tool notification
export const agentCustomToolNotification = (toolName: string, toolId: string, input: any) => {
    // For custom tools, we'll use the general AgentTextResponseNotify
    codebolt.notify.chat.AgentTextResponseNotify(`Custom tool executed: ${toolName}`);
    
    console.log("🔧 Agent Custom Tool:", {
        toolName,
        toolId,
        input
    });
};

// Tool Result Notifications
export const todoModificationResultNotification = (toolUseId: string, content: string | any[], isError: boolean) => {
    // Use CodeboltJS AddTodoResponseNotify
    codebolt.notify.todo.AddTodoResponseNotify(
        content,
        isError,
        toolUseId
    );
    
    console.log("✅ Todo Modification Result:", {
        toolUseId,
        isError,
        content: typeof content === 'string' ? content : JSON.stringify(content, null, 2)
    });
};

export const fileListResultNotification = (toolUseId: string, content: string | any[], isError: boolean) => {
    // Use CodeboltJS ListDirectoryResponseNotify
    codebolt.notify.fs.ListDirectoryResponseNotify(
        content,
        isError,
        toolUseId
    );
    
    console.log("📁 File List Result:", {
        toolUseId,
        isError,
        content: typeof content === 'string' ? content : JSON.stringify(content, null, 2)
    });
};

export const fileReadResultNotification = (toolUseId: string, content: string | any[], isError: boolean) => {
    // Use CodeboltJS FileReadResponseNotify
    codebolt.notify.fs.FileReadResponseNotify(
        content,
        isError,
        toolUseId
    );
    
    console.log("📖 File Read Result:", {
        toolUseId,
        isError,
        content: typeof content === 'string' ? 
            (content.length > 200 ? `${content.substring(0, 200)}...` : content) : 
            JSON.stringify(content, null, 2)
    });
};

export const bashCommandResultNotification = (toolUseId: string, content: string | any[], isError: boolean) => {
    // Use CodeboltJS CommandExecutionResponseNotify
    codebolt.notify.terminal.CommandExecutionResponseNotify(
        content,
        isError,
        toolUseId
    );
    
    console.log("⚡ Bash Command Result:", {
        toolUseId,
        isError,
        content: typeof content === 'string' ? content : JSON.stringify(content, null, 2)
    });
};

export const fileEditResultNotification = (toolUseId: string, content: string | any[], isError: boolean) => {
    // Use CodeboltJS FileEditResponseNotify
    codebolt.notify.fs.FileEditResponseNotify(
        content,
        isError,
        toolUseId
    );
    
    console.log("✏️ File Edit Result:", {
        toolUseId,
        isError,
        content: typeof content === 'string' ? content : JSON.stringify(content, null, 2)
    });
};

export const grepResultNotification = (toolUseId: string, content: string | any[], isError: boolean) => {
    // Use CodeboltJS GrepSearchResponseNotify
    codebolt.notify.codeutils.GrepSearchResponseNotify(
        content,
        isError,
        toolUseId
    );
    
    console.log("🔍 Grep Result:", {
        toolUseId,
        isError,
        content: typeof content === 'string' ? content : JSON.stringify(content, null, 2)
    });
};

export const taskResultNotification = (toolUseId: string, content: string | any[], isError: boolean) => {
    // Use CodeboltJS AddTodoResponseNotify
    codebolt.notify.todo.AddTodoResponseNotify(
        content,
        isError,
        toolUseId
    );
    
    console.log("📋 Task Result:", {
        toolUseId,
        isError,
        content: typeof content === 'string' ? content : JSON.stringify(content, null, 2)
    });
};

export const globResultNotification = (toolUseId: string, content: string | any[], isError: boolean) => {
    // Use CodeboltJS GlobSearchResponseNotify
    codebolt.notify.codeutils.GlobSearchResponseNotify(
        content,
        isError,
        toolUseId
    );
    
    console.log("🌐 Glob Result:", {
        toolUseId,
        isError,
        content: typeof content === 'string' ? content : JSON.stringify(content, null, 2)
    });
};

export const fileMultiEditResultNotification = (toolUseId: string, content: string | any[], isError: boolean) => {
    // Use CodeboltJS FileEditResponseNotify for multi-edit results
    codebolt.notify.fs.FileEditResponseNotify(
        content,
        isError,
        toolUseId
    );
    
    console.log("✏️ Multi Edit Result:", {
        toolUseId,
        isError,
        content: typeof content === 'string' ? content : JSON.stringify(content, null, 2)
    });
};

export const webFetchResultNotification = (toolUseId: string, content: string | any[], isError: boolean) => {
    // Use CodeboltJS WebFetchResponseNotify
    codebolt.notify.browser.WebFetchResponseNotify(
        content,
        isError,
        toolUseId
    );
    
    console.log("🌐 Web Fetch Result:", {
        toolUseId,
        isError,
        content: typeof content === 'string' ? 
            (content.length > 300 ? `${content.substring(0, 300)}...` : content) : 
            JSON.stringify(content, null, 2)
    });
};

export const webSearchResultNotification = (toolUseId: string, content: string | any[], isError: boolean) => {
    // Use CodeboltJS WebSearchResponseNotify
    codebolt.notify.browser.WebSearchResponseNotify(
        content,
        isError,
        toolUseId
    );
    
    console.log("🔍 Web Search Result:", {
        toolUseId,
        isError,
        content: typeof content === 'string' ? content : JSON.stringify(content, null, 2)
    });
};

export const notebookReadResultNotification = (toolUseId: string, content: string | any[], isError: boolean) => {
    // Use CodeboltJS FileReadResponseNotify for notebook reads
    codebolt.notify.fs.FileReadResponseNotify(
        content,
        isError,
        toolUseId
    );
    
    console.log("📓 Notebook Read Result:", {
        toolUseId,
        isError,
        content: typeof content === 'string' ? 
            (content.length > 200 ? `${content.substring(0, 200)}...` : content) : 
            JSON.stringify(content, null, 2)
    });
};

export const notebookEditResultNotification = (toolUseId: string, content: string | any[], isError: boolean) => {
    // Use CodeboltJS FileEditResponseNotify for notebook edits
    codebolt.notify.fs.FileEditResponseNotify(
        content,
        isError,
        toolUseId
    );
    
    console.log("📓 Notebook Edit Result:", {
        toolUseId,
        isError,
        content: typeof content === 'string' ? content : JSON.stringify(content, null, 2)
    });
};

export const genericToolResultNotification = (toolUseId: string, content: string | any[], isError: boolean) => {
    // Use CodeboltJS AgentTextResponseNotify for generic tool results
    codebolt.notify.chat.AgentTextResponseNotify(
        typeof content === 'string' ? content : JSON.stringify(content)
    );
    
    console.log("🔧 Generic Tool Result:", {
        toolUseId,
        isError,
        content: typeof content === 'string' ? content : JSON.stringify(content, null, 2)
    });
};