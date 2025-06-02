import { translateToJava } from './openai';

interface CobolVariable {
  name: string;
  type: string;
  pic: string;
  length: number;
  isDecimal?: boolean;
  decimalPlaces?: number;
}

export interface TestCase {
  input: {
    data: Record<string, any>;
    workingStorage: Record<string, any>;
    parameters: Record<string, any>;
  };
  expectedOutput: {
    data: Record<string, any>;
    status: {
      code: 'SUCCESS' | 'ERROR';
      message: string;
    };
  };
  description: string;
  testType: 'normal' | 'boundary' | 'error';
  passed: boolean;
}

export async function generateTestCases(cobolCode: string, javaCode: string): Promise<Array<TestCase>> {
  const prompt = `
Analyze this COBOL code and generate structured test cases following this exact format for each test:
{
  "input": {
    "data": {
      // Business input fields
    },
    "workingStorage": {
      // Working storage variables
    },
    "parameters": {
      // Any parameters or configurations
    }
  },
  "expectedOutput": {
    "data": {
      // Expected output fields
    },
    "status": {
      "code": "SUCCESS" | "ERROR",
      "message": "description if needed"
    }
  },
  "description": "Clear description of the test case",
  "testType": "normal" | "boundary" | "error",
  "passed": boolean
}

COBOL Code:
${cobolCode}

Java Code:
${javaCode}

Generate test cases covering:
1. Normal business scenarios with realistic values
2. Boundary conditions testing limits
3. Error cases for validation failures
4. Special business rule cases

Return only a JSON array of test cases.`;

  try {
    const response = await translateToJava(prompt, '');
    let jsonStr = response.javaCode
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    try {
      const testCases = JSON.parse(jsonStr);
      if (!Array.isArray(testCases)) {
        throw new Error('Response is not an array');
      }
      return testCases.map(validateTestCase);
    } catch (parseError) {
      console.warn('Falling back to generated test cases');
      return generateStructuredTestCases(cobolCode);
    }
  } catch (error) {
    console.error('Test generation failed:', error);
    return generateStructuredTestCases(cobolCode);
  }
}

function validateTestCase(testCase: any): TestCase {
  const defaultCase: TestCase = {
    input: {
      data: {},
      workingStorage: {},
      parameters: {}
    },
    expectedOutput: {
      data: {},
      status: {
        code: 'SUCCESS',
        message: ''
      }
    },
    description: 'Default test case',
    testType: 'normal',
    passed: false
  };

  // Deep merge provided test case with default structure
  return {
    input: {
      data: testCase.input?.data || {},
      workingStorage: testCase.input?.workingStorage || {},
      parameters: testCase.input?.parameters || {}
    },
    expectedOutput: {
      data: testCase.expectedOutput?.data || {},
      status: {
        code: testCase.expectedOutput?.status?.code || 'SUCCESS',
        message: testCase.expectedOutput?.status?.message || ''
      }
    },
    description: testCase.description || defaultCase.description,
    testType: testCase.testType || defaultCase.testType,
    passed: Boolean(testCase.passed)
  };
}

function parseCobolVariables(cobolCode: string): Array<CobolVariable> {
  const variables: Array<CobolVariable> = [];
  const lines = cobolCode.split('\n');

  lines.forEach(line => {
    const picMatch = line.match(/\s+(\d{2})\s+(\w+-\w+)\s+PIC\s+([9AX]+)(?:\((\d+)\))?(?:V9\((\d+)\))?/i);
    if (picMatch) {
      const [, , name, type, length, decimals] = picMatch;
      variables.push({
        name,
        type: type.startsWith('9') ? 'numeric' : 'text',
        pic: type,
        length: parseInt(length || '1'),
        isDecimal: !!decimals,
        decimalPlaces: decimals ? parseInt(decimals) : 0
      });
    }
  });

  return variables;
}

function generateStructuredTestCases(cobolCode: string): Array<TestCase> {
  const variables = parseCobolVariables(cobolCode);
  
  return [
    generateNormalCase(variables),
    generateMaxBoundaryCase(variables),
    generateMinBoundaryCase(variables),
    generateErrorCase(variables)
  ];
}

function generateNormalCase(variables: Array<CobolVariable>): TestCase {
  const inputData: Record<string, any> = {};
  const outputData: Record<string, any> = {};

  variables.forEach(v => {
    const value = generateTypicalValue(v);
    inputData[v.name] = value;
    outputData[v.name] = value;
  });

  return {
    input: {
      data: inputData,
      workingStorage: {},
      parameters: {}
    },
    expectedOutput: {
      data: outputData,
      status: {
        code: 'SUCCESS',
        message: 'Operation completed successfully'
      }
    },
    description: 'Normal operation with typical business values',
    testType: 'normal',
    passed: true
  };
}

function generateMaxBoundaryCase(variables: Array<CobolVariable>): TestCase {
  const inputData: Record<string, any> = {};
  const outputData: Record<string, any> = {};

  variables.forEach(v => {
    const value = generateMaxValue(v);
    inputData[v.name] = value;
    outputData[v.name] = value;
  });

  return {
    input: {
      data: inputData,
      workingStorage: {},
      parameters: {}
    },
    expectedOutput: {
      data: outputData,
      status: {
        code: 'SUCCESS',
        message: 'Operation completed with maximum values'
      }
    },
    description: 'Boundary testing with maximum allowed values',
    testType: 'boundary',
    passed: true
  };
}

function generateMinBoundaryCase(variables: Array<CobolVariable>): TestCase {
  const inputData: Record<string, any> = {};
  const outputData: Record<string, any> = {};

  variables.forEach(v => {
    const value = generateMinValue(v);
    inputData[v.name] = value;
    outputData[v.name] = value;
  });

  return {
    input: {
      data: inputData,
      workingStorage: {},
      parameters: {}
    },
    expectedOutput: {
      data: outputData,
      status: {
        code: 'SUCCESS',
        message: 'Operation completed with minimum values'
      }
    },
    description: 'Boundary testing with minimum allowed values',
    testType: 'boundary',
    passed: true
  };
}

function generateErrorCase(variables: Array<CobolVariable>): TestCase {
  const inputData: Record<string, any> = {};
  const outputData: Record<string, any> = {};

  variables.forEach(v => {
    const value = generateInvalidValue(v);
    inputData[v.name] = value;
    outputData[v.name] = null;
  });

  return {
    input: {
      data: inputData,
      workingStorage: {},
      parameters: {}
    },
    expectedOutput: {
      data: outputData,
      status: {
        code: 'ERROR',
        message: 'Invalid input values'
      }
    },
    description: 'Error handling with invalid values',
    testType: 'error',
    passed: true
  };
}

function generateTypicalValue(variable: CobolVariable): any {
  if (variable.type === 'numeric') {
    return variable.isDecimal ? 
      1000.50 : 
      1000;
  }
  return 'SAMPLE';
}

function generateMaxValue(variable: CobolVariable): any {
  if (variable.type === 'numeric') {
    const max = Math.pow(10, variable.length) - 1;
    return variable.isDecimal ? 
      max / Math.pow(10, variable.decimalPlaces || 0) : 
      max;
  }
  return 'Z'.repeat(variable.length);
}

function generateMinValue(variable: CobolVariable): any {
  if (variable.type === 'numeric') {
    return 0;
  }
  return 'A'.repeat(variable.length);
}

function generateInvalidValue(variable: CobolVariable): any {
  if (variable.type === 'numeric') {
    return -1; // Negative numbers are typically invalid in COBOL
  }
  return '@'.repeat(variable.length + 1); // Invalid character and too long
}

export async function generateJUnitTests(className: string, testCases: Array<TestCase>): Promise<string> {
  const prompt = `
Generate JUnit 5 tests for these test cases:
${JSON.stringify(testCases, null, 2)}

Class to test: ${className}

Requirements:
- Use JUnit 5 annotations
- Include setup/teardown methods
- Descriptive test names
- Comprehensive assertions
- Handle all test types
`;

  try {
    const response = await translateToJava(prompt, '');
    return response.javaCode;
  } catch (error) {
    console.error('Failed to generate JUnit tests:', error);
    return generateBasicJUnitTests(className, testCases);
  }
}

function generateBasicJUnitTests(className: string, testCases: Array<TestCase>): string {
  return `
import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;

@DisplayName("${className} Tests")
class ${className}Test {
    private ${className} instance;

    @BeforeEach
    void setUp() {
        instance = new ${className}();
    }

    ${testCases.map((testCase, index) => `
    @Test
    @DisplayName("${testCase.description}")
    void test${index + 1}_${testCase.testType}() {
        // Arrange
        ${Object.entries(testCase.input.data).map(([key, value]) => 
          `instance.set${key}(${JSON.stringify(value)});`
        ).join('\n        ')}

        // Act
        instance.process();

        // Assert
        ${Object.entries(testCase.expectedOutput.data).map(([key, value]) => 
          `assertEquals(${JSON.stringify(value)}, instance.get${key}());`
        ).join('\n        ')}
    }
    `).join('\n')}

    @AfterEach
    void tearDown() {
        instance = null;
    }
}`;}