import { fileURLToPath } from "node:url";
import { createMiniAppHost } from "./index.mjs";

const rootDir = fileURLToPath(new URL("../../..", import.meta.url));
const host = await createMiniAppHost({
  rootDir,
  port: Number(process.env.PORT) || 4310,
});
const urls = await host.listen();

console.log(`MiniApp host listening on one port: ${urls.port}`);
console.log(`Leads: ${urls.leads}`);
console.log(`React Leads: ${urls.leadReact}`);
console.log(`Onboarding: ${urls.onboarding}`);

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, async () => {
    await host.close();
    process.exit(0);
  });
}
