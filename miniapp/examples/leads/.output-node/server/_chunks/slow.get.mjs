import { a as getQuery, r as defineHandler } from "../_libs/h3+rou3+srvx.mjs";
//#region server/api/slow.get.ts
var slow_get_default = defineHandler(async (event) => {
	const milliseconds = Math.min(Number(getQuery(event).ms) || 100, 5e3);
	await new Promise((resolve) => setTimeout(resolve, milliseconds));
	return { waited: milliseconds };
});
//#endregion
export { slow_get_default as default };
