import { r as defineHandler } from "../_libs/h3+rou3+srvx.mjs";
//#region server/api/crash.get.ts
var crash_get_default = defineHandler(() => {
	process.exit(17);
});
//#endregion
export { crash_get_default as default };
