// Terminal Processes API types

export interface TerminalProcess {
  id: string;
  command: string;
  pid?: number;
  status: 'running' | 'stopped' | 'error';
  startedAt: string;
  stoppedAt?: string;
}
