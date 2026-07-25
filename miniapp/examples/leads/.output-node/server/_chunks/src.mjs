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
	const cloudUrl = processEnvironment?.CODEBOLT_CLOUD_URL ?? workerEnvironment?.CODEBOLT_CLOUD_URL;
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
export { useMiniApp as n, defineTool as t };
