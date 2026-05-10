import '@codebolt/codeboltjs';

interface PlatformEventQueue {
  getPendingExternalEventCount?: () => number;
  getPendingExternalEvents?: () => unknown[];
  waitForAnyExternalEvent?: () => Promise<unknown>;
}

interface PlatformAgentTracker {
  getRunningAgentCount?: () => number;
}

interface PlatformSideExecution {
  startWithActionBlock: (
    actionBlockPath: string,
    params: unknown,
    timeoutMs: number,
  ) => Promise<{ success?: boolean; error?: string; result?: unknown }>;
}

interface ActionBlockThreadContext {
  params?: unknown;
}

declare module '@codebolt/codeboltjs' {
  interface Codebolt {
    agentEventQueue?: PlatformEventQueue;
    backgroundChildThreads?: PlatformAgentTracker;
    sideExecution: PlatformSideExecution;
    onActionBlockInvocation: (
      handler: (threadContext: ActionBlockThreadContext) => Promise<unknown> | unknown,
    ) => void;
  }
}
