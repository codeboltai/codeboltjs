"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _FastMCPSession_capabilities, _FastMCPSession_clientCapabilities, _FastMCPSession_loggingLevel, _FastMCPSession_prompts, _FastMCPSession_resources, _FastMCPSession_resourceTemplates, _FastMCPSession_roots, _FastMCPSession_server, _FastMCPSession_pingInterval, _ToolBox_options, _ToolBox_prompts, _ToolBox_resources, _ToolBox_resourcesTemplates, _ToolBox_sessions, _ToolBox_sseServer, _ToolBox_tools;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolBox = exports.FastMCPSession = exports.UserError = exports.UnexpectedStateError = exports.imageContent = void 0;
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const zod_to_json_schema_1 = require("zod-to-json-schema");
const zod_1 = require("zod");
const promises_1 = require("timers/promises");
const promises_2 = require("fs/promises");
const events_1 = require("events");
const fuse_js_1 = __importDefault(require("fuse.js"));
const uri_templates_1 = __importDefault(require("uri-templates"));
const load_esm_1 = require("load-esm");
/**
 * Generates an image content object from a URL, file path, or buffer.
 */
const imageContent = async (input) => {
    var _a;
    let rawData;
    if ("url" in input) {
        const response = await fetch(input.url);
        if (!response.ok) {
            throw new Error(`Failed to fetch image from URL: ${response.statusText}`);
        }
        rawData = Buffer.from(await response.arrayBuffer());
    }
    else if ("path" in input) {
        rawData = await (0, promises_2.readFile)(input.path);
    }
    else if ("buffer" in input) {
        rawData = input.buffer;
    }
    else {
        throw new Error("Invalid input: Provide a valid 'url', 'path', or 'buffer'");
    }
    const { fileTypeFromBuffer } = await (0, load_esm_1.loadEsm)('file-type');
    const mimeType = await fileTypeFromBuffer(rawData);
    console.log(mimeType);
    const base64Data = rawData.toString("base64");
    return {
        type: "image",
        data: base64Data,
        mimeType: (_a = mimeType === null || mimeType === void 0 ? void 0 : mimeType.mime) !== null && _a !== void 0 ? _a : "image/png",
    };
};
exports.imageContent = imageContent;
class FastMCPError extends Error {
    constructor(message) {
        super(message);
        this.name = new.target.name;
    }
}
class UnexpectedStateError extends FastMCPError {
    constructor(message, extras) {
        super(message);
        this.name = new.target.name;
        this.extras = extras;
    }
}
exports.UnexpectedStateError = UnexpectedStateError;
/**
 * An error that is meant to be surfaced to the user.
 */
class UserError extends UnexpectedStateError {
}
exports.UserError = UserError;
const TextContentZodSchema = zod_1.z
    .object({
    type: zod_1.z.literal("text"),
    /**
     * The text content of the message.
     */
    text: zod_1.z.string(),
})
    .strict();
const ImageContentZodSchema = zod_1.z
    .object({
    type: zod_1.z.literal("image"),
    /**
     * The base64-encoded image data.
     */
    data: zod_1.z.string().base64(),
    /**
     * The MIME type of the image. Different providers may support different image types.
     */
    mimeType: zod_1.z.string(),
})
    .strict();
const ContentZodSchema = zod_1.z.discriminatedUnion("type", [
    TextContentZodSchema,
    ImageContentZodSchema,
]);
const ContentResultZodSchema = zod_1.z
    .object({
    content: ContentZodSchema.array(),
    isError: zod_1.z.boolean().optional(),
})
    .strict();
/**
 * https://github.com/modelcontextprotocol/typescript-sdk/blob/3164da64d085ec4e022ae881329eee7b72f208d4/src/types.ts#L983-L1003
 */
const CompletionZodSchema = zod_1.z.object({
    /**
     * An array of completion values. Must not exceed 100 items.
     */
    values: zod_1.z.array(zod_1.z.string()).max(100),
    /**
     * The total number of completion options available. This can exceed the number of values actually sent in the response.
     */
    total: zod_1.z.optional(zod_1.z.number().int()),
    /**
     * Indicates whether there are additional completion options beyond those provided in the current response, even if the exact total is unknown.
     */
    hasMore: zod_1.z.optional(zod_1.z.boolean()),
});
const FastMCPSessionEventEmitterBase = events_1.EventEmitter;
class FastMCPSessionEventEmitter extends FastMCPSessionEventEmitterBase {
}
class FastMCPSession extends FastMCPSessionEventEmitter {
    constructor({ name, version, tools, resources, resourcesTemplates, prompts, }) {
        super();
        _FastMCPSession_capabilities.set(this, {});
        _FastMCPSession_clientCapabilities.set(this, void 0);
        _FastMCPSession_loggingLevel.set(this, "info");
        _FastMCPSession_prompts.set(this, []);
        _FastMCPSession_resources.set(this, []);
        _FastMCPSession_resourceTemplates.set(this, []);
        _FastMCPSession_roots.set(this, []);
        _FastMCPSession_server.set(this, void 0);
        _FastMCPSession_pingInterval.set(this, null);
        if (tools.length) {
            __classPrivateFieldGet(this, _FastMCPSession_capabilities, "f").tools = {};
        }
        if (resources.length || resourcesTemplates.length) {
            __classPrivateFieldGet(this, _FastMCPSession_capabilities, "f").resources = {};
        }
        if (prompts.length) {
            for (const prompt of prompts) {
                this.addPrompt(prompt);
            }
            __classPrivateFieldGet(this, _FastMCPSession_capabilities, "f").prompts = {};
        }
        __classPrivateFieldGet(this, _FastMCPSession_capabilities, "f").logging = {};
        __classPrivateFieldSet(this, _FastMCPSession_server, new index_js_1.Server({ name: name, version: version }, { capabilities: __classPrivateFieldGet(this, _FastMCPSession_capabilities, "f") }), "f");
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
    addResource(inputResource) {
        __classPrivateFieldGet(this, _FastMCPSession_resources, "f").push(inputResource);
    }
    addResourceTemplate(inputResourceTemplate) {
        var _a;
        const completers = {};
        for (const argument of (_a = inputResourceTemplate.arguments) !== null && _a !== void 0 ? _a : []) {
            if (argument.complete) {
                completers[argument.name] = argument.complete;
            }
        }
        const resourceTemplate = {
            ...inputResourceTemplate,
            complete: async (name, value) => {
                if (completers[name]) {
                    return await completers[name](value);
                }
                return {
                    values: [],
                };
            },
        };
        __classPrivateFieldGet(this, _FastMCPSession_resourceTemplates, "f").push(resourceTemplate);
    }
    addPrompt(inputPrompt) {
        var _a;
        const completers = {};
        const enums = {};
        for (const argument of (_a = inputPrompt.arguments) !== null && _a !== void 0 ? _a : []) {
            if (argument.complete) {
                completers[argument.name] = argument.complete;
            }
            if (argument.enum) {
                enums[argument.name] = argument.enum;
            }
        }
        const prompt = {
            ...inputPrompt,
            complete: async (name, value) => {
                if (completers[name]) {
                    return await completers[name](value);
                }
                if (enums[name]) {
                    const fuse = new fuse_js_1.default(enums[name], {
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
        __classPrivateFieldGet(this, _FastMCPSession_prompts, "f").push(prompt);
    }
    get clientCapabilities() {
        var _a;
        return (_a = __classPrivateFieldGet(this, _FastMCPSession_clientCapabilities, "f")) !== null && _a !== void 0 ? _a : null;
    }
    get server() {
        return __classPrivateFieldGet(this, _FastMCPSession_server, "f");
    }
    async requestSampling(message) {
        return __classPrivateFieldGet(this, _FastMCPSession_server, "f").createMessage(message);
    }
    async connect(transport) {
        var _a;
        if (__classPrivateFieldGet(this, _FastMCPSession_server, "f").transport) {
            throw new UnexpectedStateError("Server is already connected");
        }
        await __classPrivateFieldGet(this, _FastMCPSession_server, "f").connect(transport);
        let attempt = 0;
        while (attempt++ < 10) {
            const capabilities = await __classPrivateFieldGet(this, _FastMCPSession_server, "f").getClientCapabilities();
            if (capabilities) {
                __classPrivateFieldSet(this, _FastMCPSession_clientCapabilities, capabilities, "f");
                break;
            }
            await (0, promises_1.setTimeout)(100);
        }
        if (!__classPrivateFieldGet(this, _FastMCPSession_clientCapabilities, "f")) {
            throw new UnexpectedStateError("Server did not connect");
        }
        if ((_a = __classPrivateFieldGet(this, _FastMCPSession_clientCapabilities, "f")) === null || _a === void 0 ? void 0 : _a.roots) {
            const roots = await __classPrivateFieldGet(this, _FastMCPSession_server, "f").listRoots();
            __classPrivateFieldSet(this, _FastMCPSession_roots, roots.roots, "f");
        }
        __classPrivateFieldSet(this, _FastMCPSession_pingInterval, setInterval(async () => {
            try {
                await __classPrivateFieldGet(this, _FastMCPSession_server, "f").ping();
            }
            catch (error) {
                this.emit("error", {
                    error: error,
                });
            }
        }, 1000), "f");
    }
    get roots() {
        return __classPrivateFieldGet(this, _FastMCPSession_roots, "f");
    }
    async close() {
        if (__classPrivateFieldGet(this, _FastMCPSession_pingInterval, "f")) {
            clearInterval(__classPrivateFieldGet(this, _FastMCPSession_pingInterval, "f"));
        }
        await __classPrivateFieldGet(this, _FastMCPSession_server, "f").close();
    }
    setupErrorHandling() {
        __classPrivateFieldGet(this, _FastMCPSession_server, "f").onerror = (error) => {
            console.error("[MCP Error]", error);
        };
    }
    get loggingLevel() {
        return __classPrivateFieldGet(this, _FastMCPSession_loggingLevel, "f");
    }
    setupCompleteHandlers() {
        __classPrivateFieldGet(this, _FastMCPSession_server, "f").setRequestHandler(types_js_1.CompleteRequestSchema, async (request) => {
            if (request.params.ref.type === "ref/prompt") {
                const prompt = __classPrivateFieldGet(this, _FastMCPSession_prompts, "f").find((prompt) => prompt.name === request.params.ref.name);
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
                const completion = CompletionZodSchema.parse(await prompt.complete(request.params.argument.name, request.params.argument.value));
                return {
                    completion,
                };
            }
            if (request.params.ref.type === "ref/resource") {
                const resource = __classPrivateFieldGet(this, _FastMCPSession_resourceTemplates, "f").find((resource) => resource.uriTemplate === request.params.ref.uri);
                if (!resource) {
                    throw new UnexpectedStateError("Unknown resource", {
                        request,
                    });
                }
                if (!("uriTemplate" in resource)) {
                    throw new UnexpectedStateError("Unexpected resource");
                }
                if (!resource.complete) {
                    throw new UnexpectedStateError("Resource does not support completion", {
                        request,
                    });
                }
                const completion = CompletionZodSchema.parse(await resource.complete(request.params.argument.name, request.params.argument.value));
                return {
                    completion,
                };
            }
            throw new UnexpectedStateError("Unexpected completion request", {
                request,
            });
        });
    }
    setupRootsHandlers() {
        __classPrivateFieldGet(this, _FastMCPSession_server, "f").setNotificationHandler(types_js_1.RootsListChangedNotificationSchema, () => {
            __classPrivateFieldGet(this, _FastMCPSession_server, "f").listRoots().then((roots) => {
                __classPrivateFieldSet(this, _FastMCPSession_roots, roots.roots, "f");
                this.emit("rootsChanged", {
                    roots: roots.roots,
                });
            });
        });
    }
    setupLoggingHandlers() {
        __classPrivateFieldGet(this, _FastMCPSession_server, "f").setRequestHandler(types_js_1.SetLevelRequestSchema, (request) => {
            __classPrivateFieldSet(this, _FastMCPSession_loggingLevel, request.params.level, "f");
            return {};
        });
    }
    setupToolHandlers(tools) {
        __classPrivateFieldGet(this, _FastMCPSession_server, "f").setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
            return {
                tools: tools.map((tool) => {
                    return {
                        name: tool.name,
                        description: tool.description,
                        inputSchema: tool.parameters
                            ? (0, zod_to_json_schema_1.zodToJsonSchema)(tool.parameters)
                            : undefined,
                    };
                }),
            };
        });
        __classPrivateFieldGet(this, _FastMCPSession_server, "f").setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
            var _a, _b;
            const tool = tools.find((tool) => tool.name === request.params.name);
            if (!tool) {
                throw new types_js_1.McpError(types_js_1.ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
            }
            let args = undefined;
            if (tool.parameters) {
                const parsed = tool.parameters.safeParse(request.params.arguments);
                if (!parsed.success) {
                    throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidParams, `Invalid ${request.params.name} parameters`);
                }
                args = parsed.data;
            }
            const progressToken = (_b = (_a = request.params) === null || _a === void 0 ? void 0 : _a._meta) === null || _b === void 0 ? void 0 : _b.progressToken;
            let result;
            try {
                const reportProgress = async (progress) => {
                    await __classPrivateFieldGet(this, _FastMCPSession_server, "f").notification({
                        method: "notifications/progress",
                        params: {
                            ...progress,
                            progressToken,
                        },
                    });
                };
                const log = {
                    debug: (message, context) => {
                        __classPrivateFieldGet(this, _FastMCPSession_server, "f").sendLoggingMessage({
                            level: "debug",
                            data: {
                                message,
                                context,
                            },
                        });
                    },
                    error: (message, context) => {
                        __classPrivateFieldGet(this, _FastMCPSession_server, "f").sendLoggingMessage({
                            level: "error",
                            data: {
                                message,
                                context,
                            },
                        });
                    },
                    info: (message, context) => {
                        __classPrivateFieldGet(this, _FastMCPSession_server, "f").sendLoggingMessage({
                            level: "info",
                            data: {
                                message,
                                context,
                            },
                        });
                    },
                    warn: (message, context) => {
                        __classPrivateFieldGet(this, _FastMCPSession_server, "f").sendLoggingMessage({
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
                });
                if (typeof maybeStringResult === "string") {
                    result = ContentResultZodSchema.parse({
                        content: [{ type: "text", text: maybeStringResult }],
                    });
                }
                else if ("type" in maybeStringResult) {
                    result = ContentResultZodSchema.parse({
                        content: [maybeStringResult],
                    });
                }
                else {
                    result = ContentResultZodSchema.parse(maybeStringResult);
                }
            }
            catch (error) {
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
    setupResourceHandlers(resources) {
        __classPrivateFieldGet(this, _FastMCPSession_server, "f").setRequestHandler(types_js_1.ListResourcesRequestSchema, async () => {
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
        __classPrivateFieldGet(this, _FastMCPSession_server, "f").setRequestHandler(types_js_1.ReadResourceRequestSchema, async (request) => {
            if ("uri" in request.params) {
                const resource = resources.find((resource) => "uri" in resource && resource.uri === request.params.uri);
                if (!resource) {
                    for (const resourceTemplate of __classPrivateFieldGet(this, _FastMCPSession_resourceTemplates, "f")) {
                        const uriTemplate = (0, uri_templates_1.default)(resourceTemplate.uriTemplate);
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
                    throw new types_js_1.McpError(types_js_1.ErrorCode.MethodNotFound, `Unknown resource: ${request.params.uri}`);
                }
                if (!("uri" in resource)) {
                    throw new UnexpectedStateError("Resource does not support reading");
                }
                let maybeArrayResult;
                try {
                    maybeArrayResult = await resource.load();
                }
                catch (error) {
                    throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, `Error reading resource: ${error}`, {
                        uri: resource.uri,
                    });
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
                }
                else {
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
        });
    }
    setupResourceTemplateHandlers(resourceTemplates) {
        __classPrivateFieldGet(this, _FastMCPSession_server, "f").setRequestHandler(types_js_1.ListResourceTemplatesRequestSchema, async () => {
            return {
                resourceTemplates: resourceTemplates.map((resourceTemplate) => {
                    return {
                        name: resourceTemplate.name,
                        uriTemplate: resourceTemplate.uriTemplate,
                    };
                }),
            };
        });
    }
    setupPromptHandlers(prompts) {
        __classPrivateFieldGet(this, _FastMCPSession_server, "f").setRequestHandler(types_js_1.ListPromptsRequestSchema, async () => {
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
        __classPrivateFieldGet(this, _FastMCPSession_server, "f").setRequestHandler(types_js_1.GetPromptRequestSchema, async (request) => {
            var _a;
            const prompt = prompts.find((prompt) => prompt.name === request.params.name);
            if (!prompt) {
                throw new types_js_1.McpError(types_js_1.ErrorCode.MethodNotFound, `Unknown prompt: ${request.params.name}`);
            }
            const args = request.params.arguments;
            for (const arg of (_a = prompt.arguments) !== null && _a !== void 0 ? _a : []) {
                if (arg.required && !(args && arg.name in args)) {
                    throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidRequest, `Missing required argument: ${arg.name}`);
                }
            }
            let result;
            try {
                result = await prompt.load(args);
            }
            catch (error) {
                throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, `Error loading prompt: ${error}`);
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
exports.FastMCPSession = FastMCPSession;
_FastMCPSession_capabilities = new WeakMap(), _FastMCPSession_clientCapabilities = new WeakMap(), _FastMCPSession_loggingLevel = new WeakMap(), _FastMCPSession_prompts = new WeakMap(), _FastMCPSession_resources = new WeakMap(), _FastMCPSession_resourceTemplates = new WeakMap(), _FastMCPSession_roots = new WeakMap(), _FastMCPSession_server = new WeakMap(), _FastMCPSession_pingInterval = new WeakMap();
const FastMCPEventEmitterBase = events_1.EventEmitter;
class FastMCPEventEmitter extends FastMCPEventEmitterBase {
}
class ToolBox extends FastMCPEventEmitter {
    constructor(options) {
        super();
        this.options = options;
        _ToolBox_options.set(this, void 0);
        _ToolBox_prompts.set(this, []);
        _ToolBox_resources.set(this, []);
        _ToolBox_resourcesTemplates.set(this, []);
        _ToolBox_sessions.set(this, []);
        _ToolBox_sseServer.set(this, null);
        _ToolBox_tools.set(this, []);
        __classPrivateFieldSet(this, _ToolBox_options, options, "f");
    }
    get sessions() {
        return __classPrivateFieldGet(this, _ToolBox_sessions, "f");
    }
    /**
     * Adds a tool to the server.
     */
    addTool(tool) {
        __classPrivateFieldGet(this, _ToolBox_tools, "f").push(tool);
    }
    /**
     * Adds a resource to the server.
     */
    addResource(resource) {
        __classPrivateFieldGet(this, _ToolBox_resources, "f").push(resource);
    }
    /**
     * Adds a resource template to the server.
     */
    addResourceTemplate(resource) {
        __classPrivateFieldGet(this, _ToolBox_resourcesTemplates, "f").push(resource);
    }
    /**
     * Adds a prompt to the server.
     */
    addPrompt(prompt) {
        __classPrivateFieldGet(this, _ToolBox_prompts, "f").push(prompt);
    }
    /**
     * Starts the server.
     */
    async activate(options = {
        transportType: "stdio",
    }) {
        if (options.transportType === "stdio") {
            const transport = new stdio_js_1.StdioServerTransport();
            // console.log("tools", this.#tools);
            const session = new FastMCPSession({
                name: __classPrivateFieldGet(this, _ToolBox_options, "f").name,
                version: __classPrivateFieldGet(this, _ToolBox_options, "f").version,
                tools: __classPrivateFieldGet(this, _ToolBox_tools, "f"),
                resources: __classPrivateFieldGet(this, _ToolBox_resources, "f"),
                resourcesTemplates: __classPrivateFieldGet(this, _ToolBox_resourcesTemplates, "f"),
                prompts: __classPrivateFieldGet(this, _ToolBox_prompts, "f"),
            });
            // console.log("session", session);
            await session.connect(transport);
            __classPrivateFieldGet(this, _ToolBox_sessions, "f").push(session);
            this.emit("connect", {
                session,
            });
            console.info(`server is running on stdio`);
        }
        else if (options.transportType === "sse") {
            // this.#sseServer = await startSSEServer<FastMCPSession>({
            //   endpoint: options.sse.endpoint as `/${string}`,
            //   port: options.sse.port,
            //   createServer: async () => {
            //     return new FastMCPSession({
            //       name: this.#options.name,
            //       version: this.#options.version,
            //       tools: this.#tools,
            //       resources: this.#resources,
            //       resourcesTemplates: this.#resourcesTemplates,
            //       prompts: this.#prompts,
            //     });
            //   },
            //   onClose: (session) => {
            //     this.emit("disconnect", {
            //       session,
            //     });
            //   },
            //   onConnect: async (session) => {
            //     this.#sessions.push(session);
            //     this.emit("connect", {
            //       session,
            //     });
            //   },
            // });
            // console.error(
            //   `server is running on SSE at http://localhost:${options.sse.port}${options.sse.endpoint}`,
            // );
        }
        else {
            throw new Error("Invalid transport type");
        }
    }
    /**
     * Stops the server.
     */
    async stop() {
        if (__classPrivateFieldGet(this, _ToolBox_sseServer, "f")) {
            __classPrivateFieldGet(this, _ToolBox_sseServer, "f").close();
        }
    }
}
exports.ToolBox = ToolBox;
_ToolBox_options = new WeakMap(), _ToolBox_prompts = new WeakMap(), _ToolBox_resources = new WeakMap(), _ToolBox_resourcesTemplates = new WeakMap(), _ToolBox_sessions = new WeakMap(), _ToolBox_sseServer = new WeakMap(), _ToolBox_tools = new WeakMap();
