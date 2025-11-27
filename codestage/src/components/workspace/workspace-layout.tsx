"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import { NotesPanel } from "./notes-panel"
import { EditorPanel } from "./editor-panel"
import { TerminalPanel } from "./terminal-panel"
import { WorkspaceHeader } from "./workspace-header"
import { EventsPanel } from "./events-panel"
import type { AssessmentEvent, AssessmentEventType } from "@/lib/assessments"

export function WorkspaceLayout() {
  const [isAdmin] = useState(true)
  const [notes, setNotes] = useState(
    "## Interview Notes\n\n- Candidate: John Doe\n- Position: Senior Frontend Engineer\n- Date: Nov 26, 2025\n\n### Questions\n\n1. Implement array flatten\n2. Discuss React patterns"
  )
  const [code, setCode] = useState(`function solution(arr) {
  return arr.flat(Infinity);
}

console.log(solution([1, [2, [3, [4]]]]));
console.log(solution([1, 2, 3]));`)
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    "CodeStage Console Output",
  ])
  const [events, setEvents] = useState<AssessmentEvent[]>([])
  const tabSwitchTimeRef = useRef<number | null>(null)

  const addEvent = useCallback((type: AssessmentEventType, details?: string) => {
    const newEvent: AssessmentEvent = {
      id: crypto.randomUUID(),
      type,
      timestamp: new Date().toISOString(),
      details,
    }
    setEvents((prev) => [...prev, newEvent])
  }, [])

  // Track session start
  useEffect(() => {
    addEvent("session_start")
  }, [addEvent])

  // Track tab visibility changes (tab switch)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        tabSwitchTimeRef.current = Date.now()
        addEvent("tab_switch", "Switched away from tab")
      } else {
        if (tabSwitchTimeRef.current) {
          const awayTime = Math.round((Date.now() - tabSwitchTimeRef.current) / 1000)
          addEvent("focus_gained", `Returned after ${awayTime}s`)
          tabSwitchTimeRef.current = null
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [addEvent])

  // Track paste events
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const pastedText = e.clipboardData?.getData("text") || ""
      addEvent("paste", `${pastedText.length} chars`)
    }

    document.addEventListener("paste", handlePaste)
    return () => document.removeEventListener("paste", handlePaste)
  }, [addEvent])

  // Track copy events
  useEffect(() => {
    const handleCopy = () => {
      const selection = window.getSelection()
      const selectedText = selection?.toString() || ""
      addEvent("copy", `${selectedText.length} chars`)
    }

    document.addEventListener("copy", handleCopy)
    return () => document.removeEventListener("copy", handleCopy)
  }, [addEvent])

  const handleRunCode = () => {
    addEvent("code_run")
    setTerminalOutput((prev) => [
      ...prev,
      "",
      "$ node solution.js",
      "[1, 2, 3, 4]",
      "[1, 2, 3]",
      "",
      "✓ Executed successfully",
    ])
  }

  const handleClearTerminal = () => {
    setTerminalOutput([
      "CodeStage Terminal v1.0",
    ])
  }

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-[#09090d]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-48 -top-48 h-[600px] w-[600px] rounded-full bg-violet-600/8 blur-[150px]" />
        <div className="absolute -right-48 top-1/3 h-[500px] w-[500px] rounded-full bg-fuchsia-600/6 blur-[130px]" />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-purple-600/5 blur-[120px]" />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]" />

      <WorkspaceHeader isAdmin={isAdmin} />

      <div className="relative z-10 flex-1 overflow-hidden p-3">
        <PanelGroup direction="horizontal" className="h-full gap-3">
          <Panel defaultSize={15} minSize={12} maxSize={25}>
            <NotesPanel value={notes} onChange={setNotes} isAdmin={isAdmin} />
          </Panel>

          <PanelResizeHandle className="group relative w-1.5 rounded-full transition-all hover:w-2 hover:bg-violet-500/20 active:bg-violet-500/30">
            <div className="absolute inset-y-4 left-1/2 w-px -translate-x-1/2 rounded-full bg-white/[0.06] transition-colors group-hover:bg-violet-500/50 group-active:bg-violet-500" />
          </PanelResizeHandle>

          <Panel defaultSize={40} minSize={30}>
            <EditorPanel value={code} onChange={setCode} onRun={handleRunCode} />
          </Panel>

          <PanelResizeHandle className="group relative w-1.5 rounded-full transition-all hover:w-2 hover:bg-fuchsia-500/20 active:bg-fuchsia-500/30">
            <div className="absolute inset-y-4 left-1/2 w-px -translate-x-1/2 rounded-full bg-white/[0.06] transition-colors group-hover:bg-fuchsia-500/50 group-active:bg-fuchsia-500" />
          </PanelResizeHandle>

          <Panel defaultSize={30} minSize={15} maxSize={40}>
            <TerminalPanel output={terminalOutput} onClear={handleClearTerminal} />
          </Panel>

          {isAdmin && (
            <>
              <PanelResizeHandle className="group relative w-1.5 rounded-full transition-all hover:w-2 hover:bg-rose-500/20 active:bg-rose-500/30">
                <div className="absolute inset-y-4 left-1/2 w-px -translate-x-1/2 rounded-full bg-white/[0.06] transition-colors group-hover:bg-rose-500/50 group-active:bg-rose-500" />
              </PanelResizeHandle>

              <Panel defaultSize={15} minSize={12} maxSize={25}>
                <EventsPanel events={events} isAdmin={isAdmin} />
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>
    </div>
  )
}
