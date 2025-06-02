import { translateToJava } from './openai';

export interface CodeAnalysis {
  lineCount: {
    cobol: number;
    java: number;
  };
  variables: {
    cobol: string[];
    java: string[];
  };
  suggestions: string[];
}

async function generateOptimizationSuggestions(cobolCode: string, javaCode: string): Promise<string[]> {
  const prompt = `
Analyze this code translation from COBOL to Java and provide specific optimization suggestions.
Consider:
- Code quality
- Performance improvements
- Modern Java practices
- Error handling
- Testing considerations

COBOL Code:
${cobolCode}

Java Translation:
${javaCode}

Provide 3-5 specific, actionable suggestions for improving this code. Return only the suggestions, one per line.
`;

  try {
    const response = await translateToJava(prompt, '');
    // Splits the response into individual suggestions
    const suggestions = response.javaCode
      .split('\n')
      .filter(line => line.trim().length > 0)
      .slice(0, 5); // Limit to 5 suggestions

    return suggestions;
  } catch (error) {
    console.error('Failed to generate suggestions:', error);
    return [
      'Consider adding input validation',
      'Implement logging for better error tracking',
      'Consider using try-with-resources for file operations'
    ];
  }
}

export async function analyzeCode(cobolCode: string, javaCode: string): Promise<CodeAnalysis> {
  const suggestions = await generateOptimizationSuggestions(cobolCode, javaCode);
  
  return {
    lineCount: {
      cobol: cobolCode.split('\n').filter(line => line.trim()).length,
      java: javaCode.split('\n').filter(line => line.trim()).length,
    },
    variables: {
      cobol: extractCobolVariables(cobolCode),
      java: extractJavaVariables(javaCode),
    },
    suggestions
  };
}

function extractCobolVariables(code: string): string[] {
  const variables = new Set<string>();
  const lines = code.split('\n');
  
  for (const line of lines) {
    const matches = line.match(/\b\d{2}\s+(\w+-\w+)/g);
    if (matches) {
      matches.forEach(match => {
        const variable = match.split(/\s+/)[1];
        variables.add(variable);
      });
    }
  }
  
  return Array.from(variables);
}

function extractJavaVariables(code: string): string[] {
  const variables = new Set<string>();
  const lines = code.split('\n');
  
  for (const line of lines) {
    const matches = line.match(/\b(?:int|double|String|boolean)\s+(\w+)\s*=/g);
    if (matches) {
      matches.forEach(match => {
        const variable = match.split(/\s+/)[1];
        variables.add(variable);
      });
    }
  }
  
  return Array.from(variables);
}