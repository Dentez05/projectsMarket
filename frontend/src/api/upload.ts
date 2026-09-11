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
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`/api/Download/upload?projectId=${projectId}&fileType=${fileType}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) {
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
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/Download/project/${projectId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) return [];
    return res.json();
  },

  deleteFile: async (fileId: number): Promise<void> => {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/Download/files/${fileId}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Ошибка удаления файла');
  },
};
