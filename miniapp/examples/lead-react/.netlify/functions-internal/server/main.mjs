globalThis.__nitro_main__ = import.meta.url;
import { a as defineLazyEventHandler, c as NodeResponse, i as defineHandler, n as HTTPError, o as getRouterParam, s as toEventHandler, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
//#region ../../packages/miniapp/src/index.ts
function defineTool(definition) {
	return {
		kind: "tool",
		...definition
	};
}
const runtimeSymbol = Symbol.for("codebolt.miniapp.runtime");
function decodeClaims(token) {
	const payload = token.split(".")[1];
	if (!payload) throw new Error("INVALID_EXECUTION_TOKEN");
	const normalized = payload.replaceAll("-", "+").replaceAll("_", "/");
	const binary = atob(normalized);
	const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
	return JSON.parse(new TextDecoder().decode(bytes));
}
function remoteBridge(event) {
	const token = event.req.headers.get("x-codebolt-execution-token") ?? event.req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
	const processEnvironment = globalThis.process?.env;
	const workerEnvironment = globalThis.__env__;
	const cloudUrl = event.req.headers.get("x-codebolt-cloud-url") ?? event.req.headers.get("x-codebolt-capability-url") ?? processEnvironment?.CODEBOLT_CLOUD_URL ?? workerEnvironment?.CODEBOLT_CLOUD_URL;
	if (!token || !cloudUrl) throw new Error("Remote MiniApp execution context is unavailable.");
	const claims = decodeClaims(token);
	const principal = claims.principal ?? {
		userId: claims.userId,
		roles: claims.roles ?? []
	};
	return {
		getContext: () => ({
			miniAppId: claims.miniAppId,
			installId: claims.installId,
			workspaceId: claims.workspaceId,
			principal
		}),
		async call(capability, input) {
			const response = await fetch(`${cloudUrl.replace(/\/$/, "")}/capabilities/${encodeURIComponent(capability)}`, {
				method: "POST",
				headers: {
					authorization: `Bearer ${token}`,
					"content-type": "application/json"
				},
				body: JSON.stringify(input)
			});
			if (!response.ok) throw new Error(`CLOUD_CAPABILITY_FAILED:${response.status}`);
			return response.json();
		}
	};
}
function getBridge(event) {
	const bridge = globalThis[runtimeSymbol];
	if (bridge) return bridge;
	if (event) return remoteBridge(event);
	throw new Error("MiniApp runtime context is unavailable.");
}
function useMiniApp(event) {
	const bridge = getBridge(event);
	return {
		...bridge.getContext(),
		db: {
			get: (collection, id) => bridge.call("db.get", {
				collection,
				id
			}),
			getMany: (collection, ids) => bridge.call("db.getMany", {
				collection,
				ids
			}),
			set: (collection, id, document) => bridge.call("db.set", {
				collection,
				id,
				document
			}),
			setMany: (collection, documents) => bridge.call("db.setMany", {
				collection,
				documents
			}),
			delete: (collection, id) => bridge.call("db.delete", {
				collection,
				id
			}),
			deleteMany: (collection, ids) => bridge.call("db.deleteMany", {
				collection,
				ids
			}),
			list: (collection, options = {}) => bridge.call("db.list", {
				collection,
				options
			})
		},
		blob: {
			get: (key) => bridge.call("blob.get", { key }),
			put: (key, data, options = {}) => bridge.call("blob.put", {
				key,
				data,
				options
			}),
			delete: (key) => bridge.call("blob.delete", { key }),
			list: (options = {}) => bridge.call("blob.list", { options })
		},
		codebolt: { tasks: {
			create: (input) => bridge.call("tasks.create", input),
			list: (filter = {}) => bridge.call("tasks.list", filter),
			count: (filter = {}) => bridge.call("tasks.count", filter)
		} }
	};
}
//#endregion
//#region server/tools/add-lead.ts
var add_lead_default = defineTool({
	name: "add-lead",
	description: "Store a lead from the React MiniApp.",
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
	handler: (context, input) => context.db.set("leads", input.id, input)
});
//#endregion
//#region #codebolt/miniapp-tools
const tools = /* @__PURE__ */ new Map([["add-lead", add_lead_default]]);
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
const validators = /* @__PURE__ */ new Map([["add-lead", tool0]]);
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
//#region #nitro/virtual/routing
const _lazy_b40Vmc = defineLazyEventHandler(() => import("./_chunks/leads.get.mjs"));
const _lazy_2zFCy8 = defineLazyEventHandler(() => import("./_chunks/renderer-template.mjs"));
const findRoute = /* @__PURE__ */ (() => {
	const $0 = {
		route: "/api/leads",
		method: "get",
		handler: _lazy_b40Vmc
	}, $1 = {
		route: "/__codebolt/tools/:name",
		method: "post",
		handler: toEventHandler(tool_handler_default)
	}, $2 = {
		route: "/**",
		handler: _lazy_2zFCy8
	};
	return (m, p) => {
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		if (p === "/api/leads") {
			if (m === "GET") return { data: $0 };
		}
		let s = p.split("/"), l = s.length;
		if (l > 1) {
			if (s[1] === "__codebolt") {
				if (l > 2) {
					if (s[2] === "tools") {
						if (l === 4 || l === 3) {
							if (m === "POST") {
								if (l > 3) return {
									data: $1,
									params: { "name": s[3] }
								};
							}
						}
					}
				}
			}
		}
		return {
			data: $2,
			params: { "_": s.slice(1).join("/") }
		};
	};
})();
[].filter(Boolean);
//#endregion
//#region ../../node_modules/.pnpm/nitro@3.0.260610-beta_choki_988da32690cb3768a9f6445545defc8a/node_modules/nitro/dist/runtime/internal/error/prod.mjs
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
	return h3App;
}
//#endregion
//#region ../../node_modules/.pnpm/nitro@3.0.260610-beta_choki_988da32690cb3768a9f6445545defc8a/node_modules/nitro/dist/runtime/internal/app.mjs
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
//#region ../../node_modules/.pnpm/nitro@3.0.260610-beta_choki_988da32690cb3768a9f6445545defc8a/node_modules/nitro/dist/presets/netlify/runtime/netlify.mjs
const nitroApp = useNitroApp();
const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60;
const handler = async (req) => {
	req.runtime ??= { name: "netlify" };
	req.ip ??= req.headers.get("x-nf-client-connection-ip") || void 0;
	const response = await nitroApp.fetch(req);
	const isr = (req.context?.routeRules || {})?.isr?.options;
	if (isr) {
		const maxAge = typeof isr === "number" ? isr : ONE_YEAR_IN_SECONDS;
		const revalidateDirective = typeof isr === "number" ? `stale-while-revalidate=${ONE_YEAR_IN_SECONDS}` : "must-revalidate";
		if (!response.headers.has("Cache-Control")) response.headers.set("Cache-Control", "public, max-age=0, must-revalidate");
		response.headers.set("Netlify-CDN-Cache-Control", `public, max-age=${maxAge}, ${revalidateDirective}, durable`);
	}
	return response;
};
//#endregion
export { handler as default };
