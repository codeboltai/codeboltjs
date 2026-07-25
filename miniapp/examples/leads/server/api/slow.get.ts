import { defineHandler, getQuery } from "nitro/h3";

export default defineHandler(async (event) => {
  const milliseconds = Math.min(Number(getQuery(event).ms) || 100, 5_000);
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
  return { waited: milliseconds };
});
