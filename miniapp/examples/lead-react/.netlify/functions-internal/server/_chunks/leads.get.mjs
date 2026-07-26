import { i as defineHandler } from "../_libs/h3+rou3+srvx.mjs";
//#region server/api/leads.get.ts
var leads_get_default = defineHandler(() => ({ documents: [{
	id: "sample-1",
	name: "Maya Patel",
	company: "Northstar Labs",
	email: "maya@northstar.example"
}, {
	id: "sample-2",
	name: "Sam Rivera",
	company: "Orbit CRM"
}] }));
//#endregion
export { leads_get_default as default };
