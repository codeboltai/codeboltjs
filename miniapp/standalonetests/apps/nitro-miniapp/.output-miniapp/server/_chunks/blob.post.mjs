import { o as readBody, r as defineHandler } from "../_libs/h3+rou3+srvx.mjs";
import { t as useMiniApp } from "./runtime.mjs";
//#region server/api/blob.post.ts
var blob_post_default = defineHandler(async (event) => {
	const body = await readBody(event);
	const key = body.key ?? "note.txt";
	await useMiniApp(event).blob.put(key, new TextEncoder().encode(body.value ?? "hello from Nitro"), { contentType: "text/plain; charset=utf-8" });
	return {
		stored: true,
		key
	};
});
//#endregion
export { blob_post_default as default };
