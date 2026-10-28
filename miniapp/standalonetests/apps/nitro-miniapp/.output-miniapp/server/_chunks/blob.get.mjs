import { a as getQuery, r as defineHandler } from "../_libs/h3+rou3+srvx.mjs";
import { t as useMiniApp } from "./runtime.mjs";
//#region server/api/blob.get.ts
var blob_get_default = defineHandler(async (event) => {
	const key = String(getQuery(event).key ?? "note.txt");
	const blob = await useMiniApp(event).blob.get(key);
	if (!blob) return null;
	return {
		key: blob.key,
		value: new TextDecoder().decode(blob.data),
		contentType: blob.contentType
	};
});
//#endregion
export { blob_get_default as default };
