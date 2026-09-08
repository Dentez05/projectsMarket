import { api } from './client';

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
  uploadFile: (file: File, projectId?: number) =>
    api.upload('/Upload', file, projectId ? { projectId: String(projectId) } : undefined),

  uploadImage: (file: File, projectId?: number) =>
    api.upload('/Upload/image', file, projectId ? { projectId: String(projectId) } : undefined),

  getProjectFiles: (projectId: number) =>
    api.get<ProjectFileResponse[]>(`/Download/project/${projectId}`),

  uploadProjectFile: (file: File, projectId: number, fileType: string) =>
    api.upload('/Download/upload', file, { projectId: String(projectId), fileType }),
};
