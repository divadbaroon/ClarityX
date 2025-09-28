"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Play, User, X, Circle } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { keymap } from "@codemirror/view"  
import { EditorView, basicSetup } from "codemirror"
import { EditorState } from "@codemirror/state"
import type { ViewUpdate } from "@codemirror/view"
import { indentWithTab } from "@codemirror/commands"
import { indentUnit } from "@codemirror/language"
import { java } from "@codemirror/lang-java"
import { python } from "@codemirror/lang-python"
import { javascript } from "@codemirror/lang-javascript"
import { fetchProblemById } from "@/lib/actions/problems"
import PythonRunner from "@/components/terminal/PythonRunner"
import { useWorkspaceContext } from '@/app/providers/WorkspaceProvider'

// Concept Map Types
interface ConceptMapEntry {
  understandingLevel: number
  confidenceInAssessment: number
  reasoning: string
  lastUpdated: string
}

interface ConceptMap {
  [conceptName: string]: ConceptMapEntry
}

interface TestResult {
  input: string
  expected: string
  actual: string
  error: string
}

export default function LeetCodeIDE() {
  const params = useParams()
  
  // Get values from context
  const {
    problem,
    setProblem,
    taskTitle,
    taskDescription,
    examples,
    testCases,
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
  } = useWorkspaceContext()

  // Initialize local code with latest saved or starter code
  const [code, setCode] = useState(() => {
    const saved = getLatestCode()
    return saved || ""
  })
  
  const [loading, setLoading] = useState(true)
  const [triggerRun, setTriggerRun] = useState(false)
  const [isDraggingHorizontal, setIsDraggingHorizontal] = useState(false)
  const [isDraggingVertical, setIsDraggingVertical] = useState(false)

  // Concept Map State
  const [conceptMap, setConceptMap] = useState<ConceptMap>({})
  const [isUpdatingConceptMap, setIsUpdatingConceptMap] = useState(false)
  const lastCodeRef = useRef<string>('')
  const lastOutputRef = useRef<string>('')

  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const editorViewRef = useRef<EditorView | null>(null)

  // When problem loads, use starter code if no saved code exists
  useEffect(() => {
    if (problem?.starter_code && !getLatestCode()) {
      setCode(problem.starter_code)
      setLatestCode(problem.starter_code)
    }
  }, [problem, getLatestCode, setLatestCode])

  // Auto-save code periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (editorViewRef.current) {
        const snapshot = editorViewRef.current.state.doc.toString()
        setLatestCode(snapshot)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [setLatestCode])

  const updateConceptMap = useCallback(async (currentCode: string, output: string) => {
    if (!problem) return
    
    setIsUpdatingConceptMap(true)
    try {
      // Parse test results from output
      const testResults = parseTestResults(output)
      
      const context = {
        taskName: problem.task_id,
        methodName: extractMethodName(problem.starter_code),
        methodTemplate: problem.starter_code,
        currentStudentCode: currentCode,
        terminalOutput: output || 'No output yet',
        conversationHistory: [],
        currentConceptMap: conceptMap,
        sessionId: 'session-' + Date.now(),
        profileId: 'user-id', // Replace with actual user ID
        testResults
      }

      const response = await fetch('/api/claude/concept-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context })
      })

      if (response.ok) {
        const data = await response.json()
        setConceptMap(data.updatedConceptMap)
        
        // Detailed console logging
        console.log('📊 [ConceptMap] Full Update:', JSON.stringify(data.updatedConceptMap, null, 2))
        
        // Log each concept individually
        Object.entries(data.updatedConceptMap).forEach(([concept, details]) => {
          const entry = details as ConceptMapEntry
          console.log(`📈 [${concept}]:`, {
            understanding: `${(entry.understandingLevel * 100).toFixed(0)}%`,
            confidence: `${(entry.confidenceInAssessment * 100).toFixed(0)}%`,
            reasoning: entry.reasoning
          })
        })
      }
    } catch (error) {
      console.error('[ConceptMap] Error:', error)
    } finally {
      setIsUpdatingConceptMap(false)
    }
  }, [problem, conceptMap])

  // Update concept map when code changes significantly
  useEffect(() => {
    const codeChanged = lastCodeRef.current && 
      Math.abs(code.length - lastCodeRef.current.length) > 50

    if (codeChanged && problem && !isUpdatingConceptMap) {
      console.log('[ConceptMap] Significant code change detected')
      updateConceptMap(code, terminalOutput)
      lastCodeRef.current = code
    }
  }, [code, problem, terminalOutput, isUpdatingConceptMap, updateConceptMap])

  // Update concept map when terminal output changes (test results)
  useEffect(() => {
    const outputChanged = terminalOutput && 
      terminalOutput !== lastOutputRef.current &&
      terminalOutput.includes('Test Case')

    if (outputChanged && problem && !isUpdatingConceptMap) {
      console.log('[ConceptMap] Test results detected')
      updateConceptMap(code, terminalOutput)
      lastOutputRef.current = terminalOutput
    }
  }, [terminalOutput, code, problem, isUpdatingConceptMap, updateConceptMap])

  function extractMethodName(starterCode: string): string {
    const match = starterCode.match(/def\s+(\w+)\s*\(/)
    return match ? match[1] : 'unknown'
  }

  function parseTestResults(output: string) {
    if (!output) return undefined
    
    const lines = output.split('\n')
    let totalTests = 0
    let passedTests = 0
    const failedTests: TestResult[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (line.includes('Test Case')) {
        totalTests++
        if (line.includes('PASSED')) {
          passedTests++
        } else if (line.includes('FAILED')) {
          const inputMatch = lines[i + 1]?.match(/Input: (.*)/)
          const expectedMatch = lines[i + 2]?.match(/Expected: (.*)/)
          const actualMatch = lines[i + 3]?.match(/Got: (.*)/)
          
          if (expectedMatch && actualMatch) {
            failedTests.push({
              input: inputMatch ? inputMatch[1] : '',
              expected: expectedMatch[1],
              actual: actualMatch[1],
              error: ''
            })
          }
        }
      }
    }

    return totalTests > 0 ? { totalTests, passedTests, failedTests } : undefined
  }

  const fetchProblem = useCallback(async (problemId: string) => {
    try {
      setLoading(true)
      const { problem: fetchedProblem, error } = await fetchProblemById(problemId)
      
      if (error || !fetchedProblem) {
        console.error("Error loading problem:", error)
        setProblem(null)
      } else {
        setProblem(fetchedProblem)
        
        // Check for saved code first
        const savedCode = getLatestCode()
        if (savedCode) {
          setCode(savedCode)
        } else {
          setCode(fetchedProblem.starter_code)
          setLatestCode(fetchedProblem.starter_code)
        }
      }
    } catch (error) {
      console.error("Error loading problem:", error)
      setProblem(null)
    } finally {
      setLoading(false)
    }
  }, [setProblem, getLatestCode, setLatestCode])

  useEffect(() => {
    if (params.problem) {
      fetchProblem(params.problem as string)
    }
  }, [params.problem, fetchProblem])

  const runTests = async () => {
    if (isRunning) return
    
    if (language === "Python") {
      setIsRunning(true)
      setTriggerRun(!triggerRun)
    } else {
      setIsRunning(true)
      setTerminalOutput("Code execution for Java and JavaScript coming soon...")
      setTimeout(() => {
        setIsRunning(false)
      }, 1500)
    }
  }

  const handleMouseDownHorizontal = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDraggingHorizontal(true)
  }

  const handleMouseDownVertical = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDraggingVertical(true)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingHorizontal && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect()
        const newWidth = Math.max(200, Math.min(600, e.clientX - containerRect.left))
        setLeftPanelWidth(newWidth)
      }
      if (isDraggingVertical && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect()
        const newHeight = Math.max(100, containerRect.bottom - e.clientY)
        setTerminalHeight(newHeight)
      }
    }

    const handleMouseUp = () => {
      setIsDraggingHorizontal(false)
      setIsDraggingVertical(false)
    }

    if (isDraggingHorizontal || isDraggingVertical) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = isDraggingHorizontal ? "col-resize" : "row-resize"
      document.body.style.userSelect = "none"
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
  }, [isDraggingHorizontal, isDraggingVertical, setLeftPanelWidth, setTerminalHeight])

  const getLanguageExtension = (lang: string) => {
    switch (lang) {
      case "Java":
        return java()
      case "Python":
        return python()
      case "JavaScript":
        return javascript()
      default:
        return python()
    }
  }

  // Initialize editor
  useEffect(() => {
    if (editorRef.current && !editorViewRef.current) {
      const savedCode = getLatestCode()
      const initialCode = savedCode || problem?.starter_code || ""
      
      const state = EditorState.create({
        doc: initialCode,
        extensions: [
          basicSetup,
          getLanguageExtension(language),
          indentUnit.of("  "),
          keymap.of([indentWithTab]),
          EditorView.updateListener.of((update: ViewUpdate) => {
            if (update.docChanged) {
              setCode(update.state.doc.toString())
            }
          }),
          EditorView.theme({
            "&": {
              height: "100%",
              fontSize: "14px",
              color: "#1f2937",
            },
            ".cm-content": {
              padding: "16px",
              minHeight: "100%",
              color: "#1f2937",
            },
            ".cm-focused": {
              outline: "none",
            },
            ".cm-editor": {
              height: "100%",
              backgroundColor: "#ffffff",
            },
            ".cm-scroller": {
              height: "100%",
            },
            ".cm-line": {
              color: "#1f2937",
            },
            ".cm-cursor": {
              borderLeftColor: "#1f2937",
            },
            ".cm-selectionBackground": {
              backgroundColor: "#e5e7eb",
            },
            ".cm-keyword": {
              color: "#7c3aed",
            },
            ".cm-string": {
              color: "#059669",
            },
            ".cm-comment": {
              color: "#6b7280",
            },
            ".cm-number": {
              color: "#dc2626",
            },
            ".cm-operator": {
              color: "#1f2937",
            },
            ".cm-punctuation": {
              color: "#1f2937",
            },
            ".cm-bracket": {
              color: "#1f2937",
            },
            ".cm-tag": {
              color: "#dc2626",
            },
            ".cm-attribute": {
              color: "#7c3aed",
            },
            ".cm-variable": {
              color: "#1f2937",
            },
            ".cm-type": {
              color: "#0891b2",
            },
            ".cm-function": {
              color: "#0891b2",
            },
          }),
        ],
      })

      editorViewRef.current = new EditorView({
        state,
        parent: editorRef.current,
      })
    }

    return () => {
      if (editorViewRef.current) {
        editorViewRef.current.destroy()
        editorViewRef.current = null
      }
    }
  }, [problem, language, getLatestCode])

  // Handle language changes
  useEffect(() => {
    if (editorViewRef.current && problem) {
      const currentDoc = editorViewRef.current.state.doc.toString()
      const newState = EditorState.create({
        doc: currentDoc,
        extensions: [
          basicSetup,
          getLanguageExtension(language),
          indentUnit.of("  "),
          keymap.of([indentWithTab]),
          EditorView.updateListener.of((update: ViewUpdate) => {
            if (update.docChanged) {
              setCode(update.state.doc.toString())
            }
          }),
          EditorView.theme({
            "&": {
              height: "100%",
              fontSize: "14px",
              color: "#1f2937",
            },
            ".cm-content": {
              padding: "16px",
              minHeight: "100%",
              color: "#1f2937",
            },
            ".cm-focused": {
              outline: "none",
            },
            ".cm-editor": {
              height: "100%",
              backgroundColor: "#ffffff",
            },
            ".cm-scroller": {
              height: "100%",
            },
            ".cm-line": {
              color: "#1f2937",
            },
            ".cm-cursor": {
              borderLeftColor: "#1f2937",
            },
            ".cm-selectionBackground": {
              backgroundColor: "#e5e7eb",
            },
            ".cm-keyword": {
              color: "#7c3aed",
            },
            ".cm-string": {
              color: "#059669",
            },
            ".cm-comment": {
              color: "#6b7280",
            },
            ".cm-number": {
              color: "#dc2626",
            },
            ".cm-operator": {
              color: "#1f2937",
            },
            ".cm-punctuation": {
              color: "#1f2937",
            },
            ".cm-bracket": {
              color: "#1f2937",
            },
            ".cm-tag": {
              color: "#dc2626",
            },
            ".cm-attribute": {
              color: "#7c3aed",
            },
            ".cm-variable": {
              color: "#1f2937",
            },
            ".cm-type": {
              color: "#0891b2",
            },
            ".cm-function": {
              color: "#0891b2",
            },
          }),
        ],
      })
      editorViewRef.current.setState(newState)
    }
  }, [language, problem])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading IDE...</p>
        </div>
      </div>
    )
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Problem not found</h2>
          <Link href="/problems">
            <Button className="bg-black text-white hover:bg-gray-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Problems
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-white flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-black">ClarityX.</h1>
          {isUpdatingConceptMap && (
            <span className="ml-4 text-sm text-gray-500 animate-pulse">
              Analyzing understanding...
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 focus:outline-none">
            <X className="w-4 h-4 mr-2" />
            Close ClarityX
          </Button>
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden focus:outline-none relative" ref={containerRef}>
        <div
          className="border-r border-gray-200 flex flex-col bg-white focus:outline-none z-10"
          style={{ width: `${leftPanelWidth}px` }}
        >
          <div className="p-6 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-xl font-bold text-black mb-4">{taskTitle}</h2>
            <div className="flex flex-wrap gap-2 mb-0">
              {problem.tags?.map((tag) => (
                <Button
                  key={tag}
                  variant="ghost"
                  size="sm"
                  className="text-xs px-3 py-1 h-7 bg-gray-100 hover:bg-gray-200 text-gray-700 focus:outline-none"
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-auto focus:outline-none">
            <div className="p-6 space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Circle className="w-3 h-3 fill-current text-black" />
                  <h3 className="font-semibold text-black">Task Description</h3>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-700 leading-relaxed">
                    {taskDescription}
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200"></div>

              <div>
                <div className="space-y-6">
                  {examples.map((example, index) => (
                    <div key={index}>
                      <h5 className="font-medium text-black mb-3">Example {index + 1}</h5>
                      <div className="bg-gray-50 p-4 rounded-lg text-xs font-mono space-y-2">
                        <div>
                          <span className="text-gray-800 font-semibold">Input:</span>{" "}
                          <span className="text-gray-900">{example.input}</span>
                        </div>
                        <div>
                          <span className="text-gray-800 font-semibold">Output:</span>{" "}
                          <span className="text-green-600">{example.output}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="w-1 bg-gray-200 hover:bg-gray-300 cursor-col-resize flex-shrink-0 focus:outline-none z-10"
          onMouseDown={handleMouseDownHorizontal}
        />

        <div className="flex-1 flex flex-col min-w-0 focus:outline-none">
          <div className="flex-1 focus:outline-none">
            <div ref={editorRef} className="w-full h-full focus:outline-none" style={{ minHeight: "100%" }} />
          </div>
        </div>

        {language === "Python" && problem && (
          <PythonRunner
            code={code}
            testCases={testCases}
            onOutput={setTerminalOutput}
            isRunning={isRunning}
            setIsRunning={setIsRunning}
          />
        )}

        <div
          className="absolute bottom-0 right-0 bg-gray-50 border-t border-l border-gray-200 shadow-lg z-20"
          style={{
            height: `${terminalHeight}px`,
            width: `calc(100% - ${leftPanelWidth + 4}px)`,
            left: `${leftPanelWidth + 4}px`,
          }}
        >
          <div
            className="h-1 bg-gray-200 hover:bg-gray-300 cursor-row-resize flex-shrink-0 focus:outline-none"
            onMouseDown={handleMouseDownVertical}
          />

          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <Button
                onClick={runTests}
                disabled={isRunning}
                className="bg-black text-white hover:bg-gray-800 h-8 px-4 text-sm focus:outline-none cursor-pointer"
              >
                <Play className="w-3 h-3 mr-2" />
                Run Tests
              </Button>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-24 h-8 text-sm text-gray-900 border border-gray-300 focus:ring-0 focus:outline-none shadow-none cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Java" className="text-gray-900 focus:bg-gray-100 focus:text-gray-900 data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900 cursor-pointer">
                    Java
                  </SelectItem>
                  <SelectItem value="Python" className="text-gray-900 focus:bg-gray-100 focus:text-gray-900 data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900 cursor-pointer">
                    Python
                  </SelectItem>
                  <SelectItem value="JavaScript" className="text-gray-900 focus:bg-gray-100 focus:text-gray-900 data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900 cursor-pointer">
                    JavaScript
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="p-4 bg-gray-50 h-full" style={{ height: `calc(100% - 45px)` }}>
            <div className="bg-gray-100 rounded-lg p-4 h-full overflow-auto" style={{ height: `calc(100% - 8px)` }}>
              <div className="text-sm text-gray-900 font-mono whitespace-pre-wrap">{terminalOutput}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}