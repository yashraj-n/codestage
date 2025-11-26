"use client"

import { useState } from "react"
import { Terminal, Trash2, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface TerminalPanelProps {
  output: string[]
  onClear: () => void
}

export function TerminalPanel({ output, onClear }: TerminalPanelProps) {
  const [stdin, setStdin] = useState("")

  const getLineClass = (line: string) => {
    if (line.startsWith("$")) return "text-violet-400"
    if (line.startsWith("✓") || line.includes("successfully"))
      return "text-emerald-400"
    if (
      line.startsWith("✗") ||
      line.startsWith("Error") ||
      line.includes("error")
    )
      return "text-red-400"
    if (line.startsWith("Warning") || line.includes("warning"))
      return "text-amber-400"
    if (line.startsWith("//") || line.startsWith("#")) return "text-white/30"
    return "text-white/60"
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/8 bg-linear-to-b from-[#13131a] to-[#0d0d14]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-fuchsia-500/40 to-transparent" />

      <div className="flex items-center justify-between border-b border-white/6 bg-white/2 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-br from-fuchsia-500/20 to-pink-500/20 ring-1 ring-white/10">
            <Terminal className="h-4 w-4 text-fuchsia-400" />
          </div>
          <span className="font-medium text-white/90">Console</span>
        </div>
        <div className="flex items-center gap-1">

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClear}
                  className="h-7 w-7 rounded-lg text-white/40 hover:bg-white/6 hover:text-white"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="border-white/8 bg-[#18181b] text-white"
              >
                Clear console
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-[#0a0a0f] p-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        <div className="font-mono text-sm leading-7">
          {output.map((line, i) => (
            <div key={i} className={getLineClass(line)}>
              {line || "\u00A0"}
            </div>
          ))}
          <div className="flex items-center text-white/60">
            <span className="text-emerald-400">$</span>
            <span className="ml-2 inline-block h-4 w-0.5 animate-pulse bg-emerald-400" />
          </div>
        </div>
      </div>

      <div className="border-t border-white/6 bg-[#0d0d12]">
        <div className="flex items-center gap-2 border-b border-white/4 px-4 py-2">
          <ChevronRight className="h-3.5 w-3.5 text-cyan-400" />
          <span className="text-xs font-medium text-white/50">
            Standard Input (stdin)
          </span>
        </div>
        <div className="relative">
          <textarea
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            placeholder="Enter program input here...&#10;Each line will be read by your program"
            rows={3}
            className="w-full resize-none bg-transparent px-4 py-3 font-mono text-sm leading-relaxed text-white/80 placeholder:text-white/20 focus:outline-none"
            spellCheck={false}
          />
          <div className="pointer-events-none absolute bottom-2 right-3 flex items-center gap-1.5 text-[10px] text-white/30">
            <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5">
              Ctrl
            </kbd>
            <span>+</span>
            <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5">
              Enter
            </kbd>
            <span className="ml-1">to run</span>
          </div>
        </div>
      </div>
    </div>
  )
}
