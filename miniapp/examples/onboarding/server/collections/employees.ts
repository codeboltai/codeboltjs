import { defineCollection } from "@codebolt/miniapp-sdk";

export default defineCollection({
  name: "employees",
  schema: {
    type: "object",
    required: ["id", "name", "role", "completed"],
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      role: { type: "string" },
      completed: { type: "array", items: { type: "string" } },
    },
  },
});
