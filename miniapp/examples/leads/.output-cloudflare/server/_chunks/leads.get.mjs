import { r as defineHandler } from "../_libs/h3+rou3+srvx.mjs";
import { n as useMiniApp } from "./src.mjs";
//#region server/api/leads.get.ts
var leads_get_default = defineHandler((event) => useMiniApp(event).db.list("leads"));
//#endregion
export { leads_get_default as default };
