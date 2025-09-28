export interface TestCase {
  input: string
  output: string
}

export interface LeetCodeProblem {
  id: string
  task_id: string
  question_id: string
  difficulty: string
  tags: string[]
  problem_description: string
  starter_code: string
  prompt: string
  completion: string
  entry_point: string
  test: string
  input_output: TestCase[] | string
  created_at: string
}

export type DifficultyFilter = "all" | "Easy" | "Medium" | "Hard"
export type TagFilter = "all" | string

export interface WorkspaceContextType {
  // Problem data
  problem: LeetCodeProblem | null
  setProblem: (problem: LeetCodeProblem | null) => void
  
  // Task information
  taskTitle: string
  setTaskTitle: (title: string) => void
  taskDescription: string
  setTaskDescription: (description: string) => void
  
  // Examples and test cases
  examples: TestCase[]
  setExamples: (examples: TestCase[]) => void
  testCases: TestCase[]
  setTestCases: (testCases: TestCase[]) => void
  
  // Code states
  starterCode: string
  setStarterCode: (code: string) => void
  // Remove currentCode state, replace with ref-based functions
  setLatestCode: (code: string) => void
  getLatestCode: () => string
  
  // Terminal output
  terminalOutput: string
  setTerminalOutput: (output: string) => void
  
  // Execution state
  isRunning: boolean
  setIsRunning: (running: boolean) => void
  
  // Language
  language: string
  setLanguage: (lang: string) => void
  
  // UI states
  leftPanelWidth: number
  setLeftPanelWidth: (width: number) => void
  terminalHeight: number
  setTerminalHeight: (height: number) => void
}

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