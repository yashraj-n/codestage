"use client"

import { useState } from "react"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import { NotesPanel } from "./notes-panel"
import { EditorPanel } from "./editor-panel"
import { TerminalPanel } from "./terminal-panel"
import { WorkspaceHeader } from "./workspace-header"

export function WorkspaceLayout() {
  const [isAdmin] = useState(true)
  const [notes, setNotes] = useState(
    "## Interview Notes\n\n- Candidate: John Doe\n- Position: Senior Frontend Engineer\n- Date: Nov 26, 2025\n\n### Questions\n\n1. Implement array flatten\n2. Discuss React patterns",
  )
  const [code, setCode] = useState(`function solution(arr) {
  // Your code here
  return arr.flat(Infinity);
}

// Test cases
console.log(solution([1, [2, [3, [4]]]]));
console.log(solution([1, 2, 3]));`)
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    "CodeStage Terminal v1.0",
    "Session initialized...",
    "Ready to run code.",
  ])

  const handleRunCode = () => {
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
    setTerminalOutput(["CodeStage Terminal v1.0", "Terminal cleared.", "Ready to run code."])
  }

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-[#0a0a0f]">
      {/* Ambient background effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <WorkspaceHeader isAdmin={isAdmin} sessionId="abc-123-xyz" />

      <div className="relative z-10 flex-1 overflow-hidden p-3">
        <PanelGroup direction="horizontal" className="h-full">
          {/* Notes Panel */}
          <Panel defaultSize={20} minSize={15} maxSize={35}>
            <NotesPanel value={notes} onChange={setNotes} isAdmin={isAdmin} />
          </Panel>

          <PanelResizeHandle className="group mx-1 w-2 rounded-full transition-colors hover:bg-white/10 active:bg-white/20">
            <div className="mx-auto h-full w-0.5 rounded-full bg-white/5 transition-colors group-hover:bg-cyan-500/50 group-active:bg-cyan-500" />
          </PanelResizeHandle>

          {/* Editor Panel */}
          <Panel defaultSize={50} minSize={30}>
            <EditorPanel value={code} onChange={setCode} onRun={handleRunCode} />
          </Panel>

          <PanelResizeHandle className="group mx-1 w-2 rounded-full transition-colors hover:bg-white/10 active:bg-white/20">
            <div className="mx-auto h-full w-0.5 rounded-full bg-white/5 transition-colors group-hover:bg-purple-500/50 group-active:bg-purple-500" />
          </PanelResizeHandle>

          {/* Terminal Panel */}
          <Panel defaultSize={30} minSize={20} maxSize={45}>
            <TerminalPanel output={terminalOutput} onClear={handleClearTerminal} />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  )
}
