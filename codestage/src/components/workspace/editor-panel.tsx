"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Play, RotateCcw, Code2, ChevronDown, Check, Pencil, Settings, Plus, Minus } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import Editor, { type Monaco } from "@monaco-editor/react"
import type { editor } from "monaco-editor"
import {
  languageConfig,
  setupEditorTheme,
  registerLanguageCompletions,
} from "@/lib/editor-languages"
import { ScratchPad } from "./scratchpad"

interface EditorPanelProps {
  value: string
  onChange: (value: string) => void
  onRun: () => void
}

const FONT_SIZE_OPTIONS = [12, 14, 16, 18, 20, 22, 24] as const

export function EditorPanel({ value, onChange, onRun }: EditorPanelProps) {
  const [language, setLanguage] = useState("JavaScript")
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })
  const [activeTab, setActiveTab] = useState("editor")
  const [fontSize, setFontSize] = useState(14)
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ fontSize })
    }
  }, [fontSize])

  const handleIncreaseFontSize = () => {
    const currentIndex = FONT_SIZE_OPTIONS.indexOf(fontSize as typeof FONT_SIZE_OPTIONS[number])
    if (currentIndex < FONT_SIZE_OPTIONS.length - 1) {
      setFontSize(FONT_SIZE_OPTIONS[currentIndex + 1])
    }
  }

  const handleDecreaseFontSize = () => {
    const currentIndex = FONT_SIZE_OPTIONS.indexOf(fontSize as typeof FONT_SIZE_OPTIONS[number])
    if (currentIndex > 0) {
      setFontSize(FONT_SIZE_OPTIONS[currentIndex - 1])
    }
  }

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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 ring-1 ring-white/10">
              {activeTab === "editor" ? (
                <Code2 className="h-4 w-4 text-violet-400" />
              ) : (
                <Pencil className="h-4 w-4 text-violet-400" />
              )}
            </div>

            <TabsList className="h-8 bg-white/[0.04] p-0.5">
              <TabsTrigger
                value="editor"
                className="h-7 gap-1.5 rounded-md px-3 text-xs font-medium text-white/60 data-[state=active]:bg-white/[0.08] data-[state=active]:text-white data-[state=active]:shadow-none"
              >
                <Code2 className="h-3.5 w-3.5" />
                Editor
              </TabsTrigger>
              <TabsTrigger
                value="scratchpad"
                className="h-7 gap-1.5 rounded-md px-3 text-xs font-medium text-white/60 data-[state=active]:bg-white/[0.08] data-[state=active]:text-white data-[state=active]:shadow-none"
              >
                <Pencil className="h-3.5 w-3.5" />
                ScratchPad
              </TabsTrigger>
            </TabsList>

            {activeTab === "editor" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 text-xs text-white/70 hover:bg-white/[0.06] hover:text-white"
                  >
                    <span className={languageConfig[language].iconColor}>{languageConfig[language].icon}</span>
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
                      <span className={config.iconColor}>{config.icon}</span>
                      {lang}
                      {language === lang && (
                        <Check className="ml-auto h-3.5 w-3.5 text-violet-400" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {activeTab === "editor" && (
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 rounded-lg p-0 text-white/50 hover:bg-white/[0.06] hover:text-white"
                    aria-label="Editor settings"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 border-white/[0.08] bg-[#18181b] text-white"
                >
                  <div className="px-2 py-1.5 text-xs font-medium text-white/40">Font Size</div>
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDecreaseFontSize}
                      disabled={fontSize === FONT_SIZE_OPTIONS[0]}
                      className="h-7 w-7 rounded-md p-0 text-white/70 hover:bg-white/[0.08] hover:text-white disabled:opacity-30"
                      aria-label="Decrease font size"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <span className="min-w-[3rem] text-center text-sm font-medium text-white/90">{fontSize}px</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleIncreaseFontSize}
                      disabled={fontSize === FONT_SIZE_OPTIONS[FONT_SIZE_OPTIONS.length - 1]}
                      className="h-7 w-7 rounded-md p-0 text-white/70 hover:bg-white/[0.08] hover:text-white disabled:opacity-30"
                      aria-label="Increase font size"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="my-1 h-px bg-white/[0.06]" />
                  <div className="grid grid-cols-4 gap-1 p-2">
                    {FONT_SIZE_OPTIONS.map((size) => (
                      <Button
                        key={size}
                        variant="ghost"
                        size="sm"
                        onClick={() => setFontSize(size)}
                        className={`h-7 rounded-md px-0 text-xs ${fontSize === size ? "bg-violet-500/20 text-violet-400" : "text-white/60 hover:bg-white/[0.06] hover:text-white"}`}
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
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
          )}
        </div>

        <TabsContent value="editor" className="m-0 flex-1 overflow-hidden">
          <Editor
            height="100%"
            language={languageConfig[language].id}
            value={value}
            onChange={(val) => onChange(val || "")}
            onMount={handleEditorMount}
            options={{
              fontSize,
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
        </TabsContent>

        <TabsContent value="scratchpad" className="m-0 flex-1 overflow-hidden">
          <ScratchPad />
        </TabsContent>

        {activeTab === "editor" && (
          <div className="flex items-center justify-between border-t border-white/[0.06] bg-white/[0.015] px-4 py-2">
            <div className="flex items-center gap-4 text-xs text-white/40">
              <span className="font-mono">
                Ln {cursorPosition.line}, Col {cursorPosition.column}
              </span>
              <span>UTF-8</span>
              <span className="capitalize">{languageConfig[language].id}</span>
              <span>{fontSize}px</span>
            </div>
            <Badge
              variant="outline"
              className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
            >
              <div className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Synced
            </Badge>
          </div>
        )}
      </Tabs>
    </div>
  )
}
