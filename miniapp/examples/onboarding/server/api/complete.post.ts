import { useMiniApp } from "@codebolt/miniapp-sdk";
import { defineHandler, readBody } from "nitro/h3";

export default defineHandler(async (event) => {
  const input = await readBody(event);
  const context = useMiniApp(event);
  const employee = await context.db.get("employees", input.employeeId);
  if (!employee) return new Response("Not found", { status: 404 });
  const completed = [...new Set([...(employee.completed as string[]), input.step])];
  return context.db.set("employees", input.employeeId, { ...employee, completed });
});
