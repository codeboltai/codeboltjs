// History API types

export interface HistoryEntry {
  id: string;
  agentId: string;
  action: string;
  data?: Record<string, unknown>;
  timestamp: string;
}
