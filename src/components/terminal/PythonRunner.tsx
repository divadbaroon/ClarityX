"use client"

import { useEffect, useRef, useState } from "react"

declare global {
  interface Window {
    pyodide: any
    loadPyodide: any
  }
}

interface PythonRunnerProps {
  code: string
  testCases: Array<{ input: string; output: string }>
  onOutput: (output: string) => void
  isRunning: boolean
  setIsRunning: (running: boolean) => void
}

/**
 * Normalize a LeetCode-style input string into valid Python assignments.
 */
function normalizeInputAssignments(raw: string): string {
  return raw.replace(/,\s*(?=[A-Za-z_]\w*\s*=)/g, "\n")
}

/** Escape triple single quotes for embedding into a Python triple-quoted string. */
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
  const pyodideRef = useRef<any>(null)
  const [pyodideLoaded, setPyodideLoaded] = useState(false)

  useEffect(() => {
    const loadPyodideScript = async () => {
      if ((window as any).pyodide) {
        pyodideRef.current = (window as any).pyodide
        setPyodideLoaded(true)
        return
      }

      const script = document.createElement("script")
      script.src = "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js"
      script.async = true
      document.body.appendChild(script)

      script.onload = async () => {
        try {
          const pyodide = await (window as any).loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/",
          })
          pyodideRef.current = pyodide
          ;(window as any).pyodide = pyodide
          setPyodideLoaded(true)
        } catch (error) {
          console.error("Failed to load Pyodide:", error)
          onOutput("Error loading Python environment")
        }
      }
    }

    loadPyodideScript()
  }, [onOutput])

  const runPythonCode = async () => {
    if (!pyodideLoaded || !pyodideRef.current) {
      onOutput("Python environment is still loading...")
      return
    }

    setIsRunning(true)
    let output = ""

    try {
      // Execute the user's code (defines Solution / function) with postponed annotations,
      // so type hints are treated as strings and don't require `typing` imports.
      pyodideRef.current.runPython(`from __future__ import annotations\n` + code)

      let allTestsPassed = true
      output += "Running test cases...\n\n"

      const escapedSource = pyTripleQuoteEscape(code)

      for (let i = 0; i < Math.min(3, testCases.length); i++) {
        const testCase = testCases[i]
        const normalizedInput = normalizeInputAssignments(testCase.input)

        try {
          // Python snippet that:
          //  - parses the user's source with AST
          //  - finds either the first function or the first method on Solution
          //  - extracts ordered parameter names (skipping self)
          //  - executes normalized inputs
          //  - calls the target with args pulled from locals() IN ORDER
          const testCode = `
import ast, re

source = '''${escapedSource}'''
tree = ast.parse(source)

# Discover call target and param names via AST
call_is_method = False
func_name = None
param_names = []

for node in ast.walk(tree):
    if isinstance(node, ast.ClassDef) and node.name == "Solution":
        # Find the first function (method) in the class
        for b in node.body:
            if isinstance(b, ast.FunctionDef):
                call_is_method = True
                func_name = b.name
                # Positional args (skip 'self' if present)
                for arg in b.args.args:
                    if arg.arg == "self":
                        continue
                    param_names.append(arg.arg)
                # Handle *args
                if b.args.vararg is not None:
                    param_names.append(b.args.vararg.arg)
                # We ignore kwonly and **kwargs for this simple runner
                break
        if call_is_method:
            break

if not call_is_method and func_name is None:
    # Fall back: first top-level function
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            func_name = node.name
            for arg in node.args.args:
                param_names.append(arg.arg)
            if node.args.vararg is not None:
                param_names.append(node.args.vararg.arg)
            break

# Execute the input assignments so names exist in locals()
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

          // Redirect stdout/stderr safely; always restore.
          pyodideRef.current.runPython(`
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

          const resultCombined = String(
            pyodideRef.current.runPython(
              `__captured_out + ("\\n" + __captured_err if __captured_err else "")`
            )
          )

          const expected = testCase.output
          const resultStr = resultCombined.trim()

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
        } catch (error: any) {
          allTestsPassed = false
          output += `✗ Test Case ${i + 1}: ERROR\n`
          output += `  Input: ${testCase.input}\n`
          output += `  Error: ${error.message || error}\n\n`
        }
      }

      output += allTestsPassed
        ? "🎉 All test cases passed!"
        : "⚠️ Some test cases failed. Check your solution."
    } catch (error: any) {
      output = `Error executing code:\n${error.message || error}`
    } finally {
      setIsRunning(false)
      onOutput(output)
    }
  }

  useEffect(() => {
    if (isRunning && pyodideLoaded) {
      runPythonCode()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, pyodideLoaded])

  return null
}
