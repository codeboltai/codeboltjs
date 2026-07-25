import { r as defineHandler, s as readBody } from "../_libs/h3+rou3+srvx.mjs";
import { n as useMiniApp } from "./src.mjs";
//#region server/api/leads.post.ts
var leads_post_default = defineHandler(async (event) => {
	const input = await readBody(event);
	const id = input.id || crypto.randomUUID();
	return useMiniApp(event).db.set("leads", id, {
		name: input.name,
		company: input.company,
		email: input.email
	});
});
//#endregion
export { leads_post_default as default };
