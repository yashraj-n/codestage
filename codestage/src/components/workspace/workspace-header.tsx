"use client";

import { Code2, Crown, LogOut, Users } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface WorkspaceHeaderProps {
	isAdmin: boolean;
}

export function WorkspaceHeader({ isAdmin }: WorkspaceHeaderProps) {
	const [_copied, setCopied] = useState(false);

	const _handleCopyLink = () => {
		navigator.clipboard.writeText(window.location.href);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<header className="relative z-20 flex h-14 items-center justify-between border-b border-white/[0.06] bg-[#0d0d14]/80 px-4 backdrop-blur-xl">
			<div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />

			<div className="flex items-center gap-4">
				<div className="flex items-center gap-2.5">
					<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
						<Code2 className="h-4.5 w-4.5 text-white" />
					</div>
					<span className="text-lg font-semibold text-white">CodeStage</span>
				</div>

				<div className="h-6 w-px bg-white/[0.08]" />

				<div className="flex items-center gap-3">
					{isAdmin && (
						<Badge
							variant="outline"
							className="gap-1.5 border-amber-500/25 bg-amber-500/10 text-amber-400"
						>
							<Crown className="h-3 w-3" />
							Admin
						</Badge>
					)}
				</div>
			</div>

			<div className="flex items-center gap-2">
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 transition-colors hover:bg-white/[0.05]">
								<div className="flex -space-x-2">
									<Avatar className="h-6 w-6 border-2 border-[#0d0d14] ring-1 ring-white/10">
										<AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-500 text-[10px] font-medium text-white">
											JD
										</AvatarFallback>
									</Avatar>
									<Avatar className="h-6 w-6 border-2 border-[#0d0d14] ring-1 ring-white/10">
										<AvatarFallback className="bg-gradient-to-br from-fuchsia-500 to-pink-500 text-[10px] font-medium text-white">
											SK
										</AvatarFallback>
									</Avatar>
								</div>
								<div className="flex items-center gap-1.5">
									<Users className="h-3.5 w-3.5 text-white/40" />
									<span className="text-xs font-medium text-white/60">2</span>
								</div>
							</div>
						</TooltipTrigger>
						<TooltipContent
							side="bottom"
							className="border-white/[0.08] bg-[#18181b] text-white"
						>
							<p>John Doe, Sarah Kim online</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				<Button
					variant="ghost"
					size="sm"
					className="gap-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300"
				>
					<LogOut className="h-4 w-4" />
					{isAdmin ? "End Session" : "Logout"}
				</Button>
			</div>
		</header>
	);
}
