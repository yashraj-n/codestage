"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Link2, Settings, LogOut, Crown, ChevronDown, Check, Zap } from "lucide-react"
import { useState } from "react"

interface WorkspaceHeaderProps {
  isAdmin: boolean
  sessionId: string
}

export function WorkspaceHeader({ isAdmin, sessionId }: WorkspaceHeaderProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <header className="relative z-20 flex h-14 items-center justify-between border-b border-white/10 bg-white/5 px-4 backdrop-blur-xl">
      {/* Left section */}
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-cyan-500 to-blue-600">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-white">CodeStage</span>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-white/10" />

        {/* Session info */}
        <div className="flex items-center gap-3">
          <code className="rounded-md border border-white/10 bg-white/5 px-2 py-1 font-mono text-xs text-white/60">
            {sessionId}
          </code>
          {isAdmin && (
            <Badge variant="outline" className="gap-1 border-amber-500/30 bg-amber-500/10 text-amber-400">
              <Crown className="h-3 w-3" />
              Admin
            </Badge>
          )}
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Participants */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                <div className="flex -space-x-2">
                  <Avatar className="h-6 w-6 border-2 border-[#0a0a0f]">
                    <AvatarFallback className="bg-linear-to-br from-cyan-500 to-blue-500 text-[10px] text-white">
                      JD
                    </AvatarFallback>
                  </Avatar>
                  <Avatar className="h-6 w-6 border-2 border-[#0a0a0f]">
                    <AvatarFallback className="bg-linear-to-br from-purple-500 to-pink-500 text-[10px] text-white">
                      SK
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-white/40" />
                  <span className="text-xs text-white/60">2/5</span>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="border-white/10 bg-[#1a1a24] text-white">
              <p>John Doe, Sarah Kim online</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Copy link button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyLink}
          className="gap-2 text-white/60 hover:bg-white/10 hover:text-white"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Link2 className="h-4 w-4" />
              <span>Invite</span>
            </>
          )}
        </Button>

        {/* Settings dropdown */}
        {isAdmin && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5 text-white/60 hover:bg-white/10 hover:text-white">
                <Settings className="h-4 w-4" />
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 border-white/10 bg-[#1a1a24] text-white">
              <DropdownMenuItem className="focus:bg-white/10">Session settings</DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-white/10">Manage participants</DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-white/10">Change language</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="focus:bg-white/10">End session</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Leave button */}
        <Button variant="ghost" size="sm" className="gap-2 text-red-400 hover:bg-red-500/10 hover:text-red-300">
          <LogOut className="h-4 w-4" />
          Leave
        </Button>
      </div>
    </header>
  )
}
