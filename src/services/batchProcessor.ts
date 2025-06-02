import { translateToJava } from './openai';

export interface BatchJob {
  id: string;
  fileName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  cobolCode: string;
  javaCode?: string;
  error?: string;
  userStory?: string;
}

export interface BatchStats {
  total: number;
  completed: number;
  failed: number;
  inProgress: number;
  averageProcessingTime: number;
}

const processingTimes: number[] = [];

export async function processBatchJob(job: BatchJob): Promise<BatchJob> {
  try {
    const startTime = Date.now();
    
    const result = await translateToJava(job.cobolCode, job.userStory || '');
    
    const endTime = Date.now();
    processingTimes.push(endTime - startTime);

    return {
      ...job,
      status: 'completed',
      javaCode: result.javaCode
    };
  } catch (error: any) {
    return {
      ...job,
      status: 'failed',
      error: error.message
    };
  }
}

export function calculateBatchStats(jobs: BatchJob[]): BatchStats {
  return {
    total: jobs.length,
    completed: jobs.filter(j => j.status === 'completed').length,
    failed: jobs.filter(j => j.status === 'failed').length,
    inProgress: jobs.filter(j => j.status === 'processing').length,
    averageProcessingTime: processingTimes.length ? 
      processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length : 
      0
  };
}