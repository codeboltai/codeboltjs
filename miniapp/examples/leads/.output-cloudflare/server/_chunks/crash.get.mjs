import { r as defineHandler } from "../_libs/h3+rou3+srvx.mjs";
import processModule from "node:process";
//#region server/api/crash.get.ts
var crash_get_default = defineHandler(() => {
	processModule.exit(17);
});
//#endregion
export { crash_get_default as default };
