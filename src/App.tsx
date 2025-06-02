import { useState } from 'react';
import { Terminal, Code2, FileCode, Download, Loader } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { translateToJava } from './services/openai';
import MetricsDashboard from './components/MetricsDashboard';
import { analyzeCode, type CodeAnalysis } from './services/codeAnalysis';
import { TestGeneration } from './components/TestGeneration';
import { BatchProcessor } from './components/BatchProcessor';

export default function App() {
  const [cobolCode, setCobolCode] = useState('      * Enter your COBOL code here');
  const [userStory, setUserStory] = useState('');
  const [javaCode, setJavaCode] = useState('// Java code will appear here after translation');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [analysis, setAnalysis] = useState<CodeAnalysis>({
    lineCount: { cobol: 0, java: 0 },
    variables: { cobol: [], java: [] },
    suggestions: [],
  });

  const handleTranslate = async () => {
    setIsTranslating(true);
    setError(null);
    try {
      const result = await translateToJava(cobolCode, userStory);
      setJavaCode(result.javaCode);
      const codeAnalysis = await analyzeCode(cobolCode, result.javaCode); // Now awaiting the analysis
      setAnalysis(codeAnalysis);
      setRetryCount(0);
    } catch (error: any) {
      console.error('Translation failed:', error);
      if (error.message?.includes('Rate limit')) {
        setRetryCount(prev => prev + 1);
      }
      setError(error instanceof Error ? error.message : 'Translation failed. Please try again.');
      setJavaCode('// Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([javaCode], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = 'translated-code.java';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-cyber-dark text-white">
      {/* Header */}
      <header className="border-b border-cyber-blue/30 p-4">
        <div className="container mx-auto flex items-center gap-2">
          <Terminal className="text-cyber-blue" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyber-blue to-cyber-pink bg-clip-text text-transparent">
            COBOL Modernization Platform
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="bg-cyber-gray rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Code2 className="text-cyber-blue" />
                <h2 className="text-lg font-semibold">COBOL Code</h2>
              </div>
              <Editor
                height="300px"
                defaultLanguage="cobol"
                value={cobolCode}
                onChange={(value) => setCobolCode(value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                }}
              />
            </div>

            <div className="bg-cyber-gray rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-2">User Story</h2>
              <textarea
                className="w-full h-32 bg-cyber-dark border border-cyber-blue/30 rounded p-2 text-white"
                value={userStory}
                onChange={(e) => setUserStory(e.target.value)}
                placeholder="Describe the purpose of this code to improve translation accuracy..."
              />
            </div>

            <button
              onClick={handleTranslate}
              disabled={isTranslating}
              className={`w-full py-2 px-4 rounded flex items-center justify-center gap-2 ${
                isTranslating
                  ? 'bg-cyber-gray text-gray-500'
                  : 'bg-cyber-blue hover:bg-cyber-blue/80 text-cyber-dark'
              } font-semibold transition-colors`}
            >
              {isTranslating ? (
                <>
                  <Loader className="animate-spin" size={16} />
                  {retryCount > 0 ? `Retrying (${retryCount}/5)...` : 'Translating...'}
                </>
              ) : (
                'Translate to Java'
              )}
            </button>

            {error && (
              <div className={`rounded p-2 ${
                error.includes('Rate limit')
                  ? 'bg-yellow-500/20 border border-yellow-500 text-yellow-300'
                  : 'bg-red-500/20 border border-red-500 text-red-300'
              }`}>
                <div className="flex items-center gap-2">
                  {error.includes('Rate limit') && <Loader className="animate-spin" size={16} />}
                  {error}
                </div>
              </div>
            )}
          </div>

          {/* Output Section */}
          <div className="bg-cyber-gray rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileCode className="text-cyber-pink" />
                <h2 className="text-lg font-semibold">Java Code</h2>
              </div>
              <button
                onClick={handleDownload}
                className="text-cyber-pink hover:text-cyber-pink/80 transition-colors"
                title="Download Java code"
              >
                <Download />
              </button>
            </div>
            <Editor
              height="400px"
              defaultLanguage="java"
              value={javaCode}
              theme="vs-dark"
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 14,
              }}
            />
          </div>
        </div>

        {/* Metrics Dashboard */}
        {javaCode && javaCode !== '// Java code will appear here after translation' && 
         javaCode !== '// Translation failed. Please try again.' && (
          <MetricsDashboard analysis={analysis} />
        )}

        {/* Test Generation */}
        {javaCode && javaCode !== '// Java code will appear here after translation' && 
         javaCode !== '// Translation failed. Please try again.' && (
          <TestGeneration 
            cobolCode={cobolCode}
            javaCode={javaCode}
          />
        )}

        {/* Batch Processing */}
        <BatchProcessor />
      </main>
    </div>
  );
}