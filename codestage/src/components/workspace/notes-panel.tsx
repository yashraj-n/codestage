"use client";

import { FileText, Lock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NotesPanelProps {
  value: string;
  onChange: (value: string) => void;
  isAdmin: boolean;
}

export function NotesPanel({ value, onChange, isAdmin }: NotesPanelProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#13131a] to-[#0d0d14]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

      <div className="flex items-center justify-between border-b border-white/6 bg-white/[0.02] px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 ring-1 ring-white/10">
            <FileText className="h-4 w-4 text-amber-400" />
          </div>
          <span className="font-medium text-white/90">Notes</span>
        </div>
        {isAdmin && (
          <Badge
            variant="outline"
            className="gap-1 border-white/8 bg-white/[0.03] text-white/50"
          >
            <Lock className="h-3 w-3" />
            Visible to All, Editable by Admin
          </Badge>
        )}
      </div>

      <div className="relative flex-1 overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Add interview notes..."
          className="h-full w-full resize-none bg-transparent p-4 font-mono text-sm leading-relaxed text-white/80 placeholder:text-white/25 focus:outline-none"
          readOnly={!isAdmin}
        />
      </div>
    </div>
  );
}
