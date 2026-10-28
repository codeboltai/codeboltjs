import { r as defineHandler } from "../_libs/h3+rou3+srvx.mjs";
import { t as useMiniApp } from "./runtime.mjs";
//#region server/api/counter/increment.post.ts
var increment_post_default = defineHandler(async (event) => {
	const db = useMiniApp(event).db;
	const current = await db.get("state", "counter");
	return db.set("state", "counter", { value: Number(current?.value ?? 0) + 1 });
});
//#endregion
export { increment_post_default as default };
