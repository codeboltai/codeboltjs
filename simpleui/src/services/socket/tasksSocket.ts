import { Socket } from 'socket.io-client';
import wsManager from './WebSocketManager';
import { useTasksStore } from '@/stores';
import type { Task, TaskStatus } from '@/types';

type TaskEventCallback = (data: unknown) => void;

class TasksSocket {
  private socket: Socket | null = null;
  private eventListeners: Map<string, TaskEventCallback[]> = new Map();

  connect(): void {
    if (this.socket?.connected) return;

    this.socket = wsManager.connect('tasks-socket');

    this.socket.on('connect', () => {
      console.log('[TasksSocket] Connected');
      this.requestAllTasks();
    });

    this.socket.on('initial', (data: any) => {
      this.handleInitial(data);
    });

    this.socket.on('taskAdded', (data: any) => {
      this.handleTaskAdded(data);
    });

    this.socket.on('taskUpdated', (data: any) => {
      this.handleTaskUpdated(data);
    });

    this.socket.on('taskDeleted', (data: any) => {
      this.handleTaskDeleted(data);
    });

    this.socket.on('allTasks', (data: any) => {
      this.handleAllTasks(data);
    });

    this.socket.on('subtaskAdded', (data: any) => {
      this.handleSubtaskAdded(data);
    });

    this.socket.on('subtaskUpdated', (data: any) => {
      this.handleSubtaskUpdated(data);
    });

    this.socket.on('subtaskDeleted', (data: any) => {
      this.handleSubtaskDeleted(data);
    });

    this.socket.on('error', (data: any) => {
      console.error('[TasksSocket] Error:', data);
      useTasksStore.getState().setError(data.message || 'Unknown error');
      this.emit('error', data);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private mapServerTask(serverTask: any): Task {
    return {
      id: serverTask.taskId || serverTask.id,
      title: serverTask.name || serverTask.title,
      description: serverTask.description,
      status: this.mapStatus(serverTask.status),
      priority: serverTask.priority || 'medium',
      assignedAgent: serverTask.agentId ? {
        id: serverTask.agentId,
        name: serverTask.agentId,
        role: '',
        status: 'idle',
        model: '',
        tasksCompleted: 0,
        lastHeartbeat: new Date().toISOString(),
        uptime: '0h',
        capabilities: [],
      } : undefined,
      tags: serverTask.tags || [],
      createdAt: serverTask.createdAt || new Date().toISOString(),
      updatedAt: serverTask.updatedAt || new Date().toISOString(),
      needsApproval: false,
    };
  }

  private mapStatus(status: string): TaskStatus {
    const statusMap: Record<string, TaskStatus> = {
      'pending': 'inbox',
      'todo': 'inbox',
      'assigned': 'assigned',
      'in_progress': 'in_progress',
      'in-progress': 'in_progress',
      'testing': 'testing',
      'review': 'review',
      'completed': 'done',
      'done': 'done',
      'archived': 'archived',
    };
    return statusMap[status?.toLowerCase()] || 'inbox';
  }

  private handleInitial(data: any): void {
    if (data.tasks) {
      const tasks = data.tasks.map(this.mapServerTask.bind(this));
      useTasksStore.getState().setTasks(tasks);
    }
    this.emit('initial', data);
  }

  private handleTaskAdded(data: any): void {
    const task = this.mapServerTask(data.data || data);
    useTasksStore.getState().addTask(task);
    this.emit('task_added', task);
  }

  private handleTaskUpdated(data: any): void {
    const task = this.mapServerTask(data.data || data);
    useTasksStore.getState().updateTask(task.id, task);
    this.emit('task_updated', task);
  }

  private handleTaskDeleted(data: any): void {
    const taskId = data.taskId || data.data?.taskId;
    if (taskId) {
      useTasksStore.getState().removeTask(taskId);
    }
    this.emit('task_deleted', data);
  }

  private handleAllTasks(data: any): void {
    if (data.tasks) {
      const tasks = data.tasks.map(this.mapServerTask.bind(this));
      useTasksStore.getState().setTasks(tasks);
    }
    this.emit('all_tasks', data);
  }

  private handleSubtaskAdded(data: any): void {
    this.emit('subtask_added', data);
  }

  private handleSubtaskUpdated(data: any): void {
    this.emit('subtask_updated', data);
  }

  private handleSubtaskDeleted(data: any): void {
    this.emit('subtask_deleted', data);
  }

  requestAllTasks(filters?: { agentId?: string; category?: string; phase?: string }): void {
    if (this.socket?.connected) {
      this.socket.emit('message', JSON.stringify({
        action: 'getTasks',
        ...filters
      }));
    }
  }

  addTask(task: { title: string; description?: string; priority?: string; agentId?: string }): void {
    if (this.socket?.connected) {
      this.socket.emit('message', JSON.stringify({
        action: 'addTask',
        task: {
          title: task.title,
          description: task.description,
          priority: task.priority,
        },
        agentId: task.agentId || 'default-agent'
      }));
    }
  }

  updateTask(taskId: string, updates: Partial<Task>): void {
    if (this.socket?.connected) {
      this.socket.emit('message', JSON.stringify({
        action: 'updateTask',
        taskId,
        updates
      }));
    }
  }

  deleteTask(taskId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('message', JSON.stringify({
        action: 'deleteTask',
        taskId
      }));
    }
  }

  addSubTask(taskId: string, subtask: { title: string; description?: string }): void {
    if (this.socket?.connected) {
      this.socket.emit('message', JSON.stringify({
        action: 'addSubTask',
        taskId,
        task: subtask
      }));
    }
  }

  updateSubTask(taskId: string, subtaskId: string, updates: Record<string, unknown>): void {
    if (this.socket?.connected) {
      this.socket.emit('message', JSON.stringify({
        action: 'updateSubTask',
        taskId,
        subtaskId,
        updates
      }));
    }
  }

  deleteSubTask(taskId: string, subtaskId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('message', JSON.stringify({
        action: 'deleteSubTask',
        taskId,
        subtaskId
      }));
    }
  }

  getTasksByAgent(agentId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('message', JSON.stringify({
        action: 'getTasksByAgent',
        agentId
      }));
    }
  }

  getTasksByCategory(category: string): void {
    if (this.socket?.connected) {
      this.socket.emit('message', JSON.stringify({
        action: 'getTasksByCategory',
        category
      }));
    }
  }

  createTasksFromMarkdown(markdown: string, phase?: string, category?: string): void {
    if (this.socket?.connected) {
      this.socket.emit('message', JSON.stringify({
        action: 'createTasksFromMarkdown',
        markdown,
        phase,
        category
      }));
    }
  }

  exportTasksToMarkdown(phase?: string, agentId?: string, category?: string): void {
    if (this.socket?.connected) {
      this.socket.emit('message', JSON.stringify({
        action: 'exportTasksToMarkdown',
        phase,
        agentId,
        category
      }));
    }
  }

  on(event: string, callback: TaskEventCallback): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: TaskEventCallback): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      this.eventListeners.set(event, listeners.filter(cb => cb !== callback));
    }
  }

  private emit(event: string, data: unknown): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(cb => cb(data));
    }
  }
}

export const tasksSocket = new TasksSocket();
export default tasksSocket;
