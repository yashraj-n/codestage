import type { Monaco } from "@monaco-editor/react";
import Editor from "@monaco-editor/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	Activity,
	AlertCircle,
	ArrowLeft,
	Calendar,
	CheckCircle2,
	Clipboard,
	Clock,
	Code2,
	Copy,
	Eye,
	EyeOff,
	FastForward,
	FileText,
	Loader2,
	LogIn,
	LogOut,
	Mail,
	Pause,
	Play,
	RefreshCw,
	Rewind,
	SkipBack,
	SkipForward,
	Terminal,
	User,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { assessmentsApi } from "@/lib/api-client";
import { setupEditorTheme } from "@/lib/editor-languages";
import type { WorkspaceEvent } from "@/lib/generated-api/models/WorkspaceEvent";
import { WorkspaceEventEventTypeEnum } from "@/lib/generated-api/models/WorkspaceEvent";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export const Route = createFileRoute("/admin/assessment/$id")({
	component: AssessmentViewPage,
});

const PLAYBACK_SPEEDS = [0.5, 1, 1.5, 2, 4];

type EventType = WorkspaceEventEventTypeEnum;

const getEventIcon = (type: EventType) => {
	const icons: Record<EventType, React.ReactNode> = {
		[WorkspaceEventEventTypeEnum.TabSwitch]: <EyeOff className="h-3.5 w-3.5" />,
		[WorkspaceEventEventTypeEnum.Paste]: <Clipboard className="h-3.5 w-3.5" />,
		[WorkspaceEventEventTypeEnum.Copy]: <Copy className="h-3.5 w-3.5" />,
		[WorkspaceEventEventTypeEnum.FocusLost]: <EyeOff className="h-3.5 w-3.5" />,
		[WorkspaceEventEventTypeEnum.FocusGained]: <Eye className="h-3.5 w-3.5" />,
		[WorkspaceEventEventTypeEnum.SessionStart]: (
			<LogIn className="h-3.5 w-3.5" />
		),
		[WorkspaceEventEventTypeEnum.SessionEnd]: (
			<LogOut className="h-3.5 w-3.5" />
		),
		[WorkspaceEventEventTypeEnum.CodeRun]: <Play className="h-3.5 w-3.5" />,
		[WorkspaceEventEventTypeEnum.CodeChange]: (
			<Activity className="h-3.5 w-3.5" />
		),
		[WorkspaceEventEventTypeEnum.ExecuteCode]: (
			<Terminal className="h-3.5 w-3.5" />
		),
		[WorkspaceEventEventTypeEnum.GazeAway]: <EyeOff className="h-3.5 w-3.5" />,
	};
	return icons[type];
};

const getEventStyle = (type: EventType) => {
	const styles: Record<
		EventType,
		{ bg: string; text: string; border: string; marker: string }
	> = {
		[WorkspaceEventEventTypeEnum.TabSwitch]: {
			bg: "bg-red-500/10",
			text: "text-red-400",
			border: "border-red-500/20",
			marker: "bg-red-500",
		},
		[WorkspaceEventEventTypeEnum.Paste]: {
			bg: "bg-amber-500/10",
			text: "text-amber-400",
			border: "border-amber-500/20",
			marker: "bg-amber-500",
		},
		[WorkspaceEventEventTypeEnum.Copy]: {
			bg: "bg-orange-500/10",
			text: "text-orange-400",
			border: "border-orange-500/20",
			marker: "bg-orange-500",
		},
		[WorkspaceEventEventTypeEnum.FocusLost]: {
			bg: "bg-red-500/10",
			text: "text-red-400",
			border: "border-red-500/20",
			marker: "bg-red-500",
		},
		[WorkspaceEventEventTypeEnum.FocusGained]: {
			bg: "bg-emerald-500/10",
			text: "text-emerald-400",
			border: "border-emerald-500/20",
			marker: "bg-emerald-500",
		},
		[WorkspaceEventEventTypeEnum.SessionStart]: {
			bg: "bg-cyan-500/10",
			text: "text-cyan-400",
			border: "border-cyan-500/20",
			marker: "bg-cyan-500",
		},
		[WorkspaceEventEventTypeEnum.SessionEnd]: {
			bg: "bg-violet-500/10",
			text: "text-violet-400",
			border: "border-violet-500/20",
			marker: "bg-violet-500",
		},
		[WorkspaceEventEventTypeEnum.CodeRun]: {
			bg: "bg-blue-500/10",
			text: "text-blue-400",
			border: "border-blue-500/20",
			marker: "bg-blue-500",
		},
		[WorkspaceEventEventTypeEnum.CodeChange]: {
			bg: "bg-indigo-500/10",
			text: "text-indigo-400",
			border: "border-indigo-500/20",
			marker: "bg-indigo-500",
		},
		[WorkspaceEventEventTypeEnum.ExecuteCode]: {
			bg: "bg-green-500/10",
			text: "text-green-400",
			border: "border-green-500/20",
			marker: "bg-green-500",
		},
		[WorkspaceEventEventTypeEnum.GazeAway]: {
			bg: "bg-red-500/10",
			text: "text-red-400",
			border: "border-red-500/20",
			marker: "bg-red-500",
		},
	};
	return styles[type];
};

const getEventLabel = (type: EventType) => {
	const labels: Record<EventType, string> = {
		[WorkspaceEventEventTypeEnum.TabSwitch]: "Tab Switched",
		[WorkspaceEventEventTypeEnum.Paste]: "Content Pasted",
		[WorkspaceEventEventTypeEnum.Copy]: "Content Copied",
		[WorkspaceEventEventTypeEnum.FocusLost]: "Window Focus Lost",
		[WorkspaceEventEventTypeEnum.FocusGained]: "Window Focus Gained",
		[WorkspaceEventEventTypeEnum.SessionStart]: "Session Started",
		[WorkspaceEventEventTypeEnum.SessionEnd]: "Session Ended",
		[WorkspaceEventEventTypeEnum.CodeRun]: "Code Run",
		[WorkspaceEventEventTypeEnum.CodeChange]: "Code Changed",
		[WorkspaceEventEventTypeEnum.ExecuteCode]: "Code Executed",
		[WorkspaceEventEventTypeEnum.GazeAway]: "Gaze Away",
	};
	return labels[type];
};

const formatDate = (date?: Date) => {
	if (!date) return "N/A";
	return new Date(date).toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

const formatPlaybackTime = (seconds: number) => {
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

function AssessmentViewPage() {
	const { id } = Route.useParams();
	const { admin } = useAuthStore();
	const navigate = useNavigate();

	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [playbackSpeed, setPlaybackSpeed] = useState(1);
	const [activeEventId, setActiveEventId] = useState<number | null>(null);
	const playbackRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const eventListRef = useRef<HTMLDivElement>(null);

	const {
		data,
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery({
		queryKey: ["assessment-replay", id],
		queryFn: () => assessmentsApi.replay({ sessionId: id }),
		enabled: !!admin,
	});

	const assessment = data?.assessment;
	const events = useMemo(() => {
		const rawEvents = data?.events ?? [];
		return [...rawEvents].sort(
			(a, b) =>
				new Date(a.createdAt ?? 0).getTime() -
				new Date(b.createdAt ?? 0).getTime(),
		);
	}, [data?.events]);

	useEffect(() => {
		if (!admin) {
			navigate({ to: "/admin" });
		}
	}, [admin, navigate]);

	const handleEditorMount = (_editor: unknown, monaco: Monaco) => {
		setupEditorTheme(monaco);
	};

	const sessionStart = useMemo(() => {
		const startEvent = events.find(
			(e) => e.eventType === WorkspaceEventEventTypeEnum.SessionStart,
		);
		return startEvent?.createdAt
			? new Date(startEvent.createdAt).getTime()
			: assessment?.createdAt
				? new Date(assessment.createdAt).getTime()
				: Date.now();
	}, [events, assessment?.createdAt]);

	const sessionDuration = useMemo(() => {
		if (events.length === 0) return 300;
		const endEvent = events.find(
			(e) => e.eventType === WorkspaceEventEventTypeEnum.SessionEnd,
		);
		const lastEvent = events[events.length - 1];
		const endTime = endEvent?.createdAt ?? lastEvent?.createdAt;
		if (!endTime) return 300;
		return Math.max(60, Math.floor((new Date(endTime).getTime() - sessionStart) / 1000));
	}, [events, sessionStart]);

	const codeSnapshots = useMemo(() => {
		return events
			.filter((e) => e.eventType === WorkspaceEventEventTypeEnum.CodeChange && e.details)
			.map((e) => ({
				id: e.id,
				code: e.details ?? "",
				timestamp: e.createdAt,
			}));
	}, [events]);

	const terminalOutputs = useMemo(() => {
		return events
			.filter((e) => e.eventType === WorkspaceEventEventTypeEnum.ExecuteCode && e.details)
			.map((e) => {
				try {
					const parsed = JSON.parse(e.details ?? "{}");
					return {
						id: e.id,
						stdout: parsed.stdout ?? null,
						stderr: parsed.stderr ?? null,
						compile_output: parsed.compile_output ?? null,
						timestamp: e.createdAt,
					};
				} catch {
					return null;
				}
			})
			.filter(Boolean);
	}, [events]);

	const getEventTimeOffset = useCallback(
		(timestamp?: Date) => {
			if (!timestamp) return 0;
			const eventTime = new Date(timestamp).getTime();
			return Math.max(0, (eventTime - sessionStart) / 1000);
		},
		[sessionStart],
	);

	const getCurrentCode = useCallback(() => {
		const targetTime = sessionStart + currentTime * 1000;

		let currentSnapshot = codeSnapshots[0];
		for (const snapshot of codeSnapshots) {
			if (!snapshot.timestamp) continue;
			const snapshotTime = new Date(snapshot.timestamp).getTime();
			if (snapshotTime <= targetTime) {
				currentSnapshot = snapshot;
			} else {
				break;
			}
		}
		return currentSnapshot?.code || "";
	}, [sessionStart, currentTime, codeSnapshots]);

	const getCurrentTerminalOutput = useCallback(() => {
		const targetTime = sessionStart + currentTime * 1000;
		const outputs: string[] = [];

		for (const output of terminalOutputs) {
			if (!output?.timestamp) continue;
			const outputTime = new Date(output.timestamp).getTime();
			if (outputTime <= targetTime) {
				if (output.compile_output) outputs.push(`$ Compile: ${output.compile_output}`);
				if (output.stdout) outputs.push(output.stdout);
				if (output.stderr) outputs.push(`✗ ${output.stderr}`);
			}
		}
		return outputs;
	}, [sessionStart, currentTime, terminalOutputs]);

	const getCurrentEvent = useCallback(() => {
		const targetTime = sessionStart + currentTime * 1000;

		let currentEvent: WorkspaceEvent | null = null;
		for (const event of events) {
			if (!event.createdAt) continue;
			const eventTime = new Date(event.createdAt).getTime();
			if (eventTime <= targetTime) {
				currentEvent = event;
			} else {
				break;
			}
		}
		return currentEvent;
	}, [sessionStart, currentTime, events]);

	useEffect(() => {
		const event = getCurrentEvent();
		if (event && event.id !== activeEventId) {
			setActiveEventId(event.id ?? null);
		}
	}, [getCurrentEvent, activeEventId]);

	useEffect(() => {
		if (isPlaying) {
			playbackRef.current = setInterval(() => {
				setCurrentTime((prev) => {
					const next = prev + 0.1 * playbackSpeed;
					if (next >= sessionDuration) {
						setIsPlaying(false);
						return sessionDuration;
					}
					return next;
				});
			}, 100);
		} else {
			if (playbackRef.current) {
				clearInterval(playbackRef.current);
				playbackRef.current = null;
			}
		}

		return () => {
			if (playbackRef.current) {
				clearInterval(playbackRef.current);
				playbackRef.current = null;
			}
		};
	}, [isPlaying, playbackSpeed, sessionDuration]);

	const handlePlayPause = useCallback(() => {
		setIsPlaying((prev) => {
			if (currentTime >= sessionDuration && !prev) {
				setCurrentTime(0);
			}
			return !prev;
		});
	}, [currentTime, sessionDuration]);

	const handleSeek = useCallback((value: number[]) => {
		setCurrentTime(value[0]);
	}, []);

	const handleSkipBack = useCallback(() => {
		setCurrentTime((prev) => Math.max(0, prev - 10));
	}, []);

	const handleSkipForward = useCallback(() => {
		setCurrentTime((prev) => Math.min(sessionDuration, prev + 10));
	}, [sessionDuration]);

	const handleRestart = useCallback(() => {
		setCurrentTime(0);
		setIsPlaying(false);
	}, []);

	const handleEnd = useCallback(() => {
		setCurrentTime(sessionDuration);
		setIsPlaying(false);
	}, [sessionDuration]);

	const handleSpeedChange = useCallback(() => {
		setPlaybackSpeed((prev) => {
			const currentIndex = PLAYBACK_SPEEDS.indexOf(prev);
			const nextIndex = (currentIndex + 1) % PLAYBACK_SPEEDS.length;
			return PLAYBACK_SPEEDS[nextIndex];
		});
	}, []);

	const handleEventClick = useCallback(
		(event: WorkspaceEvent) => {
			const offset = getEventTimeOffset(event.createdAt);
			setCurrentTime(offset);
			setIsPlaying(false);
		},
		[getEventTimeOffset],
	);

	if (!admin) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-[#09090d]">
				<Loader2 className="h-8 w-8 animate-spin text-violet-400" />
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-[#09090d]">
				<Loader2 className="h-8 w-8 animate-spin text-violet-400" />
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#09090d]">
				<div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
					<AlertCircle className="h-8 w-8 text-red-400" />
				</div>
				<div className="text-center">
					<h2 className="text-lg font-semibold text-white">
						Failed to load assessment
					</h2>
					<p className="mt-1 text-sm text-white/50">
						{error instanceof Error ? error.message : "An unexpected error occurred"}
					</p>
				</div>
				<Button onClick={() => refetch()} variant="outline" className="gap-2">
					<RefreshCw className="h-4 w-4" />
					Retry
				</Button>
			</div>
		);
	}

	if (!assessment) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center bg-[#09090d] px-6">
				<div className="text-center">
					<h1 className="mb-2 text-2xl font-semibold text-white">
						Assessment Not Found
					</h1>
					<p className="mb-6 text-white/50">
						The assessment you're looking for doesn't exist.
					</p>
					<Link to="/admin/dashboard">
						<Button variant="outline" className="gap-2">
							<ArrowLeft className="h-4 w-4" />
							Back to Dashboard
						</Button>
					</Link>
				</div>
			</div>
		);
	}

	const currentCode = getCurrentCode();
	const terminalOutput = getCurrentTerminalOutput();

	return (
		<div className="flex flex-col h-screen bg-[#09090d] overflow-hidden">
			<div className="pointer-events-none fixed inset-0 overflow-hidden">
				<div className="absolute -left-48 -top-48 h-[500px] w-[500px] rounded-full bg-violet-600/5 blur-[150px]" />
				<div className="absolute -right-48 bottom-0 h-[400px] w-[400px] rounded-full bg-fuchsia-600/5 blur-[130px]" />
			</div>

			<header className="sticky top-0 z-50 border-b border-white/6 bg-[#09090d]/80 backdrop-blur-xl shrink-0">
				<div className="mx-auto flex h-14 max-w-[1800px] items-center justify-between px-6">
					<div className="flex items-center gap-4">
						<Link to="/admin/dashboard">
							<Button
								variant="ghost"
								size="sm"
								className="gap-2 text-white/60 hover:bg-white/6 hover:text-white"
							>
								<ArrowLeft className="h-4 w-4" />
								Back
							</Button>
						</Link>
						<div className="h-6 w-px bg-white/8" />
						<div className="flex items-center gap-2">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-violet-500 to-purple-600">
								<Code2 className="h-4 w-4 text-white" />
							</div>
							<span className="font-semibold text-white">CodeStage</span>
						</div>
					</div>

					<div className="flex items-center gap-4">
						<div className="flex items-center gap-3 text-sm">
							<User className="h-4 w-4 text-white/40" />
							<span className="text-white/70">{assessment.candidateName}</span>
							<span className="text-white/30">•</span>
							<Mail className="h-4 w-4 text-white/40" />
							<span className="text-white/70">{assessment.candidateEmail}</span>
						</div>
						<Badge
							variant="outline"
							className={cn(
								"gap-1.5",
								assessment.completed
									? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
									: "border-amber-500/25 bg-amber-500/10 text-amber-400",
							)}
						>
							{assessment.completed ? (
								<>
									<CheckCircle2 className="h-3 w-3" />
									Completed
								</>
							) : (
								<>
									<Clock className="h-3 w-3" />
									Pending
								</>
							)}
						</Badge>
					</div>
				</div>
			</header>

			<main className="relative z-10 flex-1 overflow-hidden p-3">
				{assessment.completed ? (
					<div className="flex h-full flex-col gap-3">
						<PanelGroup direction="horizontal" className="flex-1 gap-3">
							<Panel defaultSize={60} minSize={30}>
								<PanelGroup direction="vertical" className="h-full gap-3">
									<Panel defaultSize={70} minSize={30}>
										<div className="flex flex-col h-full overflow-hidden rounded-2xl border border-white/6 bg-[#0d0d14]">
											<div className="flex items-center justify-between border-b border-white/6 bg-white/2 px-4 py-2.5 shrink-0">
												<div className="flex items-center gap-3">
													<div className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-br from-violet-500/20 to-purple-500/20 ring-1 ring-white/10">
														<Code2 className="h-4 w-4 text-violet-400" />
													</div>
													<span className="font-medium text-white/90">
														Session Replay
													</span>
												</div>
												<div className="flex items-center gap-2">
													<Badge
														variant="outline"
														className="border-white/10 bg-white/5 text-white/60"
													>
														JavaScript
													</Badge>
													<div className="h-4 w-px bg-white/10" />
													<div className="flex items-center gap-1.5 text-xs text-white/50">
														<Calendar className="h-3.5 w-3.5" />
														{formatDate(assessment.createdAt)}
													</div>
												</div>
											</div>

											<div className="flex-1 min-h-0">
												<Editor
													height="100%"
													language="javascript"
													value={currentCode}
													onMount={handleEditorMount}
													options={{
														readOnly: true,
														fontSize: 14,
														fontFamily:
															"'JetBrains Mono', 'Fira Code', Consolas, monospace",
														fontLigatures: true,
														lineHeight: 24,
														padding: { top: 16, bottom: 16 },
														minimap: { enabled: false },
														scrollBeyondLastLine: false,
														renderLineHighlight: "none",
														cursorStyle: "line",
														domReadOnly: true,
													}}
												/>
											</div>
										</div>
									</Panel>

									<PanelResizeHandle className="group relative h-1.5 rounded-full transition-all hover:h-2 hover:bg-fuchsia-500/20 active:bg-fuchsia-500/30">
										<div className="absolute inset-x-4 top-1/2 h-px -translate-y-1/2 rounded-full bg-white/6 transition-colors group-hover:bg-fuchsia-500/50 group-active:bg-fuchsia-500" />
									</PanelResizeHandle>

									<Panel defaultSize={30} minSize={15}>
										<div className="flex flex-col h-full overflow-hidden rounded-2xl border border-white/6 bg-[#0a0a0f]">
											<div className="flex items-center gap-3 border-b border-white/4 px-4 py-2 shrink-0">
												<Terminal className="h-4 w-4 text-white/40" />
												<span className="text-sm font-medium text-white/60">
													Console Output
												</span>
											</div>
											<ScrollArea className="flex-1">
												<div className="p-4 font-mono text-sm leading-6">
													{terminalOutput.length > 0 ? (
														terminalOutput.map((line, idx) => {
															const lineKey = `${idx}-${line.slice(0, 20)}`;
															return (
																<div
																	key={lineKey}
																	className={
																		line.startsWith("$")
																			? "text-violet-400"
																			: line.startsWith("✓")
																				? "text-emerald-400"
																				: line.startsWith("✗") ||
																					  line.includes("Error")
																					? "text-red-400"
																					: "text-white/60"
																	}
																>
																	{line || "\u00A0"}
																</div>
															);
														})
													) : (
														<p className="text-white/30">No output recorded</p>
													)}
												</div>
											</ScrollArea>
										</div>
									</Panel>
								</PanelGroup>
							</Panel>

							<PanelResizeHandle className="group relative w-1.5 rounded-full transition-all hover:w-2 hover:bg-violet-500/20 active:bg-violet-500/30">
								<div className="absolute inset-y-4 left-1/2 w-px -translate-x-1/2 rounded-full bg-white/6 transition-colors group-hover:bg-violet-500/50 group-active:bg-violet-500" />
							</PanelResizeHandle>

							<Panel defaultSize={25} minSize={15} maxSize={40}>
								<div className="flex flex-col h-full overflow-hidden rounded-2xl border border-white/6 bg-[#0a0a0f]">
									<div className="flex items-center justify-between border-b border-white/6 bg-white/2 px-4 py-2.5 shrink-0">
										<div className="flex items-center gap-3">
											<div className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-br from-rose-500/20 to-pink-500/20 ring-1 ring-white/10">
												<Activity className="h-4 w-4 text-rose-400" />
											</div>
											<span className="font-medium text-white/90">
												Timeline Events
											</span>
										</div>
										<Badge
											variant="outline"
											className="border-white/10 bg-white/5 text-white/60"
										>
											{events.length}
										</Badge>
									</div>

									<div className="flex-1 min-h-0 overflow-hidden">
										<ScrollArea className="h-full" ref={eventListRef}>
										<div className="p-3 space-y-1.5">
											{events.map((event) => {
												const style = getEventStyle(event.eventType);
												const eventOffset = getEventTimeOffset(event.createdAt);
												const isActive = activeEventId === event.id;
												const isPast = eventOffset <= currentTime;

												return (
													<button
														key={event.id}
														type="button"
														onClick={() => handleEventClick(event)}
														className={cn(
															"w-full flex items-start gap-3 rounded-xl border p-3 transition-all text-left",
															isActive
																? `${style.border} ${style.bg} ring-1 ring-white/10 scale-[1.02]`
																: isPast
																	? "border-white/4 bg-white/2 opacity-60"
																	: "border-white/4 bg-white/2 opacity-40",
															"hover:opacity-100 hover:bg-white/4 cursor-pointer",
														)}
														aria-label={`Jump to ${getEventLabel(event.eventType)} at ${formatPlaybackTime(eventOffset)}`}
													>
														<div
															className={cn(
																"flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors",
																isActive
																	? `${style.bg} ${style.text}`
																	: "bg-white/5 text-white/40",
															)}
														>
															{getEventIcon(event.eventType)}
														</div>
														<div className="flex-1 min-w-0">
															<div className="flex items-center justify-between gap-2">
																<span
																	className={cn(
																		"text-sm font-medium transition-colors",
																		isActive ? style.text : "text-white/70",
																	)}
																>
																	{getEventLabel(event.eventType)}
																</span>
																<span className="text-xs text-white/40 tabular-nums font-mono">
																	{formatPlaybackTime(eventOffset)}
																</span>
															</div>
															{event.details &&
																event.eventType !==
																	WorkspaceEventEventTypeEnum.CodeChange && (
																	<p className="mt-0.5 text-xs text-white/40 truncate">
																		{event.details}
																	</p>
																)}
														</div>
														{isActive && (
															<div
																className={cn(
																	"h-2 w-2 rounded-full animate-pulse",
																	style.marker,
																)}
															/>
														)}
													</button>
												);
											})}
										</div>
										</ScrollArea>
									</div>
								</div>
							</Panel>

							<PanelResizeHandle className="group relative w-1.5 rounded-full transition-all hover:w-2 hover:bg-amber-500/20 active:bg-amber-500/30">
								<div className="absolute inset-y-4 left-1/2 w-px -translate-x-1/2 rounded-full bg-white/6 transition-colors group-hover:bg-amber-500/50 group-active:bg-amber-500" />
							</PanelResizeHandle>

							<Panel defaultSize={15} minSize={12} maxSize={25}>
								<div className="flex flex-col h-full overflow-hidden rounded-2xl border border-white/6 bg-[#0a0a0f]">
									<div className="flex items-center gap-3 border-b border-white/6 bg-white/2 px-4 py-2.5 shrink-0">
										<div className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-br from-amber-500/20 to-orange-500/20 ring-1 ring-white/10">
											<FileText className="h-4 w-4 text-amber-400" />
										</div>
										<span className="font-medium text-white/90">Notes</span>
									</div>
									<ScrollArea className="flex-1">
										<div className="p-4">
											{assessment.notes ? (
												<pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-white/70">
													{assessment.notes}
												</pre>
											) : (
												<p className="text-sm text-white/30">
													No notes recorded
												</p>
											)}
										</div>
									</ScrollArea>
								</div>
							</Panel>
						</PanelGroup>

						<div className="rounded-2xl border border-white/8 bg-linear-to-b from-[#0d0d14] to-[#0a0a0f] px-6 py-4 shrink-0">
							<div className="relative mb-3">
								<div className="absolute inset-0 flex items-center pointer-events-none">
									{events.map((event) => {
										const offset = getEventTimeOffset(event.createdAt);
										const position = (offset / sessionDuration) * 100;
										const style = getEventStyle(event.eventType);
										return (
											<div
												key={event.id}
												className={cn(
													"absolute w-1 h-3 rounded-full -translate-x-1/2 transition-all",
													style.marker,
													activeEventId === event.id
														? "h-4 opacity-100"
														: "opacity-50",
												)}
												style={{ left: `${position}%` }}
												title={`${getEventLabel(event.eventType)} at ${formatPlaybackTime(offset)}`}
											/>
										);
									})}
								</div>

								<Slider
									value={[currentTime]}
									min={0}
									max={sessionDuration}
									step={0.1}
									onValueChange={handleSeek}
									className="relative z-10"
									aria-label="Session timeline"
								/>
							</div>

							<div className="flex items-center justify-between">
								<div className="flex items-center gap-1">
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={handleRestart}
										className="h-9 w-9 text-white/50 hover:text-white hover:bg-white/6"
										aria-label="Restart"
									>
										<SkipBack className="h-4 w-4" />
									</Button>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={handleSkipBack}
										className="h-9 w-9 text-white/50 hover:text-white hover:bg-white/6"
										aria-label="Skip back 10 seconds"
									>
										<Rewind className="h-4 w-4" />
									</Button>

									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={handlePlayPause}
										className="h-12 w-12 rounded-full bg-linear-to-br from-violet-500 to-purple-600 text-white hover:from-violet-400 hover:to-purple-500 hover:text-white shadow-lg shadow-violet-500/25"
										aria-label={isPlaying ? "Pause" : "Play"}
									>
										{isPlaying ? (
											<Pause className="h-5 w-5" />
										) : (
											<Play className="h-5 w-5 ml-0.5" />
										)}
									</Button>

									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={handleSkipForward}
										className="h-9 w-9 text-white/50 hover:text-white hover:bg-white/6"
										aria-label="Skip forward 10 seconds"
									>
										<FastForward className="h-4 w-4" />
									</Button>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={handleEnd}
										className="h-9 w-9 text-white/50 hover:text-white hover:bg-white/6"
										aria-label="Go to end"
									>
										<SkipForward className="h-4 w-4" />
									</Button>
								</div>

								<div className="flex items-center gap-6">
									<div className="flex items-center gap-3">
										<span className="text-sm font-mono text-white/80 tabular-nums">
											{formatPlaybackTime(currentTime)}
										</span>
										<div className="h-4 w-px bg-white/10" />
										<span className="text-sm font-mono text-white/40 tabular-nums">
											{formatPlaybackTime(sessionDuration)}
										</span>
									</div>

									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={handleSpeedChange}
										className="w-16 border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white font-mono text-xs"
										aria-label={`Playback speed: ${playbackSpeed}x. Click to change.`}
									>
										{playbackSpeed}x
									</Button>
								</div>
							</div>
						</div>
					</div>
				) : (
					<div className="flex flex-col items-center justify-center h-full px-6">
						<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
							<Clock className="h-8 w-8 text-white/30" />
						</div>
						<h3 className="mb-2 text-lg font-medium text-white">
							Assessment Not Completed
						</h3>
						<p className="text-sm text-white/50">
							This assessment hasn't been submitted yet.
						</p>
					</div>
				)}
			</main>
		</div>
	);
}
