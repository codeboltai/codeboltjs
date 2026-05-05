import apiClient from './client';
import type { FileItem, VersionSnapshot } from '@/types';

export interface ServerFileItem {
  name: string;
  path: string;
  type: 'file' | 'directory' | 'folder';
  extension?: string;
  size?: number;
  modifiedTime?: string;
  children?: ServerFileItem[];
}

const mapServerFile = (serverFile: ServerFileItem): FileItem => ({
  id: serverFile.path,
  name: serverFile.name,
  path: serverFile.path,
  type: serverFile.type === 'directory' || serverFile.type === 'folder' ? 'folder' : 'file',
  extension: serverFile.extension,
  size: serverFile.size,
  lastModified: serverFile.modifiedTime || new Date().toISOString(),
  children: serverFile.children?.map(mapServerFile),
});

export const filesApi = {
  async getFileTree(projectPath?: string): Promise<FileItem[]> {
    try {
      const response = await apiClient.get<ServerFileItem[]>('/file/tree', {
        params: { projectPath }
      });
      return (response.data || []).map(mapServerFile);
    } catch {
      return [];
    }
  },

  async readFile(path: string): Promise<{ content: string; language: string }> {
    const response = await apiClient.get('/fileread/read', {
      params: { path }
    });
    return response.data;
  },

  async getFileInfo(path: string): Promise<FileItem> {
    const response = await apiClient.get<ServerFileItem>('/file/info', {
      params: { path }
    });
    return mapServerFile(response.data);
  },

  async createFile(path: string, content?: string): Promise<void> {
    await apiClient.post('/file/create', { path, content });
  },

  async createFolder(path: string): Promise<void> {
    await apiClient.post('/file/create-folder', { path });
  },

  async deleteFile(path: string): Promise<void> {
    await apiClient.delete('/file/delete', { params: { path } });
  },

  async renameFile(oldPath: string, newPath: string): Promise<void> {
    await apiClient.post('/file/rename', { oldPath, newPath });
  },

  async copyFile(source: string, destination: string): Promise<void> {
    await apiClient.post('/file/copy', { source, destination });
  },

  async downloadFile(path: string): Promise<Blob> {
    const response = await apiClient.get('/file/download', {
      params: { path },
      responseType: 'blob'
    });
    return response.data;
  },

  async searchFiles(query: string, projectPath?: string): Promise<FileItem[]> {
    try {
      const response = await apiClient.get<ServerFileItem[]>('/file/search', {
        params: { query, projectPath }
      });
      return (response.data || []).map(mapServerFile);
    } catch {
      return [];
    }
  },
};

export const historyApi = {
  async getVersionHistory(projectPath?: string): Promise<VersionSnapshot[]> {
    try {
      const response = await apiClient.get('/history/list', {
        params: { projectPath }
      });
      return response.data || [];
    } catch {
      return [];
    }
  },

  async getVersion(versionId: string): Promise<{ files: Record<string, string> }> {
    const response = await apiClient.get(`/history/${versionId}`);
    return response.data;
  },

  async restoreVersion(versionId: string): Promise<void> {
    await apiClient.post(`/history/${versionId}/restore`);
  },

  async getDiff(versionId: string): Promise<unknown> {
    const response = await apiClient.get(`/history/${versionId}/diff`);
    return response.data;
  },
};

export default filesApi;
