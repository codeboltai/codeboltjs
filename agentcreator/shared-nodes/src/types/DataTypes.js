/**
 * Custom data types for LiteGraph node connections
 * Used for type validation in extra_info metadata
 */
// Custom data types for the system
export const DATA_TYPES = {
    // Message types
    FLAT_USER_MESSAGE: 'FlatUserMessage',
    // File and path types
    FILE_PATH: 'filePath',
    FULL_PATH: 'fullPath',
    FOLDER_PATH: 'folderPath',
    IMAGE_PATH: 'imagePath',
    CONTROL_FILE: 'controlFile',
    // Agent and action types
    SELECTED_AGENT: 'selectedAgent',
    AGENT: 'agent',
    ACTION: 'action',
    // Selection types
    SELECTION: 'selection',
    // Document and link types
    DOCUMENT: 'document',
    LINK: 'link',
    MULTI_FILE: 'multiFile',
    // Server types
    MCP_SERVER: 'mcpServer',
    // ID types
    MESSAGE_ID: 'messageId',
    THREAD_ID: 'threadId',
    TEMPLATE_TYPE: 'templateType',
    PROCESS_ID: 'processId',
    // Configuration types
    REMIX_PROMPT: 'remixPrompt'
};
// Array type definitions (used in extra_info.arrayType)
export const ARRAY_TYPES = {
    FILE_PATH: 'filePath',
    FULL_PATH: 'fullPath',
    FOLDER_PATH: 'folderPath',
    IMAGE_PATH: 'imagePath',
    CONTROL_FILE: 'controlFile',
    MCP_SERVER: 'mcpServer',
    ACTION: 'action',
    AGENT: 'agent',
    DOCUMENT: 'document',
    LINK: 'link',
    MULTI_FILE: 'multiFile',
    OPENED_FILE: 'filePath' // For openedFiles array
};
// Utility functions for type validation
export function isCustomDataType(type) {
    return Object.values(DATA_TYPES).includes(type);
}
export function isArrayType(type) {
    return Object.values(ARRAY_TYPES).includes(type);
}
export function getDataTypeDescription(dataType) {
    const descriptions = {
        [DATA_TYPES.FLAT_USER_MESSAGE]: 'Complete user message object with all properties',
        [DATA_TYPES.FILE_PATH]: 'Path to a file',
        [DATA_TYPES.FULL_PATH]: 'Full path to a file or resource',
        [DATA_TYPES.FOLDER_PATH]: 'Path to a folder',
        [DATA_TYPES.IMAGE_PATH]: 'Path or URL to an image',
        [DATA_TYPES.SELECTED_AGENT]: 'Selected agent information with id, name, type',
        [DATA_TYPES.AGENT]: 'Agent object with configuration',
        [DATA_TYPES.ACTION]: 'Action object representing a user action',
        [DATA_TYPES.SELECTION]: 'Selection object with ranges and selected text',
        [DATA_TYPES.MCP_SERVER]: 'MCP server configuration object',
        [DATA_TYPES.MESSAGE_ID]: 'Unique message identifier',
        [DATA_TYPES.THREAD_ID]: 'Conversation thread identifier',
        [DATA_TYPES.TEMPLATE_TYPE]: 'Template type identifier',
        [DATA_TYPES.PROCESS_ID]: 'Process identifier',
        [DATA_TYPES.REMIX_PROMPT]: 'Remix prompt configuration object'
    };
    return descriptions[dataType] || `Custom data type: ${dataType}`;
}
