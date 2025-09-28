"use client"

import { useEffect, useRef, useState, useCallback } from "react"

type PyodideRunResult = unknown

interface LoadPyodideOptions {
  indexURL: string
}

interface Pyodide {
  runPython: (code: string) => PyodideRunResult
}

interface PyodideWindow extends Window {
  pyodide?: Pyodide
  loadPyodide?: (opts: LoadPyodideOptions) => Promise<Pyodide>
}

interface PythonRunnerProps {
  code: string
  testCases: Array<{ input: string; output: string }>
  onOutput: (output: string) => void
  isRunning: boolean
  setIsRunning: (running: boolean) => void
}

function normalizeInputAssignments(raw: string): string {
  return raw.replace(/,\s*(?=[A-Za-z_]\w*\s*=)/g, "\n")
}

function pyTripleQuoteEscape(s: string): string {
  return s.replace(/'''/g, "\\'\\'\\'")
}

export default function PythonRunner({
  code,
  testCases,
  onOutput,
  isRunning,
  setIsRunning,
}: PythonRunnerProps) {
  const pyodideRef = useRef<Pyodide | null>(null)
  const [pyodideLoaded, setPyodideLoaded] = useState(false)

  useEffect(() => {
    const loadPyodideScript = async () => {
      const w = window as PyodideWindow

      if (w.pyodide) {
        pyodideRef.current = w.pyodide
        setPyodideLoaded(true)
        return
      }

      const script = document.createElement("script")
      script.src = "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js"
      script.async = true
      document.body.appendChild(script)

      script.onload = async () => {
        try {
          if (!w.loadPyodide) {
            throw new Error("window.loadPyodide is not available after script load.")
          }
          const pyodide = await w.loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/",
          })
          pyodideRef.current = pyodide
          w.pyodide = pyodide
          setPyodideLoaded(true)
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : String(error)
          console.error("Failed to load Pyodide:", message)
          onOutput("Error loading Python environment")
        }
      }
    }

    loadPyodideScript()
  }, [onOutput])

  const runPythonCode = useCallback(async () => {
    const py = pyodideRef.current
    if (!pyodideLoaded || !py) {
      onOutput("Python environment is still loading...")
      return
    }

    setIsRunning(true)
    let output = ""

    try {
      py.runPython(`from __future__ import annotations\n${code}`)

      let allTestsPassed = true
      output += "Running test cases...\n\n"

      const escapedSource = pyTripleQuoteEscape(code)

      for (let i = 0; i < Math.min(3, testCases.length); i++) {
        const testCase = testCases[i]
        const normalizedInput = normalizeInputAssignments(testCase.input)

        try {
          const testCode = `
import ast, re

source = '''${escapedSource}'''
tree = ast.parse(source)

call_is_method = False
func_name = None
param_names = []

for node in ast.walk(tree):
    if isinstance(node, ast.ClassDef) and node.name == "Solution":
        for b in node.body:
            if isinstance(b, ast.FunctionDef):
                call_is_method = True
                func_name = b.name
                for arg in b.args.args:
                    if arg.arg == "self":
                        continue
                    param_names.append(arg.arg)
                if b.args.vararg is not None:
                    param_names.append(b.args.vararg.arg)
                break
        if call_is_method:
            break

if not call_is_method and func_name is None:
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            func_name = node.name
            for arg in node.args.args:
                param_names.append(arg.arg)
            if node.args.vararg is not None:
                param_names.append(node.args.vararg.arg)
            break

${normalizedInput}

result = None
if call_is_method and func_name is not None:
    sol = Solution()
    args = []
    for name in param_names:
        if name in locals():
            args.append(name)
    if args:
        result = eval(f"sol.{func_name}({', '.join(args)})")
    else:
        result = eval(f"sol.{func_name}()")
elif func_name is not None:
    args = []
    for name in param_names:
        if name in locals():
            args.append(name)
    if args:
        result = eval(f"{func_name}({', '.join(args)})")
    else:
        result = eval(f"{func_name}()")

print(result)
`

          py.runPython(`
import sys
from io import StringIO
__old_stdout = sys.stdout
__old_stderr = sys.stderr
sys.stdout = StringIO()
sys.stderr = StringIO()
try:
    exec(${JSON.stringify(testCode)})
    __captured_out = sys.stdout.getvalue()
    __captured_err = sys.stderr.getvalue()
finally:
    sys.stdout = __old_stdout
    sys.stderr = __old_stderr
__captured_out + ("\\n" + __captured_err if __captured_err else "")
`)

          const resultCombined = py.runPython(
            `__captured_out + ("\\n" + __captured_err if __captured_err else "")`
          )

          const expected = testCase.output
          const resultStr = String(resultCombined ?? "").trim()

          const normalizeOutput = (str: string) =>
            str.replace(/[\[\]"']/g, "").replace(/\s+/g, " ").trim()

          if (normalizeOutput(resultStr) === normalizeOutput(expected)) {
            output += `✓ Test Case ${i + 1}: PASSED\n`
            output += `  Input: ${testCase.input}\n`
            output += `  Expected: ${expected}\n`
            output += `  Got: ${resultStr}\n\n`
          } else {
            allTestsPassed = false
            output += `✗ Test Case ${i + 1}: FAILED\n`
            output += `  Input: ${testCase.input}\n`
            output += `  Expected: ${expected}\n`
            output += `  Got: ${resultStr}\n\n`
          }
        } catch (error: unknown) {
          allTestsPassed = false
          const message = error instanceof Error ? error.message : String(error)
          output += `✗ Test Case ${i + 1}: ERROR\n`
          output += `  Input: ${testCase.input}\n`
          output += `  Error: ${message}\n\n`
        }
      }

      output += allTestsPassed
        ? "🎉 All test cases passed!"
        : "⚠️ Some test cases failed. Check your solution."
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      output = `Error executing code:\n${message}`
    } finally {
      setIsRunning(false)
      onOutput(output)
    }
  }, [pyodideLoaded, code, testCases, setIsRunning, onOutput])

  useEffect(() => {
    if (isRunning && pyodideLoaded) {
      void runPythonCode()
    }
  }, [isRunning, pyodideLoaded, runPythonCode])

  return null
}