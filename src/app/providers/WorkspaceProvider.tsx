"use client"

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
  useCallback,
  useMemo,
} from "react"
import { LeetCodeProblem, TestCase, WorkspaceContextType } from "@/types"

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [problem, setProblemState] = useState<LeetCodeProblem | null>(null)
  const [taskTitle, setTaskTitleState] = useState("")
  const [taskDescription, setTaskDescriptionState] = useState("")
  const [examples, setExamplesState] = useState<TestCase[]>([])
  const [testCases, setTestCasesState] = useState<TestCase[]>([])
  const [starterCode, setStarterCodeState] = useState("")
  const [currentCode, setCurrentCodeState] = useState("")
  const [terminalOutput, setTerminalOutputState] = useState("")
  const [isRunning, setIsRunningState] = useState(false)
  const [language, setLanguageState] = useState("Python")
  const [leftPanelWidth, setLeftPanelWidthState] = useState(320)
  const [terminalHeight, setTerminalHeightState] = useState(200)

  const latestCodeRef = useRef<string>("")

useEffect(() => {
  console.log("[WorkspaceContext] Component mounted, checking localStorage...")
  try {
    const savedCode = localStorage.getItem("cx_latest_code")
    if (savedCode) {
      console.log("[WorkspaceContext] Found saved code in localStorage, length:", savedCode.length)
      console.log("[WorkspaceContext] Saved code preview:", savedCode.substring(0, 100))
      latestCodeRef.current = savedCode
    } else {
      console.log("[WorkspaceContext] No saved code found in localStorage")
    }
  } catch (error) {
    console.error("[WorkspaceContext] Error reading from localStorage:", error)
  }
}, []) // Empty dependency array = runs once on mount

  const setLatestCode = useCallback((code: string) => {
  console.log("[WorkspaceContext] Attempting to save code to localStorage...")
  console.log("[WorkspaceContext] Code length:", code.length)
  console.log("[WorkspaceContext] Code preview:", code.substring(0, 100))
  
  latestCodeRef.current = code
  
  try {
    localStorage.setItem("cx_latest_code", code)
    
    // Verify it was saved
    const saved = localStorage.getItem("cx_latest_code")
    if (saved === code) {
      console.log("[WorkspaceContext] ✓ Successfully saved to localStorage")
    } else {
      console.log("[WorkspaceContext] ✗ localStorage save verification failed")
    }
  } catch (error) {
    console.error("[WorkspaceContext] Failed to save to localStorage:", error)
  }
}, [])

  const getLatestCode = useCallback(() => {
  console.log("[WorkspaceContext] Attempting to retrieve code from localStorage...")
  
  if (latestCodeRef.current) {
    console.log("[WorkspaceContext] Found in ref cache, length:", latestCodeRef.current.length)
    return latestCodeRef.current
  }
  
  try {
    const v = localStorage.getItem("cx_latest_code")
    if (v) {
      console.log("[WorkspaceContext] Found in localStorage, length:", v.length)
      latestCodeRef.current = v
      return v
    } else {
      console.log("[WorkspaceContext] No code found in localStorage")
    }
  } catch (error) {
    console.error("[WorkspaceContext] Failed to read from localStorage:", error)
  }
  
  return ""
}, [])

  const setProblem = useCallback((value: LeetCodeProblem | null) => {
    console.log("[WorkspaceContext] Problem changed:", value)
    setProblemState(value)
  }, [])

  const setTaskTitle = useCallback((value: string) => {
    console.log("[WorkspaceContext] Task title changed:", value)
    setTaskTitleState(value)
  }, [])

  const setTaskDescription = useCallback((value: string) => {
    console.log("[WorkspaceContext] Task description changed:", value.substring(0, 100) + "...")
    setTaskDescriptionState(value)
  }, [])

  const setExamples = useCallback((value: TestCase[]) => {
    console.log("[WorkspaceContext] Examples changed:", value)
    setExamplesState(value)
  }, [])

  const setTestCases = useCallback((value: TestCase[]) => {
    console.log("[WorkspaceContext] Test cases changed:", value)
    setTestCasesState(value)
  }, [])

  const setStarterCode = useCallback((value: string) => {
    console.log("[WorkspaceContext] Starter code changed:", value)
    setStarterCodeState(value)
  }, [])

  const setCurrentCode = useCallback((value: string) => {
    console.log("[WorkspaceContext] Current code changed:", value)
    setCurrentCodeState(value)
  }, [])

  const setTerminalOutput = useCallback((value: string) => {
    console.log("[WorkspaceContext] Terminal output changed:", value)
    setTerminalOutputState(value)
  }, [])

  const setIsRunning = useCallback((value: boolean) => {
    console.log("[WorkspaceContext] Is running changed:", value)
    setIsRunningState(value)
  }, [])

  const setLanguage = useCallback((value: string) => {
    console.log("[WorkspaceContext] Language changed:", value)
    setLanguageState(value)
  }, [])

  const setLeftPanelWidth = useCallback((value: number) => {
    console.log("[WorkspaceContext] Left panel width changed:", value)
    setLeftPanelWidthState(value)
  }, [])

  const setTerminalHeight = useCallback((value: number) => {
    console.log("[WorkspaceContext] Terminal height changed:", value)
    setTerminalHeightState(value)
  }, [])

  useEffect(() => {
    if (problem) {
      const formatTitle = (taskId: string): string =>
        taskId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())

      setTaskTitle(`${problem.question_id}. ${formatTitle(problem.task_id)}`)

      const parts = problem.problem_description.split(/Example\s*\d+\s*:/i)
      setTaskDescription(parts[0].trim())

      const allTestCases = Array.isArray(problem.input_output) ? problem.input_output : []
      setExamples(allTestCases.slice(0, 3))
      setTestCases(allTestCases)

      setStarterCode(problem.starter_code)
    
      // Only set currentCode if there's no saved code
      const savedCode = getLatestCode()
      if (!savedCode) {
        setCurrentCode(problem.starter_code)
      }
      setTerminalOutput("")
    }
  }, [problem, setTaskTitle, setTaskDescription, setExamples, setTestCases, setStarterCode, setCurrentCode, setTerminalOutput])

  const value = useMemo<WorkspaceContextType>(() => ({
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
  }), [
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
  ])

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspaceContext() {
  const context = useContext(WorkspaceContext)
  if (context === undefined) {
    throw new Error("useWorkspaceContext must be used within a WorkspaceProvider")
  }
  return context
}
