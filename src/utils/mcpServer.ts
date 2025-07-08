import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ClientCapabilities,
  CompleteRequestSchema,
  CreateMessageRequestSchema,
  ErrorCode,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
  Root,
  RootsListChangedNotificationSchema,
  ServerCapabilities,
  SetLevelRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { z } from "zod";
import { setTimeout as delay } from "timers/promises";
import { readFile } from "fs/promises";
import { fileTypeFromBuffer } from "file-type";
import { StrictEventEmitter } from "strict-event-emitter-types";
import { EventEmitter } from "events";
import Fuse from "fuse.js";
import { startSSEServer } from "mcp-proxy";
import { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import parseURITemplate from "uri-templates";
import http from "http";
import { fetch } from "undici";
import { loadEsm } from "load-esm";

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
  connect: (event: { session: FastMCPSession<T> }) => void;
  disconnect: (event: { session: FastMCPSession<T> }) => void;
};

/**
 * Event types for FastMCPSession event emitter.
 */
type FastMCPSessionEvents = {
  rootsChanged: (event: { roots: Root[] }) => void;
  error: (event: { error: Error }) => void;
};

/**
 * Generates an image content object from a URL, file path, or buffer.
 * 
 * @param input - The input source for the image (URL, file path, or buffer)
 * @returns Promise with the image content object
 */
export const imageContent = async (
  input: { url: string } | { path: string } | { buffer: Buffer },
): Promise<ImageContent> => {
  let rawData: Buffer;

  if ("url" in input) {
    const response = await fetch(input.url);

    if (!response.ok) {
      throw new Error(`Failed to fetch image from URL: ${response.statusText}`);
    }

    rawData = Buffer.from(await response.arrayBuffer());
  } else if ("path" in input) {
    rawData = await readFile(input.path);
  } else if ("buffer" in input) {
    rawData = input.buffer;
  } else {
    throw new Error(
      "Invalid input: Provide a valid 'url', 'path', or 'buffer'",
    );
  }

  const { fileTypeFromBuffer } = await loadEsm('file-type');
  const mimeType = await fileTypeFromBuffer(rawData);


  const base64Data = rawData.toString("base64");

  return {
    type: "image",
    data: base64Data,
    mimeType: mimeType?.mime ?? "image/png",
  } as const;
};

/**
 * Base class for FastMCP errors.
 */
abstract class FastMCPError extends Error {
  public constructor(message?: string) {
    super(message);
    this.name = new.target.name;
  }
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
export class UnexpectedStateError extends FastMCPError {
  /** Additional context for the error */
  public extras?: Extras;

  /**
   * Creates a new UnexpectedStateError.
   * 
   * @param message - Error message
   * @param extras - Additional context for the error
   */
  public constructor(message: string, extras?: Extras) {
    super(message);
    this.name = new.target.name;
    this.extras = extras;
  }
}

/**
 * Error that is meant to be surfaced to the user.
 */
export class UserError extends UnexpectedStateError {}

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
type SerializableValue =
  | Literal
  | SerializableValue[]
  | { [key: string]: SerializableValue };

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

const TextContentZodSchema = z
  .object({
    type: z.literal("text"),
    /**
     * The text content of the message.
     */
    text: z.string(),
  })
  .strict() satisfies z.ZodType<TextContent>;

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

const ImageContentZodSchema = z
  .object({
    type: z.literal("image"),
    /**
     * The base64-encoded image data.
     */
    data: z.string().base64(),
    /**
     * The MIME type of the image. Different providers may support different image types.
     */
    mimeType: z.string(),
  })
  .strict() satisfies z.ZodType<ImageContent>;

/**
 * Union type for content in messages.
 */
type Content = TextContent | ImageContent;

const ContentZodSchema = z.discriminatedUnion("type", [
  TextContentZodSchema,
  ImageContentZodSchema,
]) satisfies z.ZodType<Content>;

/**
 * Type for content results from tool executions.
 */
type ContentResult = {
  /** Array of content blocks */
  content: Content[];
  /** Whether this result represents an error */
  isError?: boolean;
};

const ContentResultZodSchema = z
  .object({
    content: ContentZodSchema.array(),
    isError: z.boolean().optional(),
  })
  .strict() satisfies z.ZodType<ContentResult>;

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
 * Schema for completion results.
 * https://github.com/modelcontextprotocol/typescript-sdk/blob/3164da64d085ec4e022ae881329eee7b72f208d4/src/types.ts#L983-L1003
 */
const CompletionZodSchema = z.object({
  /**
   * An array of completion values. Must not exceed 100 items.
   */
  values: z.array(z.string()).max(100),
  /**
   * The total number of completion options available. This can exceed the number of values actually sent in the response.
   */
  total: z.optional(z.number().int()),
  /**
   * Indicates whether there are additional completion options beyond those provided in the current response, even if the exact total is unknown.
   */
  hasMore: z.optional(z.boolean()),
}) satisfies z.ZodType<Completion>;

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
  execute: (
    args: z.infer<Params>,
    context: Context<T>,
  ) => Promise<string | ContentResult | TextContent | ImageContent>;
};

/**
 * Type for resource results.
 */
type ResourceResult =
  | {
      text: string;
    }
  | {
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
 * Type for resource templates.
 */
type ResourceTemplate<
  Arguments extends ResourceTemplateArgument[] = ResourceTemplateArgument[],
> = {
  /** URI template for the resource */
  uriTemplate: string;
  /** Name of the resource template */
  name: string;
  /** Optional description */
  description?: string;
  /** Optional MIME type */
  mimeType?: string;
  /** Arguments for the template */
  arguments: Arguments;
  /** Optional completion function */
  complete?: (name: string, value: string) => Promise<Completion>;
  /** Function to load the resource */
  load: (
    args: ResourceTemplateArgumentsToObject<Arguments>,
  ) => Promise<ResourceResult>;
};

/**
 * Type transformation from argument array to object.
 */
type ResourceTemplateArgumentsToObject<T extends { name: string }[]> = {
  [K in T[number]["name"]]: string;
};

/**
 * Type for input resource templates.
 */
type InputResourceTemplate<
  Arguments extends ResourceTemplateArgument[] = ResourceTemplateArgument[],
> = {
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
  load: (
    args: ResourceTemplateArgumentsToObject<Arguments>,
  ) => Promise<ResourceResult>;
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
type PromptArgumentsToObject<T extends { name: string; required?: boolean }[]> =
  {
    [K in T[number]["name"]]: Extract<
      T[number],
      { name: K }
    >["required"] extends true
      ? string
      : string | undefined;
  };

/**
 * Type for input prompts.
 */
type InputPrompt<
  Arguments extends InputPromptArgument[] = InputPromptArgument[],
  Args = PromptArgumentsToObject<Arguments>,
> = {
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
type Prompt<
  Arguments extends PromptArgument[] = PromptArgument[],
  Args = PromptArgumentsToObject<Arguments>,
> = {
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
type LoggingLevel =
  | "debug"
  | "info"
  | "notice"
  | "warning"
  | "error"
  | "critical"
  | "alert"
  | "emergency";

const FastMCPSessionEventEmitterBase: {
  new (): StrictEventEmitter<EventEmitter, FastMCPSessionEvents>;
} = EventEmitter;

class FastMCPSessionEventEmitter extends FastMCPSessionEventEmitterBase {}

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
export class FastMCPSession<T extends FastMCPSessionAuth = FastMCPSessionAuth> extends FastMCPSessionEventEmitter {
  #capabilities: ServerCapabilities = {};
  #clientCapabilities?: ClientCapabilities;
  #loggingLevel: LoggingLevel = "info";
  #prompts: Prompt[] = [];
  #resources: Resource[] = [];
  #resourceTemplates: ResourceTemplate[] = [];
  #roots: Root[] = [];
  #server: Server;
  #auth: T | undefined;

  /**
   * Creates a new FastMCPSession.
   * 
   * @param options - Configuration options for the session
   */
  constructor({
    auth,
    name,
    version,
    tools,
    resources,
    resourcesTemplates,
    prompts,
  }: {
    auth?: T;
    name: string;
    version: string;
    tools: Tool<T>[];
    resources: Resource[];
    resourcesTemplates: InputResourceTemplate[];
    prompts: Prompt[];
  }) {
    super();

    this.#auth = auth;

    if (tools.length) {
      this.#capabilities.tools = {};
    }

    if (resources.length || resourcesTemplates.length) {
      this.#capabilities.resources = {};
    }

    if (prompts.length) {
      for (const prompt of prompts) {
        this.addPrompt(prompt);
      }

      this.#capabilities.prompts = {};
    }

    this.#capabilities.logging = {};

    this.#server = new Server(
      { name: name, version: version },
      { capabilities: this.#capabilities },
    );

    this.setupErrorHandling();
    this.setupLoggingHandlers();
    this.setupRootsHandlers();
    this.setupCompleteHandlers();

    if (tools.length) {
      this.setupToolHandlers(tools);
    }

    if (resources.length || resourcesTemplates.length) {
      for (const resource of resources) {
        this.addResource(resource);
      }

      this.setupResourceHandlers(resources);

      if (resourcesTemplates.length) {
        for (const resourceTemplate of resourcesTemplates) {
          this.addResourceTemplate(resourceTemplate);
        }

        this.setupResourceTemplateHandlers(resourcesTemplates);
      }
    }

    if (prompts.length) {
      this.setupPromptHandlers(prompts);
    }
  }

  private addResource(inputResource: Resource) {
    this.#resources.push(inputResource);
  }

  private addResourceTemplate(inputResourceTemplate: InputResourceTemplate) {
    const completers: Record<string, ArgumentValueCompleter> = {};

    for (const argument of inputResourceTemplate.arguments ?? []) {
      if (argument.complete) {
        completers[argument.name] = argument.complete;
      }
    }

    const resourceTemplate = {
      ...inputResourceTemplate,
      complete: async (name: string, value: string) => {
        if (completers[name]) {
          return await completers[name](value);
        }

        return {
          values: [],
        };
      },
    };

    this.#resourceTemplates.push(resourceTemplate);
  }

  private addPrompt(inputPrompt: InputPrompt) {
    const completers: Record<string, ArgumentValueCompleter> = {};
    const enums: Record<string, string[]> = {};

    for (const argument of inputPrompt.arguments ?? []) {
      if (argument.complete) {
        completers[argument.name] = argument.complete;
      }

      if (argument.enum) {
        enums[argument.name] = argument.enum;
      }
    }

    const prompt = {
      ...inputPrompt,
      complete: async (name: string, value: string) => {
        if (completers[name]) {
          return await completers[name](value);
        }

        if (enums[name]) {
          const fuse = new Fuse(enums[name], {
            keys: ["value"],
          });

          const result = fuse.search(value);

          return {
            values: result.map((item) => item.item),
            total: result.length,
          };
        }

        return {
          values: [],
        };
      },
    };

    this.#prompts.push(prompt);
  }

  public get clientCapabilities(): ClientCapabilities | null {
    return this.#clientCapabilities ?? null;
  }

  public get server(): Server {
    return this.#server;
  }

  #pingInterval: ReturnType<typeof setInterval> | null = null;

  public async requestSampling(
    message: z.infer<typeof CreateMessageRequestSchema>["params"],
  ): Promise<SamplingResponse> {
    return this.#server.createMessage(message) as unknown as SamplingResponse;
  }

  public async connect(transport: Transport) {
    if (this.#server.transport) {
      throw new UnexpectedStateError("Server is already connected");
    }

    await this.#server.connect(transport);

    let attempt = 0;

    while (attempt++ < 10) {
      const capabilities = await this.#server.getClientCapabilities();
     

      if (capabilities) {
        this.#clientCapabilities = capabilities;

        break;
      }

      await delay(100);
    }

    if (!this.#clientCapabilities) {
      // console.warn('[warning] toolBox could not infer client capabilities')
    }

    if (this.#clientCapabilities?.roots) {
      const roots = await this.#server.listRoots();

      this.#roots = roots.roots;
    }

    this.#pingInterval = setInterval(async () => {
      try {
        await this.#server.ping();
      } catch (error) {
        this.emit("error", {
          error: error as Error,
        });
      }
    }, 1000);
  }

  public get roots(): Root[] {
    return this.#roots;
  }

  public async close() {
    if (this.#pingInterval) {
      clearInterval(this.#pingInterval);
    }

    try {
      await this.#server.close();
    } catch (error) {
      console.error("[MCP Error]", "could not close server", error);
    }
  }

  private setupErrorHandling() {
    this.#server.onerror = (error) => {
      console.error("[MCP Error]", error);
    };
  }

  public get loggingLevel(): LoggingLevel {
    return this.#loggingLevel;
  }

  private setupCompleteHandlers() {
    this.#server.setRequestHandler(CompleteRequestSchema, async (request) => {
      if (request.params.ref.type === "ref/prompt") {
        const prompt = this.#prompts.find(
          (prompt) => prompt.name === request.params.ref.name,
        );

        if (!prompt) {
          throw new UnexpectedStateError("Unknown prompt", {
            request,
          });
        }

        if (!prompt.complete) {
          throw new UnexpectedStateError("Prompt does not support completion", {
            request,
          });
        }

        const completion = CompletionZodSchema.parse(
          await prompt.complete(
            request.params.argument.name,
            request.params.argument.value,
          ),
        );

        return {
          completion,
        };
      }

      if (request.params.ref.type === "ref/resource") {
        const resource = this.#resourceTemplates.find(
          (resource) => resource.uriTemplate === request.params.ref.uri,
        );

        if (!resource) {
          throw new UnexpectedStateError("Unknown resource", {
            request,
          });
        }

        if (!("uriTemplate" in resource)) {
          throw new UnexpectedStateError("Unexpected resource");
        }

        if (!resource.complete) {
          throw new UnexpectedStateError(
            "Resource does not support completion",
            {
              request,
            },
          );
        }

        const completion = CompletionZodSchema.parse(
          await resource.complete(
            request.params.argument.name,
            request.params.argument.value,
          ),
        );

        return {
          completion,
        };
      }

      throw new UnexpectedStateError("Unexpected completion request", {
        request,
      });
    });
  }

  private setupRootsHandlers() {
    this.#server.setNotificationHandler(
      RootsListChangedNotificationSchema,
      () => {
        this.#server.listRoots().then((roots) => {
          this.#roots = roots.roots;

          this.emit("rootsChanged", {
            roots: roots.roots,
          });
        });
      },
    );
  }

  private setupLoggingHandlers() {
    this.#server.setRequestHandler(SetLevelRequestSchema, (request) => {
      this.#loggingLevel = request.params.level;

      return {};
    });
  }

  private setupToolHandlers(tools: Tool<T>[]) {
    this.#server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: tools.map((tool) => {
          return {
            name: tool.name,
            description: tool.description,
            inputSchema: tool.parameters
              ? zodToJsonSchema(tool.parameters)
              : undefined,
          };
        }),
      };
    });

    this.#server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const tool = tools.find((tool) => tool.name === request.params.name);

      if (!tool) {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`,
        );
      }

      let args: any = undefined;

      if (tool.parameters) {
        const parsed = tool.parameters.safeParse(request.params.arguments);

        if (!parsed.success) {
          throw new McpError(
            ErrorCode.InvalidParams,
            `Invalid ${request.params.name} parameters`,
          );
        }

        args = parsed.data;
      }

      const progressToken = request.params?._meta?.progressToken;

      let result: ContentResult;

      try {
        const reportProgress = async (progress: Progress) => {
          await this.#server.notification({
            method: "notifications/progress",
            params: {
              ...progress,
              progressToken,
            },
          });
        };

        const log = {
          debug: (message: string, context?: SerializableValue) => {
            this.#server.sendLoggingMessage({
              level: "debug",
              data: {
                message,
                context,
              },
            });
          },
          error: (message: string, context?: SerializableValue) => {
            this.#server.sendLoggingMessage({
              level: "error",
              data: {
                message,
                context,
              },
            });
          },
          info: (message: string, context?: SerializableValue) => {
            this.#server.sendLoggingMessage({
              level: "info",
              data: {
                message,
                context,
              },
            });
          },
          warn: (message: string, context?: SerializableValue) => {
            this.#server.sendLoggingMessage({
              level: "warning",
              data: {
                message,
                context,
              },
            });
          },
        };

        const maybeStringResult = await tool.execute(args, {
          reportProgress,
          log,
          session: this.#auth,
        });

        if (typeof maybeStringResult === "string") {
          result = ContentResultZodSchema.parse({
            content: [{ type: "text", text: maybeStringResult }],
          });
        } else if ("type" in maybeStringResult) {
          result = ContentResultZodSchema.parse({
            content: [maybeStringResult],
          });
        } else {
          result = ContentResultZodSchema.parse(maybeStringResult);
        }
      } catch (error) {
        if (error instanceof UserError) {
          return {
            content: [{ type: "text", text: error.message }],
            isError: true,
          };
        }

        return {
          content: [{ type: "text", text: `Error: ${error}` }],
          isError: true,
        };
      }

      return result;
    });
  }

  private setupResourceHandlers(resources: Resource[]) {
    this.#server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: resources.map((resource) => {
          return {
            uri: resource.uri,
            name: resource.name,
            mimeType: resource.mimeType,
          };
        }),
      };
    });

    this.#server.setRequestHandler(
      ReadResourceRequestSchema,
      async (request) => {
        if ("uri" in request.params) {
          const resource = resources.find(
            (resource) =>
              "uri" in resource && resource.uri === request.params.uri,
          );

          if (!resource) {
            for (const resourceTemplate of this.#resourceTemplates) {
              const uriTemplate = parseURITemplate(
                resourceTemplate.uriTemplate,
              );

              const match = uriTemplate.fromUri(request.params.uri);

              if (!match) {
                continue;
              }

              const uri = uriTemplate.fill(match);

              const result = await resourceTemplate.load(match);

              return {
                contents: [
                  {
                    uri: uri,
                    mimeType: resourceTemplate.mimeType,
                    name: resourceTemplate.name,
                    ...result,
                  },
                ],
              };
            }

            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown resource: ${request.params.uri}`,
            );
          }

          if (!("uri" in resource)) {
            throw new UnexpectedStateError("Resource does not support reading");
          }

          let maybeArrayResult: Awaited<ReturnType<Resource["load"]>>;

          try {
            maybeArrayResult = await resource.load();
          } catch (error) {
            throw new McpError(
              ErrorCode.InternalError,
              `Error reading resource: ${error}`,
              {
                uri: resource.uri,
              },
            );
          }

          if (Array.isArray(maybeArrayResult)) {
            return {
              contents: maybeArrayResult.map((result) => ({
                uri: resource.uri,
                mimeType: resource.mimeType,
                name: resource.name,
                ...result,
              })),
            };
          } else {
            return {
              contents: [
                {
                  uri: resource.uri,
                  mimeType: resource.mimeType,
                  name: resource.name,
                  ...maybeArrayResult,
                },
              ],
            };
          }
        }

        throw new UnexpectedStateError("Unknown resource request", {
          request,
        });
      },
    );
  }

  private setupResourceTemplateHandlers(resourceTemplates: ResourceTemplate[]) {
    this.#server.setRequestHandler(
      ListResourceTemplatesRequestSchema,
      async () => {
        return {
          resourceTemplates: resourceTemplates.map((resourceTemplate) => {
            return {
              name: resourceTemplate.name,
              uriTemplate: resourceTemplate.uriTemplate,
            };
          }),
        };
      },
    );
  }

  private setupPromptHandlers(prompts: Prompt[]) {
    this.#server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: prompts.map((prompt) => {
          return {
            name: prompt.name,
            description: prompt.description,
            arguments: prompt.arguments,
            complete: prompt.complete,
          };
        }),
      };
    });

    this.#server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const prompt = prompts.find(
        (prompt) => prompt.name === request.params.name,
      );

      if (!prompt) {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown prompt: ${request.params.name}`,
        );
      }

      const args = request.params.arguments;

      for (const arg of prompt.arguments ?? []) {
        if (arg.required && !(args && arg.name in args)) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            `Missing required argument: ${arg.name}`,
          );
        }
      }

      let result: Awaited<ReturnType<Prompt["load"]>>;

      try {
        result = await prompt.load(args as Record<string, string | undefined>);
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Error loading prompt: ${error}`,
        );
      }

      return {
        description: prompt.description,
        messages: [
          {
            role: "user",
            content: { type: "text", text: result },
          },
        ],
      };
    });
  }
}

const FastMCPEventEmitterBase: {
  new (): StrictEventEmitter<EventEmitter, FastMCPEvents<FastMCPSessionAuth>>;
} = EventEmitter;

class FastMCPEventEmitter extends FastMCPEventEmitterBase {}

type Authenticate<T> = (request: http.IncomingMessage) => Promise<T>;

/**
 * Class representing a toolbox for FastMCP.
 * Manages tools, resources, and prompts for a Model Context Protocol server.
 */
export class MCPServer<T extends Record<string, unknown> | undefined = undefined> extends FastMCPEventEmitter {
  #options: ServerOptions<T>;
  #prompts: InputPrompt[] = [];
  #resources: Resource[] = [];
  #resourcesTemplates: InputResourceTemplate[] = [];
  #sessions: FastMCPSession<T>[] = [];
  #sseServer: SSEServer | null = null;
  #tools: Tool<T>[] = [];
  #authenticate: Authenticate<T> | undefined;

  /**
   * Creates a new ToolBox instance.
   * 
   * @param options - Configuration options for the toolbox
   */
  constructor(public options: ServerOptions<T>) {
    super();

    this.#options = options;
    this.#authenticate = options.authenticate;
  }

  /**
   * Gets all active sessions.
   */
  public get sessions(): FastMCPSession<T>[] {
    return this.#sessions;
  }

  /**
   * Adds a tool to the server.
   * 
   * @param tool - The tool to add
   */
  public addTool<Params extends ToolParameters>(tool: Tool<T, Params>) {
    this.#tools.push(tool as unknown as Tool<T>);
  }

  /**
   * Adds a resource to the server.
   * 
   * @param resource - The resource to add
   */
  public addResource(resource: Resource) {
    this.#resources.push(resource);
  }

  /**
   * Adds a resource template to the server.
   * 
   * @param resource - The resource template to add
   */
  public addResourceTemplate<
    const Args extends InputResourceTemplateArgument[],
  >(resource: InputResourceTemplate<Args>) {
    this.#resourcesTemplates.push(resource);
  }

  /**
   * Adds a prompt to the server.
   * 
   * @param prompt - The prompt to add
   */
  public addPrompt<const Args extends InputPromptArgument[]>(
    prompt: InputPrompt<Args>,
  ) {
    this.#prompts.push(prompt);
  }

  /**
   * Starts the server.
   * 
   * @param options - Options for the server transport
   */
  public async start(
    options:
      | { transportType: "stdio" }
      | {
          transportType: "sse";
          sse: { endpoint: `/${string}`; port: number };
        } = {
      transportType: "stdio",
    },
  ) {
    if (options.transportType === "stdio") {
      const transport = new StdioServerTransport();

      const session = new FastMCPSession<T>({
        name: this.#options.name,
        version: this.#options.version,
        tools: this.#tools,
        resources: this.#resources,
        resourcesTemplates: this.#resourcesTemplates,
        prompts: this.#prompts,
      });

      await session.connect(transport);

      this.#sessions.push(session);

      this.emit("connect", {
        session,
      });

    } else if (options.transportType === "sse") {
    
    } else {
      throw new Error("Invalid transport type");
    }
  }

  /**
   * Stops the server.
   */
  public async stop() {
    if (this.#sseServer) {
      this.#sseServer.close();
    }
  }

  /**
   * Activates the server.
   * 
   * @param options - Options for the server transport
   */
  public async activate(
    options:
      | { transportType: "stdio" }
      | {
        transportType: "sse";
        sse: { endpoint: `/${string}`; port: number };
      } = {
        transportType: "stdio",
      },
  ) {
    if (options.transportType === "stdio") {
      const transport = new StdioServerTransport();

      const session = new FastMCPSession({
        name: this.#options.name,
        version: this.#options.version,
        tools: this.#tools,
        resources: this.#resources,
        resourcesTemplates: this.#resourcesTemplates,
        prompts: this.#prompts,
      });

      await session.connect(transport);

      this.#sessions.push(session);

      this.emit("connect", {
        session,
      });

      console.info(`server is running on stdio`);
    } else if (options.transportType === "sse") {
      // Implementation for SSE transport
    } else {
      throw new Error("Invalid transport type");
    }
  }
}

