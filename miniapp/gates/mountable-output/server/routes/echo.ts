import { defineHandler, readBody } from "nitro/h3";

export default defineHandler(async (event) => {
  return {
    method: event.req.method,
    pathname: new URL(event.req.url).pathname,
    query: Object.fromEntries(new URL(event.req.url).searchParams),
    header: event.req.headers.get("x-gate"),
    body: await readBody(event),
  };
});
