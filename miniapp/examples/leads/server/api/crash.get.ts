import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  process.exit(17);
});
