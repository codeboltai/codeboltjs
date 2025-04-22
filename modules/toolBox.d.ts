/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ClientCapabilities, CreateMessageRequestSchema, Root } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { StrictEventEmitter } from "strict-event-emitter-types";
import { EventEmitter } from "events";
import { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import http from "http";
/**
 * Type definition for SSE Server that can be closed.
 */
export type SSEServer = {
    close: () => Promise<void>;
};
/**
 * Event types for the FastMCP event emitter.
 */
type FastMCPEvents<T extends FastMCPSessionAuth> = {
    connect: (event: {
        session: FastMCPSession<T>;
    }) => void;
    disconnect: (event: {
        session: FastMCPSession<T>;
    }) => void;
};
/**
 * Event types for FastMCPSession event emitter.
 */
type FastMCPSessionEvents = {
    rootsChanged: (event: {
        roots: Root[];
    }) => void;
    error: (event: {
        error: Error;
    }) => void;
};
/**
 * Generates an image content object from a URL, file path, or buffer.
 *
 * @param input - The input source for the image (URL, file path, or buffer)
 * @returns Promise with the image content object
 */
export declare const imageContent: (input: {
    url: string;
} | {
    path: string;
} | {
    buffer: Buffer;
}) => Promise<ImageContent>;
/**
 * Base class for FastMCP errors.
 */
declare abstract class FastMCPError extends Error {
    constructor(message?: string);
}
/**
 * Type for extra data in errors.
 */
type Extra = unknown;
/**
 * Type for a record of extra data.
 */
type Extras = Record<string, Extra>;
/**
 * Error class for unexpected state conditions.
 */
export declare class UnexpectedStateError extends FastMCPError {
    /** Additional context for the error */
    extras?: Extras;
    /**
     * Creates a new UnexpectedStateError.
     *
     * @param message - Error message
     * @param extras - Additional context for the error
     */
    constructor(message: string, extras?: Extras);
}
/**
 * Error that is meant to be surfaced to the user.
 */
export declare class UserError extends UnexpectedStateError {
}
/**
 * Type for tool parameters schema.
 */
type ToolParameters = z.ZodTypeAny;
/**
 * Type for literal values.
 */
type Literal = boolean | null | number | string | undefined;
/**
 * Type for serializable values that can be passed around.
 */
type SerializableValue = Literal | SerializableValue[] | {
    [key: string]: SerializableValue;
};
/**
 * Type for reporting progress of operations.
 */
type Progress = {
    /**
     * The progress thus far. This should increase every time progress is made, even if the total is unknown.
     */
    progress: number;
    /**
     * Total number of items to process (or total progress required), if known.
     */
    total?: number;
};
/**
 * Context object passed to tool execution functions.
 */
type Context<T extends FastMCPSessionAuth> = {
    /** The session authentication context */
    session: T | undefined;
    /** Function to report progress of operations */
    reportProgress: (progress: Progress) => Promise<void>;
    /** Logging functions */
    log: {
        debug: (message: string, data?: SerializableValue) => void;
        error: (message: string, data?: SerializableValue) => void;
        info: (message: string, data?: SerializableValue) => void;
        warn: (message: string, data?: SerializableValue) => void;
    };
};
/**
 * Type for text content in messages.
 */
type TextContent = {
    /** Always "text" for text content */
    type: "text";
    /** The text content */
    text: string;
};
/**
 * Type for image content in messages.
 */
type ImageContent = {
    /** Always "image" for image content */
    type: "image";
    /** Base64-encoded image data */
    data: string;
    /** The MIME type of the image */
    mimeType: string;
};
/**
 * Union type for content in messages.
 */
type Content = TextContent | ImageContent;
/**
 * Type for content results from tool executions.
 */
type ContentResult = {
    /** Array of content blocks */
    content: Content[];
    /** Whether this result represents an error */
    isError?: boolean;
};
/**
 * Type for completion results.
 */
type Completion = {
    /** Array of completion values */
    values: string[];
    /** The total number of completions available */
    total?: number;
    /** Whether there are more completions available */
    hasMore?: boolean;
};
/**
 * Type for a tool that can be executed.
 */
type Tool<T extends FastMCPSessionAuth, Params extends ToolParameters = ToolParameters> = {
    /** Name of the tool */
    name: string;
    /** Optional description of the tool's functionality */
    description?: string;
    /** Optional parameters schema for the tool */
    parameters?: Params;
    /** Function to execute the tool */
    execute: (args: z.infer<Params>, context: Context<T>) => Promise<string | ContentResult | TextContent | ImageContent>;
};
/**
 * Type for resource results.
 */
type ResourceResult = {
    text: string;
} | {
    blob: string;
};
/**
 * Type for input resource template arguments.
 */
type InputResourceTemplateArgument = Readonly<{
    name: string;
    description?: string;
    complete?: ArgumentValueCompleter;
}>;
/**
 * Type for resource template arguments.
 */
type ResourceTemplateArgument = Readonly<{
    name: string;
    description?: string;
    complete?: ArgumentValueCompleter;
}>;
/**
 * Type transformation from argument array to object.
 */
type ResourceTemplateArgumentsToObject<T extends {
    name: string;
}[]> = {
    [K in T[number]["name"]]: string;
};
/**
 * Type for input resource templates.
 */
type InputResourceTemplate<Arguments extends ResourceTemplateArgument[] = ResourceTemplateArgument[]> = {
    /** URI template for the resource */
    uriTemplate: string;
    /** Name of the template */
    name: string;
    /** Optional description */
    description?: string;
    /** Optional MIME type */
    mimeType?: string;
    /** Arguments for the template */
    arguments: Arguments;
    /** Function to load the resource */
    load: (args: ResourceTemplateArgumentsToObject<Arguments>) => Promise<ResourceResult>;
};
/**
 * Type for a resource.
 */
type Resource = {
    /** URI of the resource */
    uri: string;
    /** Name of the resource */
    name: string;
    /** Optional description */
    description?: string;
    /** Optional MIME type */
    mimeType?: string;
    /** Function to load the resource */
    load: () => Promise<ResourceResult | ResourceResult[]>;
    /** Optional completion function */
    complete?: (name: string, value: string) => Promise<Completion>;
};
/**
 * Type for argument value completion.
 */
type ArgumentValueCompleter = (value: string) => Promise<Completion>;
/**
 * Type for input prompt arguments.
 */
type InputPromptArgument = Readonly<{
    /** Name of the argument */
    name: string;
    /** Optional description */
    description?: string;
    /** Whether the argument is required */
    required?: boolean;
    /** Optional completion function */
    complete?: ArgumentValueCompleter;
    /** Optional enum of possible values */
    enum?: string[];
}>;
/**
 * Type transformation from prompt arguments to object.
 */
type PromptArgumentsToObject<T extends {
    name: string;
    required?: boolean;
}[]> = {
    [K in T[number]["name"]]: Extract<T[number], {
        name: K;
    }>["required"] extends true ? string : string | undefined;
};
/**
 * Type for input prompts.
 */
type InputPrompt<Arguments extends InputPromptArgument[] = InputPromptArgument[], Args = PromptArgumentsToObject<Arguments>> = {
    /** Name of the prompt */
    name: string;
    /** Optional description */
    description?: string;
    /** Optional arguments */
    arguments?: InputPromptArgument[];
    /** Function to load the prompt */
    load: (args: Args) => Promise<string>;
};
/**
 * Type for prompt arguments.
 */
type PromptArgument = Readonly<{
    /** Name of the argument */
    name: string;
    /** Optional description */
    description?: string;
    /** Whether the argument is required */
    required?: boolean;
    /** Optional completion function */
    complete?: ArgumentValueCompleter;
    /** Optional enum of possible values */
    enum?: string[];
}>;
/**
 * Type for prompts.
 */
type Prompt<Arguments extends PromptArgument[] = PromptArgument[], Args = PromptArgumentsToObject<Arguments>> = {
    /** Optional arguments */
    arguments?: PromptArgument[];
    /** Optional completion function */
    complete?: (name: string, value: string) => Promise<Completion>;
    /** Optional description */
    description?: string;
    /** Function to load the prompt */
    load: (args: Args) => Promise<string>;
    /** Name of the prompt */
    name: string;
};
/**
 * Type for server options.
 */
type ServerOptions<T extends FastMCPSessionAuth> = {
    /** Name of the server */
    name: string;
    /** Version of the server */
    version: `${number}.${number}.${number}`;
    /** Optional authentication function */
    authenticate?: Authenticate<T>;
};
/**
 * Type for logging levels.
 */
type LoggingLevel = "debug" | "info" | "notice" | "warning" | "error" | "critical" | "alert" | "emergency";
declare const FastMCPSessionEventEmitterBase: {
    new (): StrictEventEmitter<EventEmitter, FastMCPSessionEvents>;
};
declare class FastMCPSessionEventEmitter extends FastMCPSessionEventEmitterBase {
}
/**
 * Type for sampling responses.
 */
type SamplingResponse = {
    /** The model used */
    model: string;
    /** Optional reason for stopping */
    stopReason?: "endTurn" | "stopSequence" | "maxTokens" | string;
    /** Role of the message */
    role: "user" | "assistant";
    /** Content of the message */
    content: TextContent | ImageContent;
};
/**
 * Type for session authentication.
 */
type FastMCPSessionAuth = Record<string, unknown> | undefined;
/**
 * Class representing a FastMCP session.
 * Manages communication between the client and server.
 */
export declare class FastMCPSession<T extends FastMCPSessionAuth = FastMCPSessionAuth> extends FastMCPSessionEventEmitter {
    #private;
    /**
     * Creates a new FastMCPSession.
     *
     * @param options - Configuration options for the session
     */
    constructor({ auth, name, version, tools, resources, resourcesTemplates, prompts, }: {
        auth?: T;
        name: string;
        version: string;
        tools: Tool<T>[];
        resources: Resource[];
        resourcesTemplates: InputResourceTemplate[];
        prompts: Prompt[];
    });
    private addResource;
    private addResourceTemplate;
    private addPrompt;
    get clientCapabilities(): ClientCapabilities | null;
    get server(): Server;
    requestSampling(message: z.infer<typeof CreateMessageRequestSchema>["params"]): Promise<SamplingResponse>;
    connect(transport: Transport): Promise<void>;
    get roots(): Root[];
    close(): Promise<void>;
    private setupErrorHandling;
    get loggingLevel(): LoggingLevel;
    private setupCompleteHandlers;
    private setupRootsHandlers;
    private setupLoggingHandlers;
    private setupToolHandlers;
    private setupResourceHandlers;
    private setupResourceTemplateHandlers;
    private setupPromptHandlers;
}
declare const FastMCPEventEmitterBase: {
    new (): StrictEventEmitter<EventEmitter, FastMCPEvents<FastMCPSessionAuth>>;
};
declare class FastMCPEventEmitter extends FastMCPEventEmitterBase {
}
type Authenticate<T> = (request: http.IncomingMessage) => Promise<T>;
/**
 * Class representing a toolbox for FastMCP.
 * Manages tools, resources, and prompts for a Model Context Protocol server.
 */
export declare class ToolBox<T extends Record<string, unknown> | undefined = undefined> extends FastMCPEventEmitter {
    #private;
    options: ServerOptions<T>;
    /**
     * Creates a new ToolBox instance.
     *
     * @param options - Configuration options for the toolbox
     */
    constructor(options: ServerOptions<T>);
    /**
     * Gets all active sessions.
     */
    get sessions(): FastMCPSession<T>[];
    /**
     * Adds a tool to the server.
     *
     * @param tool - The tool to add
     */
    addTool<Params extends ToolParameters>(tool: Tool<T, Params>): void;
    /**
     * Adds a resource to the server.
     *
     * @param resource - The resource to add
     */
    addResource(resource: Resource): void;
    /**
     * Adds a resource template to the server.
     *
     * @param resource - The resource template to add
     */
    addResourceTemplate<const Args extends InputResourceTemplateArgument[]>(resource: InputResourceTemplate<Args>): void;
    /**
     * Adds a prompt to the server.
     *
     * @param prompt - The prompt to add
     */
    addPrompt<const Args extends InputPromptArgument[]>(prompt: InputPrompt<Args>): void;
    /**
     * Starts the server.
     *
     * @param options - Options for the server transport
     */
    start(options?: {
        transportType: "stdio";
    } | {
        transportType: "sse";
        sse: {
            endpoint: `/${string}`;
            port: number;
        };
    }): Promise<void>;
    /**
     * Stops the server.
     */
    stop(): Promise<void>;
    /**
     * Activates the server.
     *
     * @param options - Options for the server transport
     */
    activate(options?: {
        transportType: "stdio";
    } | {
        transportType: "sse";
        sse: {
            endpoint: `/${string}`;
            port: number;
        };
    }): Promise<void>;
}
export {};
