import { defineCollection } from "@codebolt/miniapp";

export default defineCollection({
  name: "items",
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["id", "title", "createdAt"],
    properties: {
      id: { type: "string", minLength: 1 },
      title: { type: "string", minLength: 1 },
      createdAt: { type: "string" },
    },
  },
});
