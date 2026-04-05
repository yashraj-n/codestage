"use client";

import {
	Activity,
	Clipboard,
	Copy,
	Eye,
	EyeOff,
	LogIn,
	LogOut,
	Play,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AssessmentEvent, AssessmentEventType } from "@/lib/assessments";

interface EventsPanelProps {
	events: AssessmentEvent[];
	isAdmin: boolean;
}

const getEventIcon = (type: AssessmentEventType) => {
	const icons: Record<AssessmentEventType, React.ReactNode> = {
		TAB_SWITCH: <EyeOff className="h-3 w-3" />,
		PASTE: <Clipboard className="h-3 w-3" />,
		COPY: <Copy className="h-3 w-3" />,
		FOCUS_LOST: <EyeOff className="h-3 w-3" />,
		FOCUS_GAINED: <Eye className="h-3 w-3" />,
		SESSION_START: <LogIn className="h-3 w-3" />,
		SESSION_END: <LogOut className="h-3 w-3" />,
		CODE_RUN: <Play className="h-3 w-3" />,
		CODE_CHANGE: <Activity className="h-3 w-3" />,
		EXECUTE_CODE: <Play className="h-3 w-3" />,
		GAZE_AWAY: <EyeOff className="h-3 w-3" />,
	};
	return icons[type] ?? <Activity className="h-3 w-3" />;
};

const getEventStyle = (type: AssessmentEventType) => {
	const styles: Record<
		AssessmentEventType,
		{ bg: string; text: string; border: string }
	> = {
		TAB_SWITCH: {
			bg: "bg-red-500/10",
			text: "text-red-400",
			border: "border-red-500/20",
		},
		PASTE: {
			bg: "bg-amber-500/10",
			text: "text-amber-400",
			border: "border-amber-500/20",
		},
		COPY: {
			bg: "bg-orange-500/10",
			text: "text-orange-400",
			border: "border-orange-500/20",
		},
		FOCUS_LOST: {
			bg: "bg-red-500/10",
			text: "text-red-400",
			border: "border-red-500/20",
		},
		FOCUS_GAINED: {
			bg: "bg-emerald-500/10",
			text: "text-emerald-400",
			border: "border-emerald-500/20",
		},
		SESSION_START: {
			bg: "bg-cyan-500/10",
			text: "text-cyan-400",
			border: "border-cyan-500/20",
		},
		SESSION_END: {
			bg: "bg-violet-500/10",
			text: "text-violet-400",
			border: "border-violet-500/20",
		},
		CODE_RUN: {
			bg: "bg-blue-500/10",
			text: "text-blue-400",
			border: "border-blue-500/20",
		},
		CODE_CHANGE: {
			bg: "bg-indigo-500/10",
			text: "text-indigo-400",
			border: "border-indigo-500/20",
		},
		EXECUTE_CODE: {
			bg: "bg-green-500/10",
			text: "text-green-400",
			border: "border-green-500/20",
		},
		GAZE_AWAY: {
			bg: "bg-red-500/10",
			text: "text-red-400",
			border: "border-red-500/20",
		},
	};
	return styles[type] ?? {
		bg: "bg-gray-500/10",
		text: "text-gray-400",
		border: "border-gray-500/20",
	};
};

const getEventLabel = (type: AssessmentEventType) => {
	const labels: Record<AssessmentEventType, string> = {
		TAB_SWITCH: "Tab Switch",
		PASTE: "Paste",
		COPY: "Copy",
		FOCUS_LOST: "Focus Lost",
		FOCUS_GAINED: "Focus Gained",
		SESSION_START: "Session Start",
		SESSION_END: "Session End",
		CODE_RUN: "Code Run",
		CODE_CHANGE: "Code Change",
		EXECUTE_CODE: "Execute Code",
		GAZE_AWAY: "Gaze Away",
	};
	return labels[type] ?? type;
};

const formatTime = (dateString: string) => {
	return new Date(dateString).toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});
};

export function EventsPanel({ events, isAdmin }: EventsPanelProps) {
	if (!isAdmin) return null;

	return (
		<div className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d14]/80 backdrop-blur-sm">
			<div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
				<div className="flex items-center gap-2">
					<div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500/20 to-pink-500/20 ring-1 ring-white/10">
						<Activity className="h-3 w-3 text-rose-400" />
					</div>
					<span className="text-sm font-medium text-white/90">Events</span>
				</div>
				<Badge
					variant="outline"
					className="border-white/10 bg-white/5 text-[10px] text-white/50"
				>
					{events.length}
				</Badge>
			</div>

			<ScrollArea className="flex-1">
				<div className="space-y-1.5 p-2">
					{events.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-8 text-center">
							<Activity className="mb-2 h-6 w-6 text-white/20" />
							<p className="text-xs text-white/30">No events yet</p>
						</div>
					) : (
						[...events].reverse().map((event) => {
							const style = getEventStyle(event.type);
							return (
								<div
									key={event.id}
									className={`flex items-center gap-2 rounded-lg border ${style.border} ${style.bg} px-2.5 py-2 transition-all`}
								>
									<div
										className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${style.text}`}
									>
										{getEventIcon(event.type)}
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-center justify-between gap-1">
											<span className={`text-xs font-medium ${style.text}`}>
												{getEventLabel(event.type)}
											</span>
											<span className="text-[10px] text-white/30 tabular-nums">
												{formatTime(event.timestamp)}
											</span>
										</div>
										{event.details && (
											<p className="text-[10px] text-white/40 truncate">
												{event.details}
											</p>
										)}
									</div>
								</div>
							);
						})
					)}
				</div>
			</ScrollArea>
		</div>
	);
}
