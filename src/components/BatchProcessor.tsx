import React, { useState, useRef } from 'react';
import { Upload, List, AlertCircle, Download, ChevronRight, Clock, CheckCircle, XCircle } from 'lucide-react';
import { BatchJob, BatchStats, processBatchJob, calculateBatchStats } from '../services/batchProcessor';

export const BatchProcessor: React.FC = () => {
  const [jobs, setJobs] = useState<BatchJob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState<BatchStats>({
    total: 0,
    completed: 0,
    failed: 0,
    inProgress: 0,
    averageProcessingTime: 0
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newJobs: BatchJob[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const content = await file.text();
      newJobs.push({
        id: Math.random().toString(36).substring(7),
        fileName: file.name,
        status: 'pending',
        cobolCode: content,
        userStory: 'Batch processing job'
      });
    }

    const updatedJobs = [...jobs, ...newJobs];
    setJobs(updatedJobs);
    setStats(calculateBatchStats(updatedJobs));
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processFiles = async () => {
    setIsProcessing(true);
    const pendingJobs = jobs.filter(job => job.status === 'pending');
    let currentJobs = [...jobs];
    
    for (let job of pendingJobs) {
      currentJobs = currentJobs.map(j =>
        j.id === job.id ? { ...j, status: 'processing' } : j
      );
      setJobs(currentJobs);
      setStats(calculateBatchStats(currentJobs));

      try {
        const startTime = Date.now();
        const processedJob = await processBatchJob(job);
        const processingTime = Date.now() - startTime;

        currentJobs = currentJobs.map(j =>
          j.id === job.id ? { 
            ...processedJob, 
            processingTime 
          } : j
        );
        setJobs(currentJobs);
        
        const updatedStats = calculateBatchStats(currentJobs);
        setStats(updatedStats);
      } catch (error: any) {
        currentJobs = currentJobs.map(j =>
          j.id === job.id ? { 
            ...j, 
            status: 'failed', 
            error: error.message 
          } : j
        );
        setJobs(currentJobs);
        setStats(calculateBatchStats(currentJobs));
      }
    }
    
    setIsProcessing(false);
  };

  const downloadSingleResult = (job: BatchJob) => {
    if (job.javaCode) {
      const blob = new Blob([job.javaCode], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${job.fileName.replace('.cob', '')}.java`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const downloadAllResults = () => {
    const completedJobs = jobs.filter(job => job.status === 'completed');
    const results = completedJobs.map(job => ({
      fileName: job.fileName,
      javaCode: job.javaCode
    }));

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'batch-results.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-cyber-gray rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-cyber-blue flex items-center gap-2">
          <List className="w-6 h-6" />
          Batch Processing
        </h2>
        {jobs.some(job => job.status === 'completed') && (
          <button
            onClick={downloadAllResults}
            className="text-cyber-pink hover:text-cyber-pink/80 transition-colors"
            title="Download All Results"
          >
            <Download className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-cyber-dark p-4 rounded-lg">
          <div className="text-sm text-gray-400">Total Jobs</div>
          <div className="text-2xl text-cyber-blue">{stats.total}</div>
        </div>
        <div className="bg-cyber-dark p-4 rounded-lg">
          <div className="text-sm text-gray-400">Completed</div>
          <div className="text-2xl text-green-400">{stats.completed}</div>
        </div>
        <div className="bg-cyber-dark p-4 rounded-lg">
          <div className="text-sm text-gray-400">Failed</div>
          <div className="text-2xl text-red-400">{stats.failed}</div>
        </div>
        <div className="bg-cyber-dark p-4 rounded-lg">
          <div className="text-sm text-gray-400">Avg. Time</div>
          <div className="text-2xl text-cyber-pink">
            {Math.round(stats.averageProcessingTime / 1000)}s
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="bg-cyber-blue hover:bg-cyber-blue/80 text-cyber-dark px-4 py-2 rounded cursor-pointer">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".cob,.cbl,.cobol"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Upload className="inline mr-2" size={16} />
          Upload COBOL Files
        </label>

        <button
          onClick={processFiles}
          disabled={isProcessing || jobs.filter(j => j.status === 'pending').length === 0}
          className={`px-4 py-2 rounded flex items-center gap-2 ${
            isProcessing || jobs.filter(j => j.status === 'pending').length === 0
              ? 'bg-cyber-gray text-gray-500'
              : 'bg-cyber-pink hover:bg-cyber-pink/80 text-white'
          }`}
        >
          <ChevronRight size={16} />
          Process Files
        </button>
      </div>

      {/* Job List */}
      <div className="bg-cyber-dark rounded-lg p-4">
        <h3 className="text-lg mb-4">Processing Queue</h3>
        {jobs.length === 0 ? (
          <div className="text-gray-500 flex items-center gap-2">
            <AlertCircle size={16} />
            No files in queue
          </div>
        ) : (
          <div className="space-y-2">
            {jobs.map(job => (
              <div key={job.id} 
                className="flex items-center justify-between border-b border-gray-700 pb-2">
                <div className="flex items-center gap-2">
                  {job.status === 'completed' && <CheckCircle size={16} className="text-green-400" />}
                  {job.status === 'failed' && <XCircle size={16} className="text-red-400" />}
                  {job.status === 'processing' && <Clock size={16} className="text-yellow-400" />}
                  {job.status === 'pending' && <AlertCircle size={16} className="text-gray-400" />}
                  <span>{job.fileName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-sm ${
                    job.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                    job.status === 'failed' ? 'bg-red-500/20 text-red-300' :
                    job.status === 'processing' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-gray-500/20 text-gray-300'
                  }`}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    {job.error && ` - ${job.error}`}
                  </span>
                  {job.status === 'completed' && (
                    <button
                      onClick={() => downloadSingleResult(job)}
                      className="text-cyber-pink hover:text-cyber-pink/80 transition-colors ml-2"
                      title="Download Java code"
                    >
                      <Download size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};