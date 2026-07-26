import { defineHandler } from "nitro/h3";

export default defineHandler(() => ({
  documents: [
    {
      id: "sample-1",
      name: "Maya Patel",
      company: "Northstar Labs",
      email: "maya@northstar.example",
    },
    {
      id: "sample-2",
      name: "Sam Rivera",
      company: "Orbit CRM",
    },
  ],
}));
