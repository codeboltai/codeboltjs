import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ClientCapabilities, CreateMessageRequestSchema, Root } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { StrictEventEmitter } from "strict-event-emitter-types";
import { EventEmitter } from "events";
import { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
export type SSEServer = {
    close: () => Promise<void>;
};
type FastMCPEvents = {
    connect: (event: {
        session: FastMCPSession;
    }) => void;
    disconnect: (event: {
        session: FastMCPSession;
    }) => void;
};
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
 */
export declare const imageContent: (input: {
    url: string;
} | {
    path: string;
} | {
    buffer: Buffer;
}) => Promise<ImageContent>;
declare abstract class FastMCPError extends Error {
    constructor(message?: string);
}
type Extra = unknown;
type Extras = Record<string, Extra>;
export declare class UnexpectedStateError extends FastMCPError {
    extras?: Extras;
    constructor(message: string, extras?: Extras);
}
/**
 * An error that is meant to be surfaced to the user.
 */
export declare class UserError extends UnexpectedStateError {
}
type ToolParameters = z.ZodTypeAny;
type Literal = boolean | null | number | string | undefined;
type SerializableValue = Literal | SerializableValue[] | {
    [key: string]: SerializableValue;
};
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
type Context = {
    reportProgress: (progress: Progress) => Promise<void>;
    log: {
        debug: (message: string, data?: SerializableValue) => void;
        error: (message: string, data?: SerializableValue) => void;
        info: (message: string, data?: SerializableValue) => void;
        warn: (message: string, data?: SerializableValue) => void;
    };
};
type TextContent = {
    type: "text";
    text: string;
};
type ImageContent = {
    type: "image";
    data: string;
    mimeType: string;
};
type Content = TextContent | ImageContent;
type ContentResult = {
    content: Content[];
    isError?: boolean;
};
type Completion = {
    values: string[];
    total?: number;
    hasMore?: boolean;
};
type Tool<Params extends ToolParameters = ToolParameters> = {
    name: string;
    description?: string;
    parameters?: Params;
    execute: (args: z.infer<Params>, context: Context) => Promise<string | ContentResult | TextContent | ImageContent>;
};
type ResourceResult = {
    text: string;
} | {
    blob: string;
};
type InputResourceTemplateArgument = Readonly<{
    name: string;
    description?: string;
    complete?: ArgumentValueCompleter;
}>;
type ResourceTemplateArgument = Readonly<{
    name: string;
    description?: string;
    complete?: ArgumentValueCompleter;
}>;
type ResourceTemplateArgumentsToObject<T extends {
    name: string;
}[]> = {
    [K in T[number]["name"]]: string;
};
type InputResourceTemplate<Arguments extends ResourceTemplateArgument[] = ResourceTemplateArgument[]> = {
    uriTemplate: string;
    name: string;
    description?: string;
    mimeType?: string;
    arguments: Arguments;
    load: (args: ResourceTemplateArgumentsToObject<Arguments>) => Promise<ResourceResult>;
};
type Resource = {
    uri: string;
    name: string;
    description?: string;
    mimeType?: string;
    load: () => Promise<ResourceResult | ResourceResult[]>;
    complete?: (name: string, value: string) => Promise<Completion>;
};
type ArgumentValueCompleter = (value: string) => Promise<Completion>;
type InputPromptArgument = Readonly<{
    name: string;
    description?: string;
    required?: boolean;
    complete?: ArgumentValueCompleter;
    enum?: string[];
}>;
type PromptArgumentsToObject<T extends {
    name: string;
    required?: boolean;
}[]> = {
    [K in T[number]["name"]]: Extract<T[number], {
        name: K;
    }>["required"] extends true ? string : string | undefined;
};
type InputPrompt<Arguments extends InputPromptArgument[] = InputPromptArgument[], Args = PromptArgumentsToObject<Arguments>> = {
    name: string;
    description?: string;
    arguments?: InputPromptArgument[];
    load: (args: Args) => Promise<string>;
};
type PromptArgument = Readonly<{
    name: string;
    description?: string;
    required?: boolean;
    complete?: ArgumentValueCompleter;
    enum?: string[];
}>;
type Prompt<Arguments extends PromptArgument[] = PromptArgument[], Args = PromptArgumentsToObject<Arguments>> = {
    arguments?: PromptArgument[];
    complete?: (name: string, value: string) => Promise<Completion>;
    description?: string;
    load: (args: Args) => Promise<string>;
    name: string;
};
type ServerOptions = {
    name: string;
    version: `${number}.${number}.${number}`;
};
type LoggingLevel = "debug" | "info" | "notice" | "warning" | "error" | "critical" | "alert" | "emergency";
declare const FastMCPSessionEventEmitterBase: {
    new (): StrictEventEmitter<EventEmitter, FastMCPSessionEvents>;
};
declare class FastMCPSessionEventEmitter extends FastMCPSessionEventEmitterBase {
}
type SamplingResponse = {
    model: string;
    stopReason?: "endTurn" | "stopSequence" | "maxTokens" | string;
    role: "user" | "assistant";
    content: TextContent | ImageContent;
};
export declare class FastMCPSession extends FastMCPSessionEventEmitter {
    #private;
    constructor({ name, version, tools, resources, resourcesTemplates, prompts, }: {
        name: string;
        version: string;
        tools: Tool[];
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
    new (): StrictEventEmitter<EventEmitter, FastMCPEvents>;
};
declare class FastMCPEventEmitter extends FastMCPEventEmitterBase {
}
export declare class ToolBox extends FastMCPEventEmitter {
    #private;
    options: ServerOptions;
    constructor(options: ServerOptions);
    get sessions(): FastMCPSession[];
    /**
     * Adds a tool to the server.
     */
    addTool<Params extends ToolParameters>(tool: Tool<Params>): void;
    /**
     * Adds a resource to the server.
     */
    addResource(resource: Resource): void;
    /**
     * Adds a resource template to the server.
     */
    addResourceTemplate<const Args extends InputResourceTemplateArgument[]>(resource: InputResourceTemplate<Args>): void;
    /**
     * Adds a prompt to the server.
     */
    addPrompt<const Args extends InputPromptArgument[]>(prompt: InputPrompt<Args>): void;
    /**
     * Starts the server.
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
    /**
     * Stops the server.
     */
    stop(): Promise<void>;
}
export {};
