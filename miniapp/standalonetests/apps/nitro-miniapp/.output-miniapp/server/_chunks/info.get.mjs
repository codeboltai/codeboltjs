import { r as defineHandler } from "../_libs/h3+rou3+srvx.mjs";
import { t as useMiniApp } from "./runtime.mjs";
//#region server/api/info.get.ts
var info_get_default = defineHandler((event) => ({
	title: "Nitro MiniApp",
	instance: useMiniApp(event).instance
}));
//#endregion
export { info_get_default as default };
