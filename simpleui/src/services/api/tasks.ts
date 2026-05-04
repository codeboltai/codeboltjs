import apiClient from './client';
import type { Task, TaskStatus } from '@/types';

export interface TaskCreateRequest {
  title: string;
  description?: string;
  priority?: 'urgent' | 'high' | 'medium' | 'low';
  assignedTo?: string;
  tags?: string[];
  projectId?: string;
  needsApproval?: boolean;
  dueDate?: string;
}

export interface TaskUpdateRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: 'urgent' | 'high' | 'medium' | 'low';
  assignedTo?: string;
  tags?: string[];
  dueDate?: string;
}

export interface TaskSearchRequest {
  query?: string;
  status?: TaskStatus;
  priority?: string;
  agentId?: string;
  projectPath?: string;
}

export interface ServerTask {
  taskId: string;
  name: string;
  description?: string;
  status: string;
  priority?: string;
  assignedTo?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  projectPath?: string;
  parentId?: string;
  children?: ServerTask[];
}

const mapServerTask = (serverTask: ServerTask): Task => ({
  id: serverTask.taskId,
  title: serverTask.name,
  description: serverTask.description,
  status: mapTaskStatus(serverTask.status),
  priority: (serverTask.priority as Task['priority']) || 'medium',
  tags: serverTask.tags || [],
  createdAt: serverTask.createdAt,
  updatedAt: serverTask.updatedAt,
  dueDate: serverTask.dueDate,
  projectId: serverTask.projectPath,
  needsApproval: false,
  assignedAgent: serverTask.assignedTo ? {
    id: serverTask.assignedTo,
    name: serverTask.assignedTo,
    role: '',
    status: 'idle',
    model: '',
    tasksCompleted: 0,
    lastHeartbeat: new Date().toISOString(),
    uptime: '0h',
    capabilities: [],
  } : undefined,
});

const mapTaskStatus = (serverStatus: string): TaskStatus => {
  const statusMap: Record<string, TaskStatus> = {
    'pending': 'inbox',
    'todo': 'inbox',
    'assigned': 'assigned',
    'in_progress': 'in_progress',
    'in-progress': 'in_progress',
    'running': 'in_progress',
    'testing': 'testing',
    'review': 'review',
    'completed': 'done',
    'done': 'done',
    'failed': 'archived',
    'archived': 'archived',
  };
  return statusMap[serverStatus.toLowerCase()] || 'inbox';
};

const mapClientStatus = (clientStatus: TaskStatus): string => {
  const statusMap: Record<TaskStatus, string> = {
    'inbox': 'pending',
    'assigned': 'assigned',
    'in_progress': 'in_progress',
    'testing': 'testing',
    'review': 'review',
    'done': 'completed',
    'archived': 'archived',
  };
  return statusMap[clientStatus];
};

export const tasksApi = {
  async getTasks(): Promise<Task[]> {
    const response = await apiClient.get<{ tasks: ServerTask[] }>('/tasks/project/current');
    return response.data.tasks?.map(mapServerTask) || [];
  },

  async getTaskById(taskId: string): Promise<Task> {
    const response = await apiClient.get<ServerTask>(`/tasks/${taskId}`);
    return mapServerTask(response.data);
  },

  async createTask(request: TaskCreateRequest): Promise<Task> {
    const response = await apiClient.post<ServerTask>('/tasks', {
      name: request.title,
      description: request.description,
      priority: request.priority || 'medium',
      assignedTo: request.assignedTo,
      tags: request.tags,
      projectPath: request.projectId,
      dueDate: request.dueDate,
    });
    return mapServerTask(response.data);
  },

  async updateTask(taskId: string, request: TaskUpdateRequest): Promise<Task> {
    const response = await apiClient.put<ServerTask>(`/tasks/${taskId}`, {
      name: request.title,
      description: request.description,
      status: request.status ? mapClientStatus(request.status) : undefined,
      priority: request.priority,
      assignedTo: request.assignedTo,
      tags: request.tags,
      dueDate: request.dueDate,
    });
    return mapServerTask(response.data);
  },

  async deleteTask(taskId: string): Promise<void> {
    await apiClient.delete(`/tasks/${taskId}`);
  },

  async searchTasks(request: TaskSearchRequest): Promise<Task[]> {
    const params = new URLSearchParams();
    if (request.query) params.append('q', request.query);
    if (request.status) params.append('status', mapClientStatus(request.status));
    if (request.priority) params.append('priority', request.priority);
    if (request.agentId) params.append('agentId', request.agentId);
    
    const response = await apiClient.get<{ tasks: ServerTask[] }>(`/tasks/search?${params.toString()}`);
    return response.data.tasks?.map(mapServerTask) || [];
  },

  async getStatistics() {
    const response = await apiClient.get('/tasks/statistics/overview');
    return response.data;
  },

  async markInProgress(taskId: string): Promise<Task> {
    const response = await apiClient.put<ServerTask>(`/tasks/${taskId}/status/in-progress`);
    return mapServerTask(response.data);
  },

  async markCompleted(taskId: string): Promise<Task> {
    const response = await apiClient.put<ServerTask>(`/tasks/${taskId}/status/completed`);
    return mapServerTask(response.data);
  },

  async markFailed(taskId: string): Promise<Task> {
    const response = await apiClient.put<ServerTask>(`/tasks/${taskId}/status/failed`);
    return mapServerTask(response.data);
  },

  async addChildTask(parentId: string, request: TaskCreateRequest): Promise<Task> {
    const response = await apiClient.post<ServerTask>(`/tasks/${parentId}/children`, {
      name: request.title,
      description: request.description,
    });
    return mapServerTask(response.data);
  },

  async getChildTasks(parentId: string): Promise<Task[]> {
    const response = await apiClient.get<{ children: ServerTask[] }>(`/tasks/${parentId}/children`);
    return response.data.children?.map(mapServerTask) || [];
  },
};

export default tasksApi;
