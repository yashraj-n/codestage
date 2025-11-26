"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Play, Copy, RotateCcw, Code2, ChevronDown, Check } from "lucide-react"
import { useState, useRef } from "react"
import Editor, { type Monaco } from "@monaco-editor/react"
import type { editor } from "monaco-editor"
import {
  languageConfig,
  setupEditorTheme,
  registerLanguageCompletions,
} from "@/lib/editor-languages"

interface EditorPanelProps {
  value: string
  onChange: (value: string) => void
  onRun: () => void
}

export function EditorPanel({ value, onChange, onRun }: EditorPanelProps) {
  const [language, setLanguage] = useState("JavaScript")
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)


  const handleReset = () => {
    onChange(languageConfig[language].defaultCode)
  }

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang)
    onChange(languageConfig[newLang].defaultCode)
  }

  const handleEditorMount = (
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) => {
    editorRef.current = editor

    setupEditorTheme(monaco)
    registerLanguageCompletions(monaco)

    editor.onDidChangeCursorPosition((e) => {
      setCursorPosition({
        line: e.position.lineNumber,
        column: e.position.column,
      })
    })

    editor.focus()
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#13131a] to-[#0d0d14]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

      <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 ring-1 ring-white/10">
            <Code2 className="h-4 w-4 text-violet-400" />
          </div>
          <span className="font-medium text-white/90">Editor</span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 text-xs text-white/70 hover:bg-white/[0.06] hover:text-white"
              >
                <span>{languageConfig[language].icon}</span>
                {language}
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="min-w-[140px] border-white/[0.08] bg-[#18181b] text-white"
            >
              {Object.entries(languageConfig).map(([lang, config]) => (
                <DropdownMenuItem
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className="gap-2 focus:bg-white/[0.06]"
                >
                  <span>{config.icon}</span>
                  {lang}
                  {language === lang && (
                    <Check className="ml-auto h-3.5 w-3.5 text-violet-400" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8 gap-1.5 rounded-lg text-xs text-white/50 hover:bg-white/[0.06] hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
          <Button
            size="sm"
            onClick={onRun}
            className="h-8 gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-xs font-medium text-white shadow-lg shadow-emerald-500/20 transition-all hover:from-emerald-400 hover:to-green-500 hover:shadow-emerald-500/30"
          >
            <Play className="h-3.5 w-3.5" />
            Run
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={languageConfig[language].id}
          value={value}
          onChange={(val) => onChange(val || "")}
          onMount={handleEditorMount}
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
            fontLigatures: true,
            lineHeight: 24,
            letterSpacing: 0.5,
            padding: { top: 16, bottom: 16 },
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: "on",
            bracketPairColorization: { enabled: true },
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            cursorStyle: "line",
            cursorWidth: 2,
            smoothScrolling: true,
            renderLineHighlight: "all",
            renderWhitespace: "selection",
            guides: {
              indentation: true,
              bracketPairs: true,
              highlightActiveIndentation: true,
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
              insertMode: "replace",
              filterGraceful: true,
              localityBonus: true,
              shareSuggestSelections: true,
              showWords: true,
            },
            quickSuggestions: {
              other: true,
              comments: false,
              strings: true,
            },
            parameterHints: { enabled: true },
            formatOnPaste: true,
            formatOnType: true,
            autoClosingBrackets: "always",
            autoClosingQuotes: "always",
            autoSurround: "languageDefined",
            matchBrackets: "always",
          }}
          loading={
            <div className="flex h-full items-center justify-center bg-[#0d0d14]">
              <div className="flex items-center gap-3 text-white/40">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />
                <span>Loading editor...</span>
              </div>
            </div>
          }
        />
      </div>

      <div className="flex items-center justify-between border-t border-white/[0.06] bg-white/[0.015] px-4 py-2">
        <div className="flex items-center gap-4 text-xs text-white/40">
          <span className="font-mono">
            Ln {cursorPosition.line}, Col {cursorPosition.column}
          </span>
          <span>UTF-8</span>
          <span className="capitalize">{languageConfig[language].id}</span>
        </div>
        <Badge
          variant="outline"
          className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
        >
          <div className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Synced
        </Badge>
      </div>
    </div>
  )
}
