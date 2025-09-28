"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback} from 'react'
import { LeetCodeProblem, TestCase, WorkspaceContextType } from '@/types'

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [problem, setProblemState] = useState<LeetCodeProblem | null>(null)
  const [taskTitle, setTaskTitleState] = useState('')
  const [taskDescription, setTaskDescriptionState] = useState('')
  const [examples, setExamplesState] = useState<TestCase[]>([])
  const [testCases, setTestCasesState] = useState<TestCase[]>([])
  const [starterCode, setStarterCodeState] = useState('')
  const [currentCode, setCurrentCodeState] = useState('')
  const [terminalOutput, setTerminalOutputState] = useState('')
  const [isRunning, setIsRunningState] = useState(false)
  const [language, setLanguageState] = useState('Python')
  const [leftPanelWidth, setLeftPanelWidthState] = useState(320)
  const [terminalHeight, setTerminalHeightState] = useState(200)

  const latestCodeRef = useRef<string>('')

  const setLatestCode = useCallback((code: string) => {
    latestCodeRef.current = code
  }, [])
  
  // Function to get the current value
  const getLatestCode = useCallback(() => {
    return latestCodeRef.current
  }, [])

  // Logging wrapper functions
  const setProblem = (value: LeetCodeProblem | null) => {
    console.log('[WorkspaceContext] Problem changed:', value)
    setProblemState(value)
  }

  const setTaskTitle = (value: string) => {
    console.log('[WorkspaceContext] Task title changed:', value)
    setTaskTitleState(value)
  }

  const setTaskDescription = (value: string) => {
    console.log('[WorkspaceContext] Task description changed:', value.substring(0, 100) + '...')
    setTaskDescriptionState(value)
  }

  const setExamples = (value: TestCase[]) => {
    console.log('[WorkspaceContext] Examples changed:', value)
    setExamplesState(value)
  }

  const setTestCases = (value: TestCase[]) => {
    console.log('[WorkspaceContext] Test cases changed:', value)
    setTestCasesState(value)
  }

  const setStarterCode = (value: string) => {
    console.log('[WorkspaceContext] Starter code changed:', value)
    setStarterCodeState(value)
  }

  const setCurrentCode = (value: string) => {
    console.log('[WorkspaceContext] Current code changed:', value)
    setCurrentCodeState(value)
  }

  const setTerminalOutput = (value: string) => {
    console.log('[WorkspaceContext] Terminal output changed:', value)
    setTerminalOutputState(value)
  }

  const setIsRunning = (value: boolean) => {
    console.log('[WorkspaceContext] Is running changed:', value)
    setIsRunningState(value)
  }

  const setLanguage = (value: string) => {
    console.log('[WorkspaceContext] Language changed:', value)
    setLanguageState(value)
  }

  const setLeftPanelWidth = (value: number) => {
    console.log('[WorkspaceContext] Left panel width changed:', value)
    setLeftPanelWidthState(value)
  }

  const setTerminalHeight = (value: number) => {
    console.log('[WorkspaceContext] Terminal height changed:', value)
    setTerminalHeightState(value)
  }

  // Update derived state when problem changes
  useEffect(() => {
    if (problem) {
      const formatTitle = (taskId: string): string => {
        return taskId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
      }
      
      setTaskTitle(`${problem.question_id}. ${formatTitle(problem.task_id)}`)
      
      // Extract description (before examples)
      const parts = problem.problem_description.split(/Example\s*\d+\s*:/i)
      setTaskDescription(parts[0].trim())
      
      // Extract examples (first 3)
      const allTestCases = Array.isArray(problem.input_output) ? problem.input_output : []
      setExamples(allTestCases.slice(0, 3))
      setTestCases(allTestCases)
      
      setStarterCode(problem.starter_code)
      setCurrentCode(problem.starter_code)
      setTerminalOutput('')
    }
  }, [problem])

  const value = {
    problem,
    setProblem,
    taskTitle,
    setTaskTitle,
    taskDescription,
    setTaskDescription,
    examples,
    setExamples,
    testCases,
    setTestCases,
    starterCode,
    setStarterCode,
    currentCode,
    setCurrentCode,
    terminalOutput,
    setTerminalOutput,
    isRunning,
    setIsRunning,
    language,
    setLanguage,
    leftPanelWidth,
    setLeftPanelWidth,
    terminalHeight,
    setTerminalHeight,
    setLatestCode, 
    getLatestCode,
  }

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspaceContext() {
  const context = useContext(WorkspaceContext)
  if (context === undefined) {
    throw new Error('useWorkspaceContext must be used within a WorkspaceProvider')
  }
  return context
}