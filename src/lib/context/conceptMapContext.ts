export interface ConceptMapEntry {
  understandingLevel: number;
  confidenceInAssessment: number;
  reasoning: string;
  lastUpdated: string;
}

export interface ConceptMap {
  [conceptName: string]: ConceptMapEntry;
}

export interface ConceptMapAgentContext {
  // Task Information
  taskName: string;
  methodName: string;
  methodTemplate: string;
  currentStudentCode: string;
  
  // Test Results
  terminalOutput: string;
  testResults?: {
    totalTests: number;
    passedTests: number;
    failedTests: Array<{
      input: any;
      expected: any;
      actual: any;
      error?: string;
    }>;
  };
  
  // Conversation History
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  
  
  // Current Concept Map
  currentConceptMap: ConceptMap;
  
  // Session Metadata
  sessionId: string;
  profileId: string;
  attemptNumber?: number;
}

export class ConceptMapContextBuilder {
  static buildUserPrompt(context: ConceptMapAgentContext): string {
    const currentTime = new Date().toISOString();
    
    let prompt = `ASSESS CONCEPT MAP FOR: ${context.taskName} (${context.methodName})

CURRENT CONTEXT:
=============

**Task Information:**
- Method: ${context.methodName}
- Task: ${context.taskName}

**Method Template (Starting Code):**
\`\`\`
${context.methodTemplate}
\`\`\`

**Current Student Code:**
\`\`\`
${context.currentStudentCode}
\`\`\`

**Terminal Output/Test Results:**
\`\`\`
${context.terminalOutput}
\`\`\`
`;

    // Add detailed test results if available
    if (context.testResults) {
      prompt += `
**Detailed Test Analysis:**
- Total Tests: ${context.testResults.totalTests}
- Passed: ${context.testResults.passedTests}
- Failed: ${context.testResults.totalTests - context.testResults.passedTests}

Failed Test Details:
${context.testResults.failedTests.map((test, i) => 
  `Test ${i + 1}: Expected ${JSON.stringify(test.expected)}, Got ${JSON.stringify(test.actual)}${test.error ? `, Error: ${test.error}` : ''}`
).join('\n')}
`;
    }

    // Add conversation history
    if (context.conversationHistory.length > 0) {
      prompt += `
**Recent Conversation (last 10 messages):**
${context.conversationHistory.slice(-10).map(msg => 
  `[${msg.timestamp}] ${msg.role.toUpperCase()}: ${msg.content}`
).join('\n')}
`;
    }

    // Add current concept map
    prompt += `
**Current Concept Map to Update:**
\`\`\`json
${JSON.stringify(context.currentConceptMap, null, 2)}
\`\`\`

**Assessment Time:** ${currentTime}

ANALYZE the evidence above and return the updated concept map following the specified format. Focus on what the code, test results, and conversations reveal about the student's understanding of each concept.`;

    return prompt;
  }

  static createContext(
    taskName: string,
    methodName: string,
    methodTemplate: string,
    currentCode: string,
    terminalOutput: string,
    conversationHistory: any[],
    currentConceptMap: ConceptMap,
    sessionId: string,
    profileId: string,
    options: {
      testResults?: any;
    } = {}
  ): ConceptMapAgentContext {
    return {
      taskName,
      methodName,
      methodTemplate,
      currentStudentCode: currentCode,
      terminalOutput,
      conversationHistory: conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp || new Date().toISOString()
      })),
      currentConceptMap,
      sessionId,
      profileId,
      testResults: options.testResults,
    };
  }
}