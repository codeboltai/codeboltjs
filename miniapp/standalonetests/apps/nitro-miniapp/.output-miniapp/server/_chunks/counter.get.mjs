import { r as defineHandler } from "../_libs/h3+rou3+srvx.mjs";
import { t as useMiniApp } from "./runtime.mjs";
//#region server/api/counter.get.ts
var counter_get_default = defineHandler(async (event) => {
	return await useMiniApp(event).db.get("state", "counter") ?? {
		id: "counter",
		value: 0
	};
});
//#endregion
export { counter_get_default as default };
