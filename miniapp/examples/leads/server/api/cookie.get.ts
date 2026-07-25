import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  const headers = new Headers({ "content-type": "application/json" });
  headers.append(
    "set-cookie",
    "lead-session=one; Domain=localhost; Path=/; HttpOnly",
  );
  headers.append(
    "set-cookie",
    "lead-preference=compact; Domain=localhost; Path=/",
  );
  return new Response(JSON.stringify({ ok: true }), { headers });
});
