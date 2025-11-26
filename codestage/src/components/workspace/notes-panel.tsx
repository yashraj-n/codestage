"use client"

import { FileText, Lock, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface NotesPanelProps {
  value: string
  onChange: (value: string) => void
  isAdmin: boolean
}

export function NotesPanel({ value, onChange, isAdmin }: NotesPanelProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
      {/* Panel header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20">
            <FileText className="h-4 w-4 text-amber-400" />
          </div>
          <span className="font-medium text-white">Notes</span>
        </div>
        {isAdmin && (
          <Badge variant="outline" className="gap-1 border-white/10 bg-white/5 text-white/50">
            <Lock className="h-3 w-3" />
            Private
          </Badge>
        )}
      </div>

      {/* Notes content */}
      <div className="relative flex-1 overflow-auto">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Add interview notes..."
          className="h-full w-full resize-none bg-transparent p-4 font-mono text-sm leading-relaxed text-white/80 placeholder:text-white/30 focus:outline-none"
          readOnly={!isAdmin}
        />

        {/* AI suggestion hint */}
        {isAdmin && (
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/40">
              <Sparkles className="h-3 w-3" />
              <span>Press Cmd+K for AI suggestions</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
