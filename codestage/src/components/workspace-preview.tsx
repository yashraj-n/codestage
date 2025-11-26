"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Code2, Terminal, Play, RotateCcw, Copy } from "lucide-react"

export function WorkspacePreview() {
  const [view, setView] = useState<"admin" | "participant">("admin")

  return (
    <section className="relative px-6 py-32">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block rounded-full border border-border/60 bg-secondary/50 px-4 py-1 text-sm text-muted-foreground">
            Live Preview
          </span>
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">See It in Action</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            A clean tri-panel workspace designed for focused technical interviews
          </p>
        </div>

        {/* View toggle */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex rounded-lg border border-border/60 bg-secondary/30 p-1">
            <button
              onClick={() => setView("admin")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                view === "admin"
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Admin View
            </button>
            <button
              onClick={() => setView("participant")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                view === "participant"
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Participant View
            </button>
          </div>
        </div>

        {/* Workspace mockup with premium styling */}
        <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/50 shadow-2xl shadow-black/20 backdrop-blur-sm">
          {/* Title bar */}
          <div className="flex items-center justify-between border-b border-border/50 bg-secondary/30 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/70" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                <div className="h-3 w-3 rounded-full bg-green-500/70" />
              </div>
              <div className="h-4 w-px bg-border/50" />
              <span className="font-mono text-xs text-muted-foreground">session-abc123</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                2 participants
              </div>
              {view === "admin" && (
                <span className="rounded-md bg-foreground px-2.5 py-1 font-mono text-xs font-medium text-background">
                  Admin
                </span>
              )}
            </div>
          </div>

          {/* Three panel layout */}
          <div className="grid h-80 grid-cols-1 divide-y divide-border/50 md:h-96 md:grid-cols-4 md:divide-x md:divide-y-0">
            {/* Notes panel */}
            <div className="flex flex-col md:col-span-1">
              <div className="flex items-center gap-2 border-b border-border/50 px-4 py-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Notes</span>
                {view === "admin" && <span className="ml-auto text-[10px] text-muted-foreground/60">Editable</span>}
              </div>
              <div className="flex-1 p-4">
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p className="text-foreground/80">Interview Questions:</p>
                  <div className="space-y-2 pl-2 text-xs">
                    <p>1. Implement binary search</p>
                    <p>2. Time complexity analysis</p>
                    <p className="text-muted-foreground/50">3. Follow-up: edge cases</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Editor panel */}
            <div className="flex flex-col bg-background/50 md:col-span-2">
              <div className="flex items-center justify-between border-b border-border/50 px-4 py-2">
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">main.py</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Play className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-4 font-mono text-xs">
                <div className="space-y-1">
                  {[
                    { num: 1, code: "def binary_search(arr, target):", color: "text-blue-400" },
                    { num: 2, code: '    """Find target in sorted array"""', color: "text-green-400/70" },
                    { num: 3, code: "    left, right = 0, len(arr) - 1", color: "text-foreground/80" },
                    { num: 4, code: "", color: "" },
                    { num: 5, code: "    while left <= right:", color: "text-blue-400" },
                    { num: 6, code: "        mid = (left + right) // 2", color: "text-foreground/80" },
                    { num: 7, code: "        if arr[mid] == target:", color: "text-blue-400" },
                    { num: 8, code: "            return mid", color: "text-foreground/80" },
                  ].map((line) => (
                    <div key={line.num} className="flex gap-4">
                      <span className="w-4 text-right text-muted-foreground/40">{line.num}</span>
                      <span className={line.color}>{line.code}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Terminal panel */}
            <div className="flex flex-col bg-background md:col-span-1">
              <div className="flex items-center gap-2 border-b border-border/50 px-4 py-2">
                <Terminal className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Output</span>
              </div>
              <div className="flex-1 p-4 font-mono text-xs">
                <div className="space-y-1 text-muted-foreground">
                  <p className="text-green-400">$ python main.py</p>
                  <p className="text-foreground/70">Running tests...</p>
                  <p className="text-green-400/80">✓ Test 1 passed</p>
                  <p className="text-green-400/80">✓ Test 2 passed</p>
                  <p className="mt-2 text-muted-foreground/60">{">"} _</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA below preview */}
        <div className="mt-12 flex justify-center">
          <Button size="lg" className="group h-12 bg-foreground px-8 text-background hover:bg-foreground/90" asChild>
            <a href="/workspace">
              Try the Full Workspace
              <Play className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
