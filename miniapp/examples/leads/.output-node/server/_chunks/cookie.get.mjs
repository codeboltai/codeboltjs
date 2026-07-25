import { r as defineHandler } from "../_libs/h3+rou3+srvx.mjs";
//#region server/api/cookie.get.ts
var cookie_get_default = defineHandler(() => {
	const headers = new Headers({ "content-type": "application/json" });
	headers.append("set-cookie", "lead-session=one; Domain=localhost; Path=/; HttpOnly");
	headers.append("set-cookie", "lead-preference=compact; Domain=localhost; Path=/");
	return new Response(JSON.stringify({ ok: true }), { headers });
});
//#endregion
export { cookie_get_default as default };
