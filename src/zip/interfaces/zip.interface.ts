export enum ZipJobStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface ZipJob {
  jobId: string;
  userId: string;
  folderId: string;
  status: ZipJobStatus;
  progress: number;
  totalFiles: number;
  processedFiles: number;
  url?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ZipRequest {
  folderId: string;
  userId: string;
}

export interface ZipStatusResponse {
  status: ZipJobStatus;
  progress: number;
  url?: string;
  error?: string;
}

export interface ZipFile {
  fileId: string;
  fileName: string;
  filePath: string;
  size: number;
}