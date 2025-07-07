// src/zip/types/job-progress.type.ts

export interface ZipJobProgress {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  totalFiles: number;
  processedFiles: number;
  error?: string;
  result?: {
    downloadUrl: string;
    expiresAt: Date;
  };
}
