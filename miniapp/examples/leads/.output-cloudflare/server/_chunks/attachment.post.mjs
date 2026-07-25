import { r as defineHandler, s as readBody } from "../_libs/h3+rou3+srvx.mjs";
import { n as useMiniApp } from "./src.mjs";
//#region server/api/attachment.post.ts
var attachment_post_default = defineHandler(async (event) => {
	const input = await readBody(event);
	const data = new TextEncoder().encode(String(input.content ?? ""));
	await useMiniApp(event).blob.put(input.key, data, { contentType: input.contentType || "text/plain" });
	return {
		key: input.key,
		size: data.byteLength
	};
});
//#endregion
export { attachment_post_default as default };
