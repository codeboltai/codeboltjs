// Event Log API types

export interface EventLogInstance {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEventLogInstanceRequest {
  name: string;
  description?: string;
}

export interface UpdateEventLogInstanceRequest {
  name?: string;
  description?: string;
}

export interface EventLogEvent {
  id: string;
  instanceId: string;
  type: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export interface CreateEventLogEventRequest {
  instanceId: string;
  type: string;
  data: Record<string, unknown>;
}

export interface EventLogQueryRequest {
  instanceId: string;
  type?: string;
  startTime?: string;
  endTime?: string;
  limit?: number;
  offset?: number;
}
