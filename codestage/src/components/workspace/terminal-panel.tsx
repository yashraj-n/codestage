"use client"

import { Terminal, Trash2, Download, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TerminalPanelProps {
  output: string[]
  onClear: () => void
}

export function TerminalPanel({ output, onClear }: TerminalPanelProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
      {/* Terminal header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <Terminal className="h-4 w-4 text-purple-400" />
          </div>
          <span className="font-medium text-white">Terminal</span>
        </div>
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-white/40 hover:bg-white/10 hover:text-white"
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="border-white/10 bg-[#1a1a24] text-white">
                Export logs
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-white/40 hover:bg-white/10 hover:text-white"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="border-white/10 bg-[#1a1a24] text-white">
                Expand
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClear}
                  className="h-7 w-7 text-white/40 hover:bg-white/10 hover:text-white"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="border-white/10 bg-[#1a1a24] text-white">
                Clear terminal
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Terminal output */}
      <div className="flex-1 overflow-auto bg-[#0d0d12] p-4">
        <div className="font-mono text-sm leading-6">
          {output.map((line, i) => (
            <div
              key={i}
              className={
                line.startsWith("$")
                  ? "text-cyan-400"
                  : line.startsWith("✓")
                    ? "text-green-400"
                    : line.startsWith("✗") || line.startsWith("Error")
                      ? "text-red-400"
                      : "text-white/60"
              }
            >
              {line || "\u00A0"}
            </div>
          ))}
          {/* Blinking cursor */}
          <div className="flex items-center text-white/60">
            <span className="text-green-400">$</span>
            <span className="ml-2 inline-block h-4 w-2 animate-pulse bg-green-400" />
          </div>
        </div>
      </div>

      {/* Input area */}
      <div className="flex items-center gap-2 border-t border-white/10 bg-white/[0.02] px-4 py-2">
        <span className="font-mono text-sm text-green-400">$</span>
        <input
          type="text"
          placeholder="Type command..."
          className="flex-1 bg-transparent font-mono text-sm text-white/80 placeholder:text-white/30 focus:outline-none"
        />
      </div>
    </div>
  )
}
