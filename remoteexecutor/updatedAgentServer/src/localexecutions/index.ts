export { ReadFileHandler } from "./file/readFileHandler";
export { WriteFileHandler } from "./file/writeFileHandler";
export { ToolHandler } from "./toolHandler";
export { PermissionManager, PermissionUtils } from "./PermissionManager";
export type {
  PermissionScope,
  PermissionRule,
  PermissionPolicy,
  TrustedFolder,
  PermissionStorage
} from "./PermissionManager";

// Re-export from localActionExecutor
export { executeActionOnMessage, AgentMessage } from "./localActionExecutor";
