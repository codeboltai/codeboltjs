import { ProxyConfig } from '../types/config';

export const profiles = {
    defaultTUIProfile: {
        // File system operations - local for TUI
        "fsEvent": {
            'proxyType': 'local'
        },
        // LLM inference - proxy to cloud for TUI
        "inference": {
            'proxyType': 'proxy',
            'primaryProxy': 'cloud'
        },
        // Git operations - local for TUI
        "gitEvent": {
            'proxyType': 'local'
        },
        // Browser operations - proxy for TUI
        "browserEvent": {
            'proxyType': 'proxy',
            'primaryProxy': 'cloud'
        },
        // Crawler operations - proxy for TUI
        "crawlerEvent": {
            'proxyType': 'proxy',
            'primaryProxy': 'cloud'
        },
        // Terminal operations - local for TUI
        "terminalEvent": {
            'proxyType': 'proxy'
        },
        // Project/Settings operations - local for TUI
        "projectEvent": {
            'proxyType': 'local'
        },
        // Memory operations - proxy for TUI
        "memoryEvent": {
            'proxyType': 'proxy',
            'primaryProxy': 'cloud'
        },
        // Codebase search - local for TUI
        "codebaseSearchEvent": {
            'proxyType': 'local'
        },
        // Execute tool - local for TUI
        "executeToolEvent": {
            'proxyType': 'local'
        },
        // Vector DB operations - proxy for TUI
        "vectordbEvent": {
            'proxyType': 'proxy',
            'primaryProxy': 'cloud'
        },
        // State operations - local for TUI
        "agentStateEvent": {
            'proxyType': 'proxy'
        },
        // Code utilities - local for TUI
        "codeEvent": {
            'proxyType': 'proxy'
        },
        "codeUtilsEvent": {
            'proxyType': 'proxy'
        },
        // TreeSitter parsing - local for TUI
        "treeSitterEvent": {
            'proxyType': 'local'
        },
        // Tokenizer - local for TUI
        "tokenizerEvent": {
            'proxyType': 'local'
        },
        // Debug operations - local for TUI
        "debugEvent": {
            'proxyType': 'local'
        },
        // Chat operations - proxy for TUI
        "getChatHistory": {
            'proxyType': 'proxy',
            'primaryProxy': 'cloud'
        },
        "sendMessage": {
            'proxyType': 'proxy',
            'primaryProxy': 'cloud'
        },
        // MCP/CodeBolt tools - local for TUI
        "codebolttools": {
            'proxyType': 'local'
        },
        // Agent operations - proxy for TUI
        "agentEvent": {
            'proxyType': 'proxy',
            'primaryProxy': 'cloud'
        },
        // Task operations - proxy for TUI
        "taskEvent": {
            'proxyType': 'proxy',
            'primaryProxy': 'cloud'
        },
        // Thread operations - proxy for TUI
        "threadEvent": {
            'proxyType': 'proxy',
            'primaryProxy': 'cloud'
        },
        // Job operations - ALWAYS proxy (never local)
        // Jobs require persistent storage and can be routed to cloud or app
        "jobEvent": {
            'proxyType': 'proxy',
            'primaryProxy': 'cloud'  // Can also be set to 'app' if app handles jobs
        },
        // Todo operations - local for TUI
        "todoEvent": {
            'proxyType': 'proxy',
        },
        // Hook operations - local for TUI
        "hookEvent": {
            'proxyType': 'proxy'
        },
        // Swarm operations - proxy for TUI
        "swarmEvent": {
            'proxyType': 'proxy',
            'primaryProxy': 'cloud'
        },
        // Problem match operations - local for TUI
        "problemMatchEvent": {
            'proxyType': 'proxy'
        },
        // Action plan operations - proxy for TUI
        "actionPlanEvent": {
            'proxyType': 'proxy',
            'primaryProxy': 'cloud'
        },
        // Notification operations - proxy for TUI
        "notificationEvent": {
            'proxyType': 'proxy',
            'primaryProxy': 'cloud'
        },
        // Chat summary operations - proxy for TUI
        "chatSummaryEvent": {
            'proxyType': 'proxy',
            'primaryProxy': 'cloud'
        },
        // ActionBlock operations - local execution
        "actionBlock": {
            'proxyType': 'local'
        }
    } as ProxyConfig,

    defaultNON_TUIProfile: {
        // File system operations - proxy for non-TUI (remote environment)
        "fsEvent": {
            'proxyType': 'local'
        },
        // LLM inference - proxy to app for non-TUI
        "inference": {
            'proxyType': 'proxy',
            'primaryProxy': 'app'
        },
        // Git operations - local (run in remote environment)
        "gitEvent": {
            'proxyType': 'proxy'
        },
        // Browser operations - proxy for non-TUI
        "browserEvent": {
            'proxyType': 'proxy',
            'primaryProxy': 'app'
        },
        // Crawler operations - proxy for non-TUI
        "crawlerEvent": {
            'proxyType': 'proxy',
            'primaryProxy': 'app'
        },
        // Terminal operations - local for non-TUI
        "terminalEvent": {
            'proxyType': 'proxy'
        },
        // Project/Settings operations - proxy for non-TUI
        "projectEvent": {
            'proxyType': 'proxy',
            'primaryProxy': 'app'
        },
        // Memory operations - proxy for non-TUI
        "memoryEvent": {
            'proxyType': 'proxy',
            'primaryProxy': 'app'
        },
        // Codebase search - local for non-TUI
        "codebaseSearchEvent": {
            'proxyType': 'proxy'
        },
        // Execute tool - proxy for non-TUI
        "executeToolEvent": {
            'proxyType': 'proxy',
            'primaryProxy': 'app'
        },
        // Vector DB operations - proxy for non-TUI
        "vectordbEvent": {
            'proxyType': 'proxy',
            'primaryProxy': 'app'
        },
        // State operations - proxy for non-TUI
        "agentStateEvent": {
            'proxyType': 'proxy',
            'primaryProxy': 'app'
        },
        // Code utilities - local for non-TUI
        "codeEvent": {
            'proxyType': 'proxy'
        },
        "codeUtilsEvent": {
            'proxyType': 'proxy'
        },
        // TreeSitter parsing - local for non-TUI
        "treeSitterEvent": {
            'proxyType': 'proxy'
        },
        // Tokenizer - local for non-TUI
        "tokenizerEvent": {
            'proxyType': 'proxy'
        },
        // Debug operations - proxy for non-TUI
        "debugEvent": {
            'proxyType': 'proxy',
            'primaryProxy': 'app'
        },
        // Chat operations - proxy for non-TUI
        "getChatHistory": {
            'proxyType': 'proxy',
            'primaryProxy': 'app'
        },
        "sendMessage": {
            'proxyType': 'proxy',
            'primaryProxy': 'app'
        },
        // MCP/CodeBolt tools - proxy for non-TUI
        "codebolttools": {
            'proxyType': 'proxy',
            'primaryProxy': 'app'
        },
        // Agent operations - proxy for non-TUI
        "agentEvent": {
            'proxyType': 'proxy',
            'primaryProxy': 'app'
        },
        // Task operations - proxy for non-TUI
        "taskEvent": {
            'proxyType': 'proxy',
            'primaryProxy': 'app'
        },
        // Thread operations - proxy for non-TUI
        "threadEvent": {
            'proxyType': 'proxy',
            'primaryProxy': 'app'
        },
        // Job operations - ALWAYS proxy (never local)
        // Jobs require persistent storage and can be routed to cloud or app
        "jobEvent": {
            'proxyType': 'proxy',
            'primaryProxy': 'app'  // Routes to app; can also be 'cloud' for cloud-based job storage
        },
        // Todo operations - proxy for non-TUI
        "todoEvent": {
            'proxyType': 'proxy',
            'primaryProxy': 'app'
        },
        // Hook operations - proxy for non-TUI
        "hookEvent": {
            'proxyType': 'proxy',
            'primaryProxy': 'app'
        },
        // Swarm operations - proxy for non-TUI
        "swarmEvent": {
            'proxyType': 'proxy',
            'primaryProxy': 'app'
        },
        // Problem match operations - local for non-TUI
        "problemMatchEvent": {
            'proxyType': 'proxy'
        },
        // Action plan operations - proxy for non-TUI
        "actionPlanEvent": {
            'proxyType': 'proxy',
            'primaryProxy': 'app'
        },
        // Notification operations - proxy for non-TUI
        "notificationEvent": {
            'proxyType': 'proxy',
            'primaryProxy': 'app'
        },
        // Chat summary operations - proxy for non-TUI
        "chatSummaryEvent": {
            'proxyType': 'proxy',
            'primaryProxy': 'app'
        },
        // ActionBlock operations - local execution
        "actionBlock": {
            'proxyType': 'local'
        }
    } as ProxyConfig
};

/**
 * Get the default proxy configuration based on UI mode
 * @param noui - Whether the server is running in no-UI mode
 * @returns ProxyConfig for the appropriate profile
 */
export function getDefaultProxyConfig(noui: boolean = false): ProxyConfig {
    return noui ? profiles.defaultNON_TUIProfile : profiles.defaultTUIProfile;
}