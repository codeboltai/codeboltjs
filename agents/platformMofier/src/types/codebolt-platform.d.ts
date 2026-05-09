declare module '@codebolt/agent/unified' {
  export const InitialPromptGenerator: any;
  export const AgentStep: any;
  export const ResponseExecutor: any;
}

declare module '@codebolt/agent/processor-pieces' {
  export const ChatHistoryMessageModifier: any;
  export const EnvironmentContextModifier: any;
  export const DirectoryContextModifier: any;
  export const IdeContextModifier: any;
  export const CoreSystemPromptModifier: any;
  export const ToolInjectionModifier: any;
  export const AtFileProcessorModifier: any;
}
