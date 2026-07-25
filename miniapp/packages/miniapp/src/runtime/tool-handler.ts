import { defineHandler, getRouterParam } from "nitro/h3";
import { useMiniApp } from "../index";
import { tools } from "#codebolt/miniapp-tools";
import { validators } from "#codebolt/miniapp-tool-validators";

async function readJsonBody(event: { req: Request }) {
  const text = await event.req.text();
  if (!text) return undefined;
  return JSON.parse(text);
}

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export default defineHandler(async (event) => {
  try {
    const name = getRouterParam(event, "name");
    const tool = name ? tools.get(name) : undefined;
    if (!tool) {
      return json(404, { error: "TOOL_NOT_FOUND" });
    }

    const validate = validators.get(name);
    if (!validate) {
      return json(500, { error: "TOOL_VALIDATOR_NOT_FOUND" });
    }

    const input = await readJsonBody(event);
    if (!validate(input)) {
      return json(400, {
        error: "INVALID_TOOL_INPUT",
        details: validate.errors,
      });
    }
    return { result: await tool.handler(useMiniApp(event), input) };
  } catch (error) {
    return json(500, {
      error: "TOOL_EXECUTION_FAILED",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});
