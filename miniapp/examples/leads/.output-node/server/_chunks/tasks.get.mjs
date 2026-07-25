import { a as getQuery, r as defineHandler } from "../_libs/h3+rou3+srvx.mjs";
import { n as useMiniApp } from "./src.mjs";
//#region server/api/tasks.get.ts
var tasks_get_default = defineHandler(async (event) => {
	const { leadId } = getQuery(event);
	return { count: await useMiniApp(event).codebolt.tasks.count({
		entityType: "lead",
		entityId: String(leadId || "")
	}) };
});
//#endregion
export { tasks_get_default as default };
