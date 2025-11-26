"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Play, Copy, RotateCcw, Code2, ChevronDown, Check } from "lucide-react"
import { useState, useRef } from "react"
import Editor, { type Monaco } from "@monaco-editor/react"
import type { editor } from "monaco-editor"

interface EditorPanelProps {
  value: string
  onChange: (value: string) => void
  onRun: () => void
}

const languageMap: Record<string, string> = {
  JavaScript: "javascript",
  TypeScript: "typescript",
  Python: "python",
}

export function EditorPanel({ value, onChange, onRun }: EditorPanelProps) {
  const [copied, setCopied] = useState(false)
  const [language, setLanguage] = useState("JavaScript")
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReset = () => {
    onChange(`function solution(arr) {
  // Your code here
  return arr.flat(Infinity);
}

// Test cases
console.log(solution([1, [2, [3, [4]]]]));
console.log(solution([1, 2, 3]));`)
  }

  const handleEditorMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor
    
    monaco.editor.defineTheme("codestage-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6b7280", fontStyle: "italic" },
        { token: "keyword", foreground: "c084fc" },
        { token: "string", foreground: "4ade80" },
        { token: "number", foreground: "fbbf24" },
        { token: "function", foreground: "60a5fa" },
        { token: "variable", foreground: "e2e8f0" },
        { token: "type", foreground: "22d3ee" },
        { token: "operator", foreground: "94a3b8" },
      ],
      colors: {
        "editor.background": "#0a0a0f",
        "editor.foreground": "#e2e8f0",
        "editor.lineHighlightBackground": "#ffffff08",
        "editor.selectionBackground": "#22d3ee30",
        "editor.inactiveSelectionBackground": "#22d3ee15",
        "editorLineNumber.foreground": "#475569",
        "editorLineNumber.activeForeground": "#22d3ee",
        "editorCursor.foreground": "#22d3ee",
        "editorIndentGuide.background": "#1e293b",
        "editorIndentGuide.activeBackground": "#334155",
        "editor.selectionHighlightBackground": "#22d3ee20",
        "editorBracketMatch.background": "#22d3ee30",
        "editorBracketMatch.border": "#22d3ee",
      },
    })

    monaco.editor.setTheme("codestage-dark")

    // Track cursor position
    editor.onDidChangeCursorPosition((e) => {
      setCursorPosition({ line: e.position.lineNumber, column: e.position.column })
    })

    // Focus the editor
    editor.focus()
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
      {/* Subtle top glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-500/50 to-transparent" />

      {/* Editor header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-cyan-500/20 to-blue-500/20">
            <Code2 className="h-4 w-4 text-cyan-400" />
          </div>
          <span className="font-medium text-white">Editor</span>

          {/* Language selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 rounded-md border border-white/10 bg-white/5 px-2 text-xs text-white/60 hover:bg-white/10 hover:text-white"
              >
                {language}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="border-white/10 bg-[#1a1a24] text-white">
              {["JavaScript", "TypeScript", "Python", "Go", "Rust"].map((lang) => (
                <DropdownMenuItem key={lang} onClick={() => setLanguage(lang)} className="focus:bg-white/10">
                  {lang}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8 gap-1.5 text-xs text-white/60 hover:bg-white/10 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-8 gap-1.5 text-xs text-white/60 hover:bg-white/10 hover:text-white"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-400" />
                <span className="text-green-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </>
            )}
          </Button>
          <Button
            size="sm"
            onClick={onRun}
            className="h-8 gap-1.5 bg-linear-to-r from-green-500 to-emerald-600 text-xs text-white shadow-lg shadow-green-500/25 hover:from-green-400 hover:to-emerald-500"
          >
            <Play className="h-3.5 w-3.5" />
            Run
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={languageMap[language]}
          value={value}
          onChange={(val) => onChange(val || "")}
          onMount={handleEditorMount}
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
            fontLigatures: true,
            lineHeight: 24,
            padding: { top: 16, bottom: 16 },
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: "on",
            bracketPairColorization: { enabled: true },
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
            renderLineHighlight: "all",
            renderWhitespace: "selection",
            guides: {
              indentation: true,
              bracketPairs: true,
            },
            suggest: {
              showKeywords: true,
              showSnippets: true,
              showFunctions: true,
              showVariables: true,
              showClasses: true,
              showInterfaces: true,
              showModules: true,
              showProperties: true,
              showMethods: true,
              showConstants: true,
              preview: true,
            },
            quickSuggestions: {
              other: true,
              comments: false,
              strings: true,
            },
            parameterHints: { enabled: true },
            formatOnPaste: true,
            formatOnType: true,
          }}
          loading={
            <div className="flex h-full items-center justify-center">
              <div className="flex items-center gap-3 text-white/40">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-500/30 border-t-cyan-500" />
                <span>Loading editor...</span>
              </div>
            </div>
          }
        />
      </div>

      {/* Status bar with cursor position */}
      <div className="flex items-center justify-between border-t border-white/10 bg-white/2 px-4 py-2">
        <div className="flex items-center gap-3 text-xs text-white/40">
          <span>
            Ln {cursorPosition.line}, Col {cursorPosition.column}
          </span>
          <span>UTF-8</span>
          <span>{languageMap[language]}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-400">
            <div className="mr-1.5 h-1.5 w-1.5 rounded-full bg-green-400" />
            Synced
          </Badge>
        </div>
      </div>
    </div>
  )
}
