import { defineHandler, getQuery } from "nitro/h3";

export default defineHandler(async (event) => {
  const ms = Number(getQuery(event).ms ?? 500);
  await new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    event.req.signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new DOMException("Request cancelled", "AbortError"));
      },
      { once: true },
    );
  });
  return { completed: true };
});
