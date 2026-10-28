import { defineTool } from "@codebolt/miniapp";

type AddItemInput = { id: string; title: string };

export default defineTool<AddItemInput>({
  name: "add-item",
  description: "Add an item to the shared MiniApp list.",
  inputSchema: {
    type: "object",
    additionalProperties: false,
    required: ["id", "title"],
    properties: {
      id: { type: "string", minLength: 1 },
      title: { type: "string", minLength: 1 },
    },
  },
  async handler(context, input) {
    const item = {
      id: input.id,
      title: input.title.trim(),
      createdAt: new Date().toISOString(),
    };
    return context.db.set("items", item.id, item);
  },
});
