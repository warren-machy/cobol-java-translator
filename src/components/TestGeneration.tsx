import React, { useState } from 'react';
import { FileText, CheckCircle, XCircle, Download, Code2, AlertTriangle, Terminal } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { generateTestCases, generateJUnitTests, type TestCase } from '../services/testGenerator';

interface TestGenerationProps {
  cobolCode: string;
  javaCode: string;
}

export const TestGeneration: React.FC<TestGenerationProps> = ({ cobolCode, javaCode }) => {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [junitTests, setJUnitTests] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      // Generate test cases
      const cases = await generateTestCases(cobolCode, javaCode);
      setTestCases(cases);
      
      // Extract class name from Java code
      const classMatch = javaCode.match(/class\s+(\w+)/);
      const className = classMatch ? classMatch[1] : 'GeneratedClass';
      
      // Generate JUnit tests
      const tests = await generateJUnitTests(className, cases);
      setJUnitTests(tests);
    } catch (error: any) {
      console.error('Failed to generate tests:', error);
      setError(error.message || 'Failed to generate test cases');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([junitTests], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'GeneratedTests.java';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
  };

  return (
    <div className="bg-cyber-gray rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-cyber-blue flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Test Generation
        </h2>
        {junitTests && (
          <button
            onClick={handleDownload}
            className="text-cyber-pink hover:text-cyber-pink/80 transition-colors"
            title="Download JUnit Tests"
          >
            <Download className="w-6 h-6" />
          </button>
        )}
      </div>

      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className={`w-full py-2 px-4 rounded flex items-center justify-center gap-2 ${
          isGenerating
            ? 'bg-cyber-gray text-gray-500'
            : 'bg-cyber-pink hover:bg-cyber-pink/80 text-white'
        } font-semibold transition-colors`}
      >
        {isGenerating ? (
          <>
            <Terminal className="animate-spin" size={16} />
            Generating Test Cases...
          </>
        ) : (
          'Generate Test Cases'
        )}
      </button>

      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded p-2 text-red-300 flex items-center gap-2">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Test Cases */}
        <div className="bg-cyber-dark p-4 rounded-lg">
          <h3 className="text-lg mb-4 flex items-center gap-2">
            <Code2 className="text-cyber-blue" />
            Generated Test Cases
          </h3>
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {testCases.map((test, index) => (
              <div key={index} className="bg-cyber-gray/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  {test.passed ? (
                    <CheckCircle className="text-green-400" size={16} />
                  ) : (
                    <XCircle className="text-red-400" size={16} />
                  )}
                  <span className="text-cyber-blue font-semibold">
                    {test.description}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    test.testType === 'normal' ? 'bg-blue-500/20 text-blue-300' :
                    test.testType === 'boundary' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {test.testType}
                  </span>
                </div>
                <div className="text-sm space-y-2">
                  <div>
                    <span className="text-gray-400">Input:</span>
                    <pre className="text-cyber-pink mt-1 overflow-x-auto p-2 bg-black/30 rounded">
                      {JSON.stringify(test.input, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <span className="text-gray-400">Expected Output:</span>
                    <pre className="text-cyber-blue mt-1 overflow-x-auto p-2 bg-black/30 rounded">
                      {JSON.stringify(test.expectedOutput, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* JUnit Tests */}
        <div className="bg-cyber-dark p-4 rounded-lg">
          <h3 className="text-lg mb-4 flex items-center gap-2">
            <FileText className="text-cyber-pink" />
            Generated JUnit Tests
          </h3>
          <Editor
            height="600px"
            defaultLanguage="java"
            value={junitTests}
            theme="vs-dark"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on'
            }}
          />
        </div>
      </div>
    </div>
  );
};