import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Code2, GitCompare, Lightbulb } from 'lucide-react';

interface MetricsDashboardProps {
  analysis: {
    lineCount: {
      cobol: number;
      java: number;
    };
    variables: {
      cobol: string[];
      java: string[];
    };
    suggestions: string[];
  };
}

const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ analysis }) => {
  const lineData = [
    {
      name: 'Lines of Code',
      COBOL: analysis.lineCount.cobol,
      Java: analysis.lineCount.java,
    },
  ];

  return (
    <div className="bg-cyber-gray rounded-lg p-4 space-y-4">
      <h2 className="text-xl font-bold text-cyber-blue flex items-center gap-2">
        <GitCompare className="w-6 h-6" />
        Code Analysis
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Code Metrics Chart */}
        <div className="bg-cyber-dark p-4 rounded-lg">
          <h3 className="text-lg mb-4 flex items-center gap-2">
            <Code2 className="text-cyber-blue" />
            Code Comparison
          </h3>
          <div className="h-[200px] w-full flex items-center justify-center">
            <BarChart width={300} height={200} data={lineData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a1a1a',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#fff'
                }}
              />
              <Legend />
              <Bar dataKey="COBOL" fill="#00f6ff" />
              <Bar dataKey="Java" fill="#ff00ff" />
            </BarChart>
          </div>
        </div>

        {/* Variable Mapping */}
        <div className="bg-cyber-dark p-4 rounded-lg">
          <h3 className="text-lg mb-4">Variable Mapping</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-cyber-blue font-semibold mb-2">COBOL Variables</h4>
              <ul className="space-y-1">
                {analysis.variables.cobol.map(v => (
                  <li key={v} className="text-sm">{v}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-cyber-pink font-semibold mb-2">Java Variables</h4>
              <ul className="space-y-1">
                {analysis.variables.java.map(v => (
                  <li key={v} className="text-sm">{v}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <div className="lg:col-span-2 bg-cyber-dark p-4 rounded-lg">
          <h3 className="text-lg mb-4 flex items-center gap-2">
            <Lightbulb className="text-cyber-pink" />
            Optimization Suggestions
          </h3>
          <ul className="space-y-2">
            {analysis.suggestions.map((suggestion, index) => (
              <li key={index} className="text-cyber-blue text-sm flex items-start gap-2">
                <span className="text-cyber-pink">•</span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MetricsDashboard;