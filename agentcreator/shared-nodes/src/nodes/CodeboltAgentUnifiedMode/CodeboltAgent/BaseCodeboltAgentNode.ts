import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { DATA_TYPES, ARRAY_TYPES } from '../../../types/DataTypes';
import { NodeMetadata } from '../../../types';

/**
 * CodeboltAgent Node - High-level agent that processes incoming messages
 * through configurable processors and executes the agent loop
 * 
 * Flow: OnMessageNode -> CodeboltAgentNode -> outputs
 */
export class BaseCodeboltAgentNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "unified/agent/codebolt-agent",
        title: "Codebolt Agent",
        category: "unified/agent",
        description: "Processes user messages through configurable processors and executes the complete agent loop",
        icon: "🚀",
        color: "#4CAF50"
    };

    constructor() {
        super(BaseCodeboltAgentNode.metadata.title, BaseCodeboltAgentNode.metadata.type);
        this.title = BaseCodeboltAgentNode.metadata.title;
        this.size = [320, 260];

        // Trigger input - receives trigger from OnMessageNode
        this.addInput("onMessage", LiteGraph.ACTION);

        // Input for the user message (from OnMessageNode)
        this.addInput("message", "object", {
            extra_info: {
                dataType: DATA_TYPES.FLAT_USER_MESSAGE,
                description: "User message to process (from OnMessageNode)"
            }
        } as any);

        // Input for message modifiers (array of MessageModifier)
        this.addInput("messageModifiers", "array", {
            extra_info: {
                arrayType: ARRAY_TYPES.MESSAGE_MODIFIER,
                description: "Array of message modifiers for prompt processing"
            }
        } as any);

        // Input for pre-inference processors
        this.addInput("preInferenceProcessors", "array", {
            extra_info: {
                arrayType: ARRAY_TYPES.PRE_INFERENCE_PROCESSOR,
                description: "Array of pre-inference processors"
            }
        } as any);

        // Input for post-inference processors
        this.addInput("postInferenceProcessors", "array", {
            extra_info: {
                arrayType: ARRAY_TYPES.POST_INFERENCE_PROCESSOR,
                description: "Array of post-inference processors"
            }
        } as any);

        // Input for pre-tool-call processors
        this.addInput("preToolCallProcessors", "array", {
            extra_info: {
                arrayType: 'preToolCallProcessor',
                description: "Array of pre-tool-call processors"
            }
        } as any);

        // Input for post-tool-call processors
        this.addInput("postToolCallProcessors", "array", {
            extra_info: {
                arrayType: 'postToolCallProcessor',
                description: "Array of post-tool-call processors"
            }
        } as any);

        // Event outputs
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("onError", LiteGraph.EVENT);

        // Data outputs
        this.addOutput("result", "object", {
            extra_info: {
                dataType: DATA_TYPES.AGENT_EXECUTION_RESULT,
                description: "Result of the message processing"
            }
        } as any);
        this.addOutput("success", "boolean");
        this.addOutput("error", "string");

        // Agent configuration properties
        this.properties = {
            agentName: "CodeboltAgent",
            instructions: "You are an AI coding assistant.",
            enableLogging: true
        };

        // Add widgets for configuration
        this.addWidget("text", "name", this.properties.agentName as string, "agentName");
        this.addWidget("text", "instructions", this.properties.instructions as string, "instructions");
        this.addWidget("toggle", "enable logging", this.properties.enableLogging as boolean, "enableLogging");
    }

    // Enable ON_TRIGGER mode so onExecute only runs when triggered
    mode = LiteGraph.ON_TRIGGER;
}
