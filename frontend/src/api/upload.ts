import { fetchWithAuth } from './client';

export interface ProjectFileResponse {
  id: number;
  projectId: number;
  fileType: string;
  filePath: string;
  originalFileName: string | null;
  fileSize: number;
  uploadedAt: string;
}

export const uploadApi = {
  uploadProjectFile: async (file: File, projectId: number, fileType: string): Promise<ProjectFileResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetchWithAuth(`/api/Download/upload?projectId=${projectId}&fileType=${fileType}`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Сессия истекла — войдите в систему заново');
      }
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || 'Ошибка загрузки файла');
    }
    return res.json();
  },

  uploadProjectFiles: async (files: File[], projectId: number, fileType: string): Promise<ProjectFileResponse[]> => {
    const results: ProjectFileResponse[] = [];
    for (const file of files) {
      const result = await uploadApi.uploadProjectFile(file, projectId, fileType);
      results.push(result);
    }
    return results;
  },

  getProjectFiles: async (projectId: number): Promise<ProjectFileResponse[]> => {
    const res = await fetchWithAuth(`/api/Download/project/${projectId}`);
    if (!res.ok) return [];
    return res.json();
  },

  deleteFile: async (fileId: number): Promise<void> => {
    const res = await fetchWithAuth(`/api/Download/files/${fileId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Ошибка удаления файла');
  },

  uploadImage: async (file: File, projectId?: number): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const query = projectId !== undefined ? `?projectId=${projectId}` : '';
    const res = await fetchWithAuth(`/api/Upload/image${query}`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Сессия истекла — войдите в систему заново');
      }
      const err = await res.json().catch(() => null);
      throw new Error(typeof err === 'string' ? err : err?.title || 'Ошибка загрузки изображения');
    }
    const data = await res.json();
    return data.url as string;
  },

  uploadImages: async (files: File[], projectId?: number): Promise<string[]> => {
    const results: string[] = [];
    for (const file of files) {
      results.push(await uploadApi.uploadImage(file, projectId));
    }
    return results;
  },
};
