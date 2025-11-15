// Export all base node classes
export * from './BaseCodeboltApis';
export * from './Math';
export * from './Logical';
export * from './Constants';
export * from './CodeboltAgentApis';

export { BaseSumNode } from './BaseSumNode.js';
export { BaseTimeNode } from './BaseTimeNode.js';
export { BaseConstantNumberNode, BaseConstantStringNode, BaseConstantBooleanNode, BaseConstNode } from './Constants';
export { BaseConverterNode } from './BaseConverterNode.js';
export { BaseAndNode } from './BaseAndNode.js';
export { BaseConcatenateNode } from './BaseConcatenateNode.js';

export {
  BaseToStringNode,
  BaseCompareNode,
  BaseToUpperCaseNode,
  BaseContainsNode
} from './BaseStringNodes.js';

// Export BaseMarkdownNode
export { BaseMarkdownNode } from './BaseMarkdownNode.js';

// Export AI Agent base nodes
export { BaseUserMessageNode } from './BaseUserMessageNode.js';
export { BaseSystemPromptNode } from './BaseSystemPromptNode.js';
export { BaseTaskInstructionNode } from './BaseTaskInstructionNode.js';
export { BaseMCPToolsNode } from './BaseMCPToolsNode.js';


// Metadata registry for shared node information
export const nodeMetadata = {
  'basic/const': {
    type: 'basic/const',
    title: 'Const',
    category: 'basic',
    description: 'Outputs a constant value',
    icon: 'C',
    color: '#4CAF50'
  },
  'basic/sum': {
    type: 'basic/sum',
    title: 'Sum',
    category: 'basic',
    description: 'Adds two numbers together',
    icon: 'Σ',
    color: '#2196F3'
  },
  'basic/time': {
    type: 'basic/time',
    title: 'Time',
    category: 'basic',
    description: 'Current time in ms and seconds',
    icon: '⏰',
    color: '#FFC107'
  },
  'basic/const_number': {
    type: 'basic/const_number',
    title: 'Const Number',
    category: 'basic',
    description: 'Constant number with widget',
    icon: '#',
    color: '#FF9800'
  },
  'math/bypass': {
    type: 'math/bypass',
    title: 'Bypass',
    category: 'math',
    description: 'Removes the type',
    icon: '→',
    color: '#9C27B0'
  },
  'math/to_number': {
    type: 'math/to_number',
    title: 'To Number',
    category: 'math',
    description: 'Cast to number',
    icon: '#',
    color: '#607D8B'
  },
  'math/rand': {
    type: 'math/rand',
    title: 'Random',
    category: 'math',
    description: 'Random number',
    icon: '?',
    color: '#E91E63'
  },
  'math/abs': {
    type: 'math/abs',
    title: 'Abs',
    category: 'math',
    description: 'Absolute value',
    icon: '|x|',
    color: '#E91E63'
  },
  'math/clamp': {
    type: 'math/clamp',
    title: 'Clamp',
    category: 'math',
    description: 'Clamp number between min and max',
    icon: '⬓',
    color: '#E91E63'
  },
  'logic/OR': {
    type: 'logic/OR',
    title: 'OR',
    category: 'logic',
    description: 'Logical OR',
    icon: '∨',
    color: '#FF5722'
  },
  'logic/NOT': {
    type: 'logic/NOT',
    title: 'NOT',
    category: 'logic',
    description: 'Logical NOT',
    icon: '¬',
    color: '#FF5722'
  },
  'logic/selector': {
    type: 'logic/selector',
    title: 'Selector',
    category: 'logic',
    description: 'Selects an output',
    icon: '⊞',
    color: '#00BCD4'
  },
  'string/toString': {
    type: 'string/toString',
    title: 'to String',
    category: 'string',
    description: 'Convert to string',
    icon: 'S',
    color: '#9E9E9E'
  },
  'string/compare': {
    type: 'string/compare',
    title: 'Compare',
    category: 'string',
    description: 'Compare two strings',
    icon: '==',
    color: '#9E9E9E'
  },
  'string/toUpperCase': {
    type: 'string/toUpperCase',
    title: 'to UpperCase',
    category: 'string',
    description: 'Convert to uppercase',
    icon: '↑',
    color: '#9E9E9E'
  },
  'string/contains': {
    type: 'string/contains',
    title: 'Contains',
    category: 'string',
    description: 'Check if contains substring',
    icon: '∈',
    color: '#9E9E9E'
  },
  'widget/markdown': {
    type: 'widget/markdown',
    title: 'Markdown',
    category: 'widget',
    description: 'Display markdown-formatted text',
    icon: '📝',
    color: '#9C27B0'
  },
  // Event nodes metadata
  'events/onmessage': {
    type: 'events/onmessage',
    title: 'OnMessage',
    category: 'events',
    description: 'Entry point that waits for incoming messages and triggers agent flow',
    icon: '📨',
    color: '#FF5722'
  },
  // Codebolt nodes metadata
  'codebolt/chat/sendmessage': {
    type: 'codebolt/chat/sendmessage',
    title: 'Send Message',
    category: 'codebolt',
    description: 'Sends a message using codebolt.chat.sendMessage',
    icon: '💬',
    color: '#2196F3'
  },
  // AI Agent nodes metadata
  'agent/user_message': {
    type: 'agent/user_message',
    title: 'User Message',
    category: 'agent',
    description: 'Creates a UserMessage object from request message',
    icon: '💬',
    color: '#2196F3'
  },
  'agent/system_prompt': {
    type: 'agent/system_prompt',
    title: 'System Prompt',
    category: 'agent',
    description: 'Creates a SystemPrompt from markdown content',
    icon: '📋',
    color: '#4CAF50'
  },
  'agent/task_instruction': {
    type: 'agent/task_instruction',
    title: 'Task Instruction',
    category: 'agent',
    description: 'Creates a TaskInstruction with tools and user message',
    icon: '📝',
    color: '#FF9800'
  },
  'agent/mcp_tools': {
    type: 'agent/mcp_tools',
    title: 'MCP Tools',
    category: 'agent',
    description: 'Fetches available tools from MCP servers',
    icon: '🔧',
    color: '#9C27B0'
  },
  'agent/agent': {
    type: 'agent/agent',
    title: 'Agent',
    category: 'agent',
    description: 'Creates an Agent with tools and system prompt',
    icon: '🤖',
    color: '#E91E63'
  },
  'agent/agent_run': {
    type: 'agent/agent_run',
    title: 'Agent Run',
    category: 'agent',
    description: 'Executes an agent with a task instruction',
    icon: '▶️',
    color: '#4CAF50'
  }
};

// Utility function to register node types with metadata
export function registerNodeWithMetadata(LiteGraph, NodeClass, metadata) {
  if (!metadata || !metadata.type) {
    console.error('Invalid metadata provided for node:', NodeClass.name, metadata);
    return;
  }
  LiteGraph.registerNodeType(metadata.type, NodeClass);
  NodeClass.title = metadata.title;
  NodeClass.category = metadata.category;
}