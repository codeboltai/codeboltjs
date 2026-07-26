globalThis.__nitro_main__ = import.meta.url;
import { c as toEventHandler, i as defineLazyEventHandler, l as NodeResponse, n as HTTPError, o as getRouterParam, r as defineHandler, t as H3Core, u as serve } from "./_libs/h3+rou3+srvx.mjs";
import { i as withoutTrailingSlash, n as joinURL, r as withLeadingSlash, t as decodePath } from "./_libs/ufo.mjs";
import { n as useMiniApp, t as defineTool } from "./_chunks/src.mjs";
import { promises } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
//#region server/tools/add-lead.ts
var add_lead_default = defineTool({
	name: "add-lead",
	description: "Store a discovered lead in the shared lead depository.",
	inputSchema: {
		type: "object",
		additionalProperties: false,
		required: [
			"id",
			"name",
			"company"
		],
		properties: {
			id: {
				type: "string",
				minLength: 1
			},
			name: {
				type: "string",
				minLength: 1
			},
			company: {
				type: "string",
				minLength: 1
			},
			email: { type: "string" }
		}
	},
	async handler(context, input) {
		return context.db.set("leads", input.id, input);
	}
});
//#endregion
//#region server/tools/create-task-for-lead.ts
var create_task_for_lead_default = defineTool({
	name: "create-task-for-lead",
	description: "Create a CodeBolt task associated with a lead.",
	inputSchema: {
		type: "object",
		additionalProperties: false,
		required: ["leadId", "title"],
		properties: {
			leadId: {
				type: "string",
				minLength: 1
			},
			title: {
				type: "string",
				minLength: 1
			}
		}
	},
	async handler(context, input) {
		if (!await context.db.get("leads", input.leadId)) throw new Error("LEAD_NOT_FOUND");
		return context.codebolt.tasks.create({
			title: input.title,
			entityType: "lead",
			entityId: input.leadId
		});
	}
});
//#endregion
//#region #codebolt/miniapp-tools
const tools = /* @__PURE__ */ new Map([["add-lead", add_lead_default], ["create-task-for-lead", create_task_for_lead_default]]);
//#endregion
//#region #codebolt/miniapp-tool-validators
const tool0 = validate10;
const func2 = (value) => {
	let length = 0;
	for (let index = 0; index < value.length; index += 1) {
		length += 1;
		const code = value.charCodeAt(index);
		if (code >= 55296 && code <= 56319 && index + 1 < value.length) {
			const next = value.charCodeAt(index + 1);
			if (next >= 56320 && next <= 57343) index += 1;
		}
	}
	return length;
};
function validate10(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) {
	let vErrors = null;
	let errors = 0;
	if (data && typeof data == "object" && !Array.isArray(data)) {
		if (data.id === void 0) {
			const err0 = {
				instancePath,
				schemaPath: "#/required",
				keyword: "required",
				params: { missingProperty: "id" },
				message: "must have required property 'id'"
			};
			if (vErrors === null) vErrors = [err0];
			else vErrors.push(err0);
			errors++;
		}
		if (data.name === void 0) {
			const err1 = {
				instancePath,
				schemaPath: "#/required",
				keyword: "required",
				params: { missingProperty: "name" },
				message: "must have required property 'name'"
			};
			if (vErrors === null) vErrors = [err1];
			else vErrors.push(err1);
			errors++;
		}
		if (data.company === void 0) {
			const err2 = {
				instancePath,
				schemaPath: "#/required",
				keyword: "required",
				params: { missingProperty: "company" },
				message: "must have required property 'company'"
			};
			if (vErrors === null) vErrors = [err2];
			else vErrors.push(err2);
			errors++;
		}
		for (const key0 in data) if (!(key0 === "id" || key0 === "name" || key0 === "company" || key0 === "email")) {
			const err3 = {
				instancePath,
				schemaPath: "#/additionalProperties",
				keyword: "additionalProperties",
				params: { additionalProperty: key0 },
				message: "must NOT have additional properties"
			};
			if (vErrors === null) vErrors = [err3];
			else vErrors.push(err3);
			errors++;
		}
		if (data.id !== void 0) {
			let data0 = data.id;
			if (typeof data0 === "string") {
				if (func2(data0) < 1) {
					const err4 = {
						instancePath: instancePath + "/id",
						schemaPath: "#/properties/id/minLength",
						keyword: "minLength",
						params: { limit: 1 },
						message: "must NOT have fewer than 1 characters"
					};
					if (vErrors === null) vErrors = [err4];
					else vErrors.push(err4);
					errors++;
				}
			} else {
				const err5 = {
					instancePath: instancePath + "/id",
					schemaPath: "#/properties/id/type",
					keyword: "type",
					params: { type: "string" },
					message: "must be string"
				};
				if (vErrors === null) vErrors = [err5];
				else vErrors.push(err5);
				errors++;
			}
		}
		if (data.name !== void 0) {
			let data1 = data.name;
			if (typeof data1 === "string") {
				if (func2(data1) < 1) {
					const err6 = {
						instancePath: instancePath + "/name",
						schemaPath: "#/properties/name/minLength",
						keyword: "minLength",
						params: { limit: 1 },
						message: "must NOT have fewer than 1 characters"
					};
					if (vErrors === null) vErrors = [err6];
					else vErrors.push(err6);
					errors++;
				}
			} else {
				const err7 = {
					instancePath: instancePath + "/name",
					schemaPath: "#/properties/name/type",
					keyword: "type",
					params: { type: "string" },
					message: "must be string"
				};
				if (vErrors === null) vErrors = [err7];
				else vErrors.push(err7);
				errors++;
			}
		}
		if (data.company !== void 0) {
			let data2 = data.company;
			if (typeof data2 === "string") {
				if (func2(data2) < 1) {
					const err8 = {
						instancePath: instancePath + "/company",
						schemaPath: "#/properties/company/minLength",
						keyword: "minLength",
						params: { limit: 1 },
						message: "must NOT have fewer than 1 characters"
					};
					if (vErrors === null) vErrors = [err8];
					else vErrors.push(err8);
					errors++;
				}
			} else {
				const err9 = {
					instancePath: instancePath + "/company",
					schemaPath: "#/properties/company/type",
					keyword: "type",
					params: { type: "string" },
					message: "must be string"
				};
				if (vErrors === null) vErrors = [err9];
				else vErrors.push(err9);
				errors++;
			}
		}
		if (data.email !== void 0) {
			if (typeof data.email !== "string") {
				const err10 = {
					instancePath: instancePath + "/email",
					schemaPath: "#/properties/email/type",
					keyword: "type",
					params: { type: "string" },
					message: "must be string"
				};
				if (vErrors === null) vErrors = [err10];
				else vErrors.push(err10);
				errors++;
			}
		}
	} else {
		const err11 = {
			instancePath,
			schemaPath: "#/type",
			keyword: "type",
			params: { type: "object" },
			message: "must be object"
		};
		if (vErrors === null) vErrors = [err11];
		else vErrors.push(err11);
		errors++;
	}
	validate10.errors = vErrors;
	return errors === 0;
}
const tool1 = validate11;
function validate11(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) {
	let vErrors = null;
	let errors = 0;
	if (data && typeof data == "object" && !Array.isArray(data)) {
		if (data.leadId === void 0) {
			const err0 = {
				instancePath,
				schemaPath: "#/required",
				keyword: "required",
				params: { missingProperty: "leadId" },
				message: "must have required property 'leadId'"
			};
			if (vErrors === null) vErrors = [err0];
			else vErrors.push(err0);
			errors++;
		}
		if (data.title === void 0) {
			const err1 = {
				instancePath,
				schemaPath: "#/required",
				keyword: "required",
				params: { missingProperty: "title" },
				message: "must have required property 'title'"
			};
			if (vErrors === null) vErrors = [err1];
			else vErrors.push(err1);
			errors++;
		}
		for (const key0 in data) if (!(key0 === "leadId" || key0 === "title")) {
			const err2 = {
				instancePath,
				schemaPath: "#/additionalProperties",
				keyword: "additionalProperties",
				params: { additionalProperty: key0 },
				message: "must NOT have additional properties"
			};
			if (vErrors === null) vErrors = [err2];
			else vErrors.push(err2);
			errors++;
		}
		if (data.leadId !== void 0) {
			let data0 = data.leadId;
			if (typeof data0 === "string") {
				if (func2(data0) < 1) {
					const err3 = {
						instancePath: instancePath + "/leadId",
						schemaPath: "#/properties/leadId/minLength",
						keyword: "minLength",
						params: { limit: 1 },
						message: "must NOT have fewer than 1 characters"
					};
					if (vErrors === null) vErrors = [err3];
					else vErrors.push(err3);
					errors++;
				}
			} else {
				const err4 = {
					instancePath: instancePath + "/leadId",
					schemaPath: "#/properties/leadId/type",
					keyword: "type",
					params: { type: "string" },
					message: "must be string"
				};
				if (vErrors === null) vErrors = [err4];
				else vErrors.push(err4);
				errors++;
			}
		}
		if (data.title !== void 0) {
			let data1 = data.title;
			if (typeof data1 === "string") {
				if (func2(data1) < 1) {
					const err5 = {
						instancePath: instancePath + "/title",
						schemaPath: "#/properties/title/minLength",
						keyword: "minLength",
						params: { limit: 1 },
						message: "must NOT have fewer than 1 characters"
					};
					if (vErrors === null) vErrors = [err5];
					else vErrors.push(err5);
					errors++;
				}
			} else {
				const err6 = {
					instancePath: instancePath + "/title",
					schemaPath: "#/properties/title/type",
					keyword: "type",
					params: { type: "string" },
					message: "must be string"
				};
				if (vErrors === null) vErrors = [err6];
				else vErrors.push(err6);
				errors++;
			}
		}
	} else {
		const err7 = {
			instancePath,
			schemaPath: "#/type",
			keyword: "type",
			params: { type: "object" },
			message: "must be object"
		};
		if (vErrors === null) vErrors = [err7];
		else vErrors.push(err7);
		errors++;
	}
	validate11.errors = vErrors;
	return errors === 0;
}
const validators = /* @__PURE__ */ new Map([["add-lead", tool0], ["create-task-for-lead", tool1]]);
//#endregion
//#region ../../packages/miniapp/src/runtime/tool-handler.ts
async function readJsonBody(event) {
	const text = await event.req.text();
	if (!text) return void 0;
	return JSON.parse(text);
}
function json(status, body) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "content-type": "application/json" }
	});
}
var tool_handler_default = defineHandler(async (event) => {
	try {
		const name = getRouterParam(event, "name");
		const tool = name ? tools.get(name) : void 0;
		if (!tool) return json(404, { error: "TOOL_NOT_FOUND" });
		const validate = validators.get(name);
		if (!validate) return json(500, { error: "TOOL_VALIDATOR_NOT_FOUND" });
		const input = await readJsonBody(event);
		if (!validate(input)) return json(400, {
			error: "INVALID_TOOL_INPUT",
			details: validate.errors
		});
		return { result: await tool.handler(useMiniApp(event), input) };
	} catch (error) {
		return json(500, {
			error: "TOOL_EXECUTION_FAILED",
			message: error instanceof Error ? error.message : String(error)
		});
	}
});
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = { "/index.html": {
	"type": "text/html; charset=utf-8",
	"etag": "\"a87-IZF7Tr9pBY/bCOAZBNBxMcJyUqM\"",
	"mtime": "2026-07-25T05:55:08.343Z",
	"size": 2695,
	"path": "../public/index.html"
} };
//#endregion
//#region #nitro/virtual/public-assets-node
function readAsset(id) {
	const serverDir = dirname(fileURLToPath(globalThis.__nitro_main__));
	return promises.readFile(resolve(serverDir, public_assets_data_default[id].path));
}
//#endregion
//#region #nitro/virtual/public-assets
const publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
function getAsset(id) {
	return public_assets_data_default[id];
}
//#endregion
//#region ../../node_modules/.pnpm/nitro@3.0.260610-beta_choki_fd8c0cdcd6696a03f99d65408a4a3a5b/node_modules/nitro/dist/runtime/internal/static.mjs
const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = {
	gzip: ".gz",
	br: ".br",
	zstd: ".zst"
};
var static_default = defineHandler((event) => {
	if (event.req.method && !METHODS.has(event.req.method)) return;
	let id = decodePath(withLeadingSlash(withoutTrailingSlash(event.url.pathname)));
	let asset;
	const encodings = [...(event.req.headers.get("accept-encoding") || "").split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(), ""];
	for (const encoding of encodings) for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
		const _asset = getAsset(_id);
		if (_asset) {
			asset = _asset;
			id = _id;
			break;
		}
	}
	if (!asset) {
		if (isPublicAssetURL(id)) {
			event.res.headers.delete("Cache-Control");
			throw new HTTPError({ status: 404 });
		}
		return;
	}
	if (encodings.length > 1) event.res.headers.append("Vary", "Accept-Encoding");
	if (event.req.headers.get("if-none-match") === asset.etag) {
		event.res.status = 304;
		event.res.statusText = "Not Modified";
		return "";
	}
	const ifModifiedSinceH = event.req.headers.get("if-modified-since");
	const mtimeDate = new Date(asset.mtime);
	if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
		event.res.status = 304;
		event.res.statusText = "Not Modified";
		return "";
	}
	if (asset.type) event.res.headers.set("Content-Type", asset.type);
	if (asset.etag && !event.res.headers.has("ETag")) event.res.headers.set("ETag", asset.etag);
	if (asset.mtime && !event.res.headers.has("Last-Modified")) event.res.headers.set("Last-Modified", mtimeDate.toUTCString());
	if (asset.encoding && !event.res.headers.has("Content-Encoding")) event.res.headers.set("Content-Encoding", asset.encoding);
	if (asset.size > 0 && !event.res.headers.has("Content-Length")) event.res.headers.set("Content-Length", asset.size.toString());
	return readAsset(id);
});
//#endregion
//#region #nitro/virtual/routing
const _lazy_NaZKu0 = defineLazyEventHandler(() => import("./_chunks/attachment.get.mjs"));
const _lazy_KoJ8yb = defineLazyEventHandler(() => import("./_chunks/attachment.post.mjs"));
const _lazy_KBLF3k = defineLazyEventHandler(() => import("./_chunks/cookie.get.mjs"));
const _lazy_q9CSxL = defineLazyEventHandler(() => import("./_chunks/crash.get.mjs"));
const _lazy_P3bC_T = defineLazyEventHandler(() => import("./_chunks/leads.get.mjs"));
const _lazy_BqPt9o = defineLazyEventHandler(() => import("./_chunks/leads.post.mjs"));
const _lazy_kpX0Uh = defineLazyEventHandler(() => import("./_chunks/slow.get.mjs"));
const _lazy_2Bvc8G = defineLazyEventHandler(() => import("./_chunks/tasks.get.mjs"));
const findRoute = /* @__PURE__ */ (() => {
	const $0 = {
		route: "/api/attachment",
		method: "get",
		handler: _lazy_NaZKu0
	}, $1 = {
		route: "/api/attachment",
		method: "post",
		handler: _lazy_KoJ8yb
	}, $2 = {
		route: "/api/cookie",
		method: "get",
		handler: _lazy_KBLF3k
	}, $3 = {
		route: "/api/crash",
		method: "get",
		handler: _lazy_q9CSxL
	}, $4 = {
		route: "/api/leads",
		method: "get",
		handler: _lazy_P3bC_T
	}, $5 = {
		route: "/api/leads",
		method: "post",
		handler: _lazy_BqPt9o
	}, $6 = {
		route: "/api/slow",
		method: "get",
		handler: _lazy_kpX0Uh
	}, $7 = {
		route: "/api/tasks",
		method: "get",
		handler: _lazy_2Bvc8G
	}, $8 = {
		route: "/__codebolt/tools/:name",
		method: "post",
		handler: toEventHandler(tool_handler_default)
	};
	return (m, p) => {
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		if (p === "/api/attachment") {
			if (m === "GET") return { data: $0 };
			if (m === "POST") return { data: $1 };
		} else if (p === "/api/cookie") {
			if (m === "GET") return { data: $2 };
		} else if (p === "/api/crash") {
			if (m === "GET") return { data: $3 };
		} else if (p === "/api/leads") {
			if (m === "GET") return { data: $4 };
			if (m === "POST") return { data: $5 };
		} else if (p === "/api/slow") {
			if (m === "GET") return { data: $6 };
		} else if (p === "/api/tasks") {
			if (m === "GET") return { data: $7 };
		}
		let s = p.split("/"), l = s.length;
		if (l > 1) {
			if (s[1] === "__codebolt") {
				if (l > 2) {
					if (s[2] === "tools") {
						if (l === 4 || l === 3) {
							if (m === "POST") {
								if (l > 3) return {
									data: $8,
									params: { "name": s[3] }
								};
							}
						}
					}
				}
			}
		}
	};
})();
const globalMiddleware = [toEventHandler(static_default)].filter(Boolean);
//#endregion
//#region ../../node_modules/.pnpm/nitro@3.0.260610-beta_choki_fd8c0cdcd6696a03f99d65408a4a3a5b/node_modules/nitro/dist/runtime/internal/error/prod.mjs
const errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new NodeResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
const errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~middleware"].push(...globalMiddleware);
	return h3App;
}
//#endregion
//#region ../../node_modules/.pnpm/nitro@3.0.260610-beta_choki_fd8c0cdcd6696a03f99d65408a4a3a5b/node_modules/nitro/dist/runtime/internal/app.mjs
const APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
//#endregion
//#region ../../node_modules/.pnpm/nitro@3.0.260610-beta_choki_fd8c0cdcd6696a03f99d65408a4a3a5b/node_modules/nitro/dist/runtime/internal/error/hooks.mjs
function _captureError(error, type) {
	console.error(`[${type}]`, error);
	useNitroApp().captureError?.(error, { tags: [type] });
}
function trapUnhandledErrors() {
	process.on("unhandledRejection", (error) => _captureError(error, "unhandledRejection"));
	process.on("uncaughtException", (error) => _captureError(error, "uncaughtException"));
}
//#endregion
//#region #nitro/virtual/tracing
const tracingSrvxPlugins = [];
//#endregion
//#region ../../node_modules/.pnpm/nitro@3.0.260610-beta_choki_fd8c0cdcd6696a03f99d65408a4a3a5b/node_modules/nitro/dist/presets/node/runtime/node-server.mjs
const _parsedPort = Number.parseInt(process.env.NITRO_PORT ?? process.env.PORT ?? "");
const port = Number.isNaN(_parsedPort) ? 3e3 : _parsedPort;
const host = process.env.NITRO_HOST || process.env.HOST;
const cert = process.env.NITRO_SSL_CERT;
const key = process.env.NITRO_SSL_KEY;
const nitroApp = useNitroApp();
serve({
	port,
	hostname: host,
	tls: cert && key ? {
		cert,
		key
	} : void 0,
	fetch: nitroApp.fetch,
	plugins: [...tracingSrvxPlugins]
});
trapUnhandledErrors();
var node_server_default = {};
//#endregion
export { node_server_default as default };
