"use client";

import { AlertTriangle, Code2, Crown, Eye, EyeOff, LogOut } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface WorkspaceHeaderProps {
	isAdmin: boolean;
	onEndSession: () => void;
	eyeContactStatus?: "looking" | "not-looking" | "unknown";
}

export function WorkspaceHeader({ isAdmin, onEndSession, eyeContactStatus = "unknown" }: WorkspaceHeaderProps) {
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);

	const handleEndSessionClick = () => {
		setShowConfirmDialog(true);
	};

	const handleConfirmEndSession = () => {
		setShowConfirmDialog(false);
		onEndSession();
	};

	return (
		<>
			<Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
				<DialogContent className="border-white/10 bg-[#0d0d14] text-white sm:max-w-md">
					<DialogHeader className="items-center text-center">
						<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 ring-1 ring-red-500/30">
							<AlertTriangle className="h-7 w-7 text-red-400" />
						</div>
						<DialogTitle className="text-xl text-white">
							{isAdmin ? "End Session?" : "Leave Session?"}
						</DialogTitle>
						<DialogDescription className="text-white/60">
							{isAdmin
								? "Are you sure you want to end this session? This will submit the candidate's work and they will no longer be able to make changes."
								: "Are you sure you want to leave? Your current progress will be saved."}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="mt-4 flex gap-2 sm:justify-center">
						<Button
							variant="outline"
							onClick={() => setShowConfirmDialog(false)}
							className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
						>
							Cancel
						</Button>
						<Button
							onClick={handleConfirmEndSession}
							className="gap-2 bg-red-500 text-white hover:bg-red-600"
						>
							<LogOut className="h-4 w-4" />
							{isAdmin ? "End Session" : "Leave"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

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
					{isAdmin && eyeContactStatus !== "unknown" && (
						<Badge
							variant="outline"
							className={`gap-1.5 transition-colors ${
								eyeContactStatus === "looking"
									? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
									: "border-red-500/25 bg-red-500/10 text-red-400"
							}`}
						>
							{eyeContactStatus === "looking" ? (
								<Eye className="h-3 w-3" />
							) : (
								<EyeOff className="h-3 w-3" />
							)}
							{eyeContactStatus === "looking" ? "Looking" : "Not Looking"}
						</Badge>
					)}
				</div>
			</div>

			<div className="flex items-center gap-2">
				<Button
					variant="ghost"
					size="sm"
					onClick={handleEndSessionClick}
					className="gap-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300"
				>
					<LogOut className="h-4 w-4" />
					{isAdmin ? "End Session" : "Leave"}
				</Button>
			</div>
		</header>
		</>
	);
}
