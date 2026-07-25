import { a as getQuery, r as defineHandler } from "../_libs/h3+rou3+srvx.mjs";
import { n as useMiniApp } from "./src.mjs";
//#region server/api/attachment.get.ts
var attachment_get_default = defineHandler(async (event) => {
	const key = String(getQuery(event).key ?? "");
	const blob = await useMiniApp(event).blob.get(key);
	if (!blob) return {
		key,
		found: false
	};
	return {
		key,
		found: true,
		contentType: blob.contentType,
		content: new TextDecoder().decode(blob.data)
	};
});
//#endregion
export { attachment_get_default as default };
