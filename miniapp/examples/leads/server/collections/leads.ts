import { defineCollection } from "@codebolt/miniapp";

export default defineCollection({
  name: "leads",
  schema: {
    type: "object",
    required: ["id", "name", "company"],
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      company: { type: "string" },
      email: { type: "string" },
    },
  },
});

