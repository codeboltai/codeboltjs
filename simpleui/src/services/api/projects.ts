import apiClient from './client';
import type { Project } from '@/types';

export interface ServerProject {
  id?: string;
  name: string;
  projectPath: string;
  description?: string;
  techStack?: string[];
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  config?: Record<string, unknown>;
}

const mapServerProject = (serverProject: ServerProject): Project => ({
  id: serverProject.id || serverProject.projectPath,
  name: serverProject.name,
  description: serverProject.description || '',
  techStack: serverProject.techStack || [],
  agentCount: 0,
  taskCount: 0,
  fileCount: 0,
  lastActivity: serverProject.updatedAt || new Date().toISOString(),
  status: mapProjectStatus(serverProject.status),
  progress: 0,
  createdAt: serverProject.createdAt || new Date().toISOString(),
});

const mapProjectStatus = (status?: string): Project['status'] => {
  if (!status) return 'active';
  const statusMap: Record<string, Project['status']> = {
    'active': 'active',
    'running': 'active',
    'paused': 'paused',
    'stopped': 'paused',
    'archived': 'archived',
  };
  return statusMap[status.toLowerCase()] || 'active';
};

export const projectsApi = {
  async getProjects(): Promise<Project[]> {
    try {
      const response = await apiClient.get<ServerProject[]>('/project/all');
      return (response.data || []).map(mapServerProject);
    } catch {
      return [];
    }
  },

  async getActiveProject(): Promise<{ projectPath: string | null; projectName: string | null }> {
    const response = await apiClient.get('/project/active');
    return response.data;
  },

  async getProjectConfig(): Promise<Record<string, unknown>> {
    const response = await apiClient.get('/project/config');
    return response.data;
  },

  async createProject(request: { name: string; description?: string; template?: string }): Promise<Project> {
    const response = await apiClient.post<ServerProject>('/project/createproject', {
      name: request.name,
      description: request.description,
      template: request.template,
    });
    return mapServerProject(response.data);
  },

  async setActiveProject(projectPath: string): Promise<void> {
    await apiClient.post('/project/setActive', { projectPath });
  },

  async updateProjectConfig(config: Record<string, unknown>): Promise<void> {
    await apiClient.post('/project/updateProjectConfig', config);
  },

  async resetProject(): Promise<void> {
    await apiClient.post('/project/resetProject');
  },

  async getTaskGroups(): Promise<unknown[]> {
    const response = await apiClient.get('/project/taskGroups');
    return response.data;
  },

  async createTaskGroup(name: string, color?: string): Promise<unknown> {
    const response = await apiClient.post('/project/taskGroups', { name, color });
    return response.data;
  },

  async getProjectThreads(): Promise<unknown[]> {
    const response = await apiClient.get('/project/getProjectThreads');
    return response.data;
  },
};

export default projectsApi;
