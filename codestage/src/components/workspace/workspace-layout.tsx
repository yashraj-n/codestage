"use client"

import { useState } from "react"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import { NotesPanel } from "./notes-panel"
import { EditorPanel } from "./editor-panel"
import { TerminalPanel } from "./terminal-panel"
import { WorkspaceHeader } from "./workspace-header"

export function WorkspaceLayout() {
  const [isAdmin] = useState(false)
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
          <Panel defaultSize={20} minSize={15} maxSize={35}>
            <NotesPanel value={notes} onChange={setNotes} isAdmin={isAdmin} />
          </Panel>

          <PanelResizeHandle className="group relative w-1.5 rounded-full transition-all hover:w-2 hover:bg-violet-500/20 active:bg-violet-500/30">
            <div className="absolute inset-y-4 left-1/2 w-px -translate-x-1/2 rounded-full bg-white/[0.06] transition-colors group-hover:bg-violet-500/50 group-active:bg-violet-500" />
          </PanelResizeHandle>

          <Panel defaultSize={50} minSize={30}>
            <EditorPanel value={code} onChange={setCode} onRun={handleRunCode} />
          </Panel>

          <PanelResizeHandle className="group relative w-1.5 rounded-full transition-all hover:w-2 hover:bg-fuchsia-500/20 active:bg-fuchsia-500/30">
            <div className="absolute inset-y-4 left-1/2 w-px -translate-x-1/2 rounded-full bg-white/[0.06] transition-colors group-hover:bg-fuchsia-500/50 group-active:bg-fuchsia-500" />
          </PanelResizeHandle>

          <Panel defaultSize={30} minSize={20} maxSize={45}>
            <TerminalPanel output={terminalOutput} onClear={handleClearTerminal} />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  )
}
