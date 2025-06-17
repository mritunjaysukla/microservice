export interface ZipJob {
  jobId: string;
  folderId: string;
  status: ZipJobStatus;
  url?: string;
  error?: string;
  progress: number;
  totalFiles: number;
  processedFiles: number;
}

export enum ZipJobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
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