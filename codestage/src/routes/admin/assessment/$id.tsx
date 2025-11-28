import type { Monaco } from "@monaco-editor/react";
import Editor from "@monaco-editor/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	Activity,
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
import {
	type Assessment,
	type AssessmentEvent,
	type AssessmentEventType,
	type CodeSnapshot,
	getAssessmentById,
} from "@/lib/assessments";
import { languageConfig, setupEditorTheme } from "@/lib/editor-languages";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export const Route = createFileRoute("/admin/assessment/$id")({
	component: AssessmentViewPage,
});

const PLAYBACK_SPEEDS = [0.5, 1, 1.5, 2, 4];

function AssessmentViewPage() {
	const { id } = Route.useParams();
	const { admin } = useAuthStore();
	const navigate = useNavigate();
	const [assessment, setAssessment] = useState<Assessment | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [playbackSpeed, setPlaybackSpeed] = useState(1);
	const [activeEventId, setActiveEventId] = useState<string | null>(null);
	const playbackRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const eventListRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!admin) {
			navigate({ to: "/admin" });
			return;
		}

		const found = getAssessmentById(id);
		setAssessment(found || null);
		setIsLoading(false);
	}, [admin, id, navigate]);

	const handleEditorMount = (_editor: unknown, monaco: Monaco) => {
		setupEditorTheme(monaco);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
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

	const getEventIcon = (type: AssessmentEventType) => {
		const icons: Record<AssessmentEventType, React.ReactNode> = {
			tab_switch: <EyeOff className="h-3.5 w-3.5" />,
			paste: <Clipboard className="h-3.5 w-3.5" />,
			copy: <Copy className="h-3.5 w-3.5" />,
			focus_lost: <EyeOff className="h-3.5 w-3.5" />,
			focus_gained: <Eye className="h-3.5 w-3.5" />,
			session_start: <LogIn className="h-3.5 w-3.5" />,
			session_end: <LogOut className="h-3.5 w-3.5" />,
			code_run: <Play className="h-3.5 w-3.5" />,
		};
		return icons[type];
	};

	const getEventStyle = (type: AssessmentEventType) => {
		const styles: Record<
			AssessmentEventType,
			{ bg: string; text: string; border: string; marker: string }
		> = {
			tab_switch: {
				bg: "bg-red-500/10",
				text: "text-red-400",
				border: "border-red-500/20",
				marker: "bg-red-500",
			},
			paste: {
				bg: "bg-amber-500/10",
				text: "text-amber-400",
				border: "border-amber-500/20",
				marker: "bg-amber-500",
			},
			copy: {
				bg: "bg-orange-500/10",
				text: "text-orange-400",
				border: "border-orange-500/20",
				marker: "bg-orange-500",
			},
			focus_lost: {
				bg: "bg-red-500/10",
				text: "text-red-400",
				border: "border-red-500/20",
				marker: "bg-red-500",
			},
			focus_gained: {
				bg: "bg-emerald-500/10",
				text: "text-emerald-400",
				border: "border-emerald-500/20",
				marker: "bg-emerald-500",
			},
			session_start: {
				bg: "bg-cyan-500/10",
				text: "text-cyan-400",
				border: "border-cyan-500/20",
				marker: "bg-cyan-500",
			},
			session_end: {
				bg: "bg-violet-500/10",
				text: "text-violet-400",
				border: "border-violet-500/20",
				marker: "bg-violet-500",
			},
			code_run: {
				bg: "bg-blue-500/10",
				text: "text-blue-400",
				border: "border-blue-500/20",
				marker: "bg-blue-500",
			},
		};
		return styles[type];
	};

	const getEventLabel = (type: AssessmentEventType) => {
		const labels: Record<AssessmentEventType, string> = {
			tab_switch: "Tab Switched",
			paste: "Content Pasted",
			copy: "Content Copied",
			focus_lost: "Window Focus Lost",
			focus_gained: "Window Focus Gained",
			session_start: "Session Started",
			session_end: "Session Ended",
			code_run: "Code Executed",
		};
		return labels[type];
	};

	const submission = assessment?.submission;
	const languageId =
		submission && languageConfig[submission.language]
			? languageConfig[submission.language].id
			: "javascript";

	const sessionDuration = useMemo(() => {
		if (!submission) return 300;
		const start = new Date(assessment?.createdAt || Date.now()).getTime();
		const end = new Date(submission.submittedAt).getTime();
		return Math.max(60, Math.floor((end - start) / 1000));
	}, [assessment?.createdAt, submission]);

	const sampleEvents: AssessmentEvent[] = useMemo(() => {
		if (submission?.events) return submission.events;

		const baseTime = new Date(assessment?.createdAt || Date.now()).getTime();
		return [
			{
				id: "1",
				type: "session_start" as AssessmentEventType,
				timestamp: new Date(baseTime).toISOString(),
			},
			{
				id: "2",
				type: "paste" as AssessmentEventType,
				timestamp: new Date(baseTime + 45000).toISOString(),
				details: "Pasted 45 characters",
			},
			{
				id: "3",
				type: "code_run" as AssessmentEventType,
				timestamp: new Date(baseTime + 90000).toISOString(),
			},
			{
				id: "4",
				type: "tab_switch" as AssessmentEventType,
				timestamp: new Date(baseTime + 120000).toISOString(),
				details: "Away for 12 seconds",
			},
			{
				id: "5",
				type: "focus_gained" as AssessmentEventType,
				timestamp: new Date(baseTime + 132000).toISOString(),
			},
			{
				id: "6",
				type: "code_run" as AssessmentEventType,
				timestamp: new Date(baseTime + 180000).toISOString(),
			},
			{
				id: "7",
				type: "copy" as AssessmentEventType,
				timestamp: new Date(baseTime + 210000).toISOString(),
				details: "Copied 23 characters",
			},
			{
				id: "8",
				type: "tab_switch" as AssessmentEventType,
				timestamp: new Date(baseTime + 240000).toISOString(),
				details: "Away for 8 seconds",
			},
			{
				id: "9",
				type: "focus_gained" as AssessmentEventType,
				timestamp: new Date(baseTime + 248000).toISOString(),
			},
			{
				id: "10",
				type: "code_run" as AssessmentEventType,
				timestamp: new Date(baseTime + 280000).toISOString(),
			},
			{
				id: "11",
				type: "session_end" as AssessmentEventType,
				timestamp: new Date(baseTime + sessionDuration * 1000).toISOString(),
			},
		];
	}, [assessment?.createdAt, submission?.events, sessionDuration]);

	const codeSnapshots: CodeSnapshot[] = useMemo(() => {
		if (submission?.codeSnapshots) return submission.codeSnapshots;

		const baseTime = new Date(assessment?.createdAt || Date.now()).getTime();
		const finalCode =
			submission?.code ||
			`function solution(input) {\n  // Your code here\n  return input;\n}`;

		return [
			{
				id: "snap-1",
				timestamp: new Date(baseTime).toISOString(),
				code: `// Welcome to CodeStage\n// Start coding here...\n\nfunction solution(input) {\n  \n}`,
			},
			{
				id: "snap-2",
				timestamp: new Date(baseTime + 30000).toISOString(),
				code: `// Welcome to CodeStage\n// Start coding here...\n\nfunction solution(input) {\n  // Processing input\n  const result = [];\n}`,
				eventId: "2",
			},
			{
				id: "snap-3",
				timestamp: new Date(baseTime + 60000).toISOString(),
				code: `function solution(input) {\n  // Processing input\n  const result = [];\n  \n  for (let i = 0; i < input.length; i++) {\n    result.push(input[i]);\n  }\n}`,
			},
			{
				id: "snap-4",
				timestamp: new Date(baseTime + 90000).toISOString(),
				code: `function solution(input) {\n  // Processing input\n  const result = [];\n  \n  for (let i = 0; i < input.length; i++) {\n    result.push(input[i] * 2);\n  }\n  \n  return result;\n}`,
				eventId: "3",
			},
			{
				id: "snap-5",
				timestamp: new Date(baseTime + 150000).toISOString(),
				code: `function solution(input) {\n  // Processing input array\n  const result = [];\n  \n  for (let i = 0; i < input.length; i++) {\n    const value = input[i] * 2;\n    if (value > 10) {\n      result.push(value);\n    }\n  }\n  \n  return result;\n}`,
			},
			{
				id: "snap-6",
				timestamp: new Date(baseTime + 180000).toISOString(),
				code: `function solution(input) {\n  // Filter and transform input\n  return input\n    .map(x => x * 2)\n    .filter(x => x > 10);\n}`,
				eventId: "6",
			},
			{
				id: "snap-7",
				timestamp: new Date(baseTime + 220000).toISOString(),
				code: `function solution(input) {\n  // Filter and transform input\n  // Optimized with modern JS\n  return input\n    .map(x => x * 2)\n    .filter(x => x > 10)\n    .sort((a, b) => a - b);\n}`,
			},
			{
				id: "snap-8",
				timestamp: new Date(baseTime + sessionDuration * 1000).toISOString(),
				code: finalCode,
				eventId: "11",
			},
		];
	}, [
		assessment?.createdAt,
		submission?.codeSnapshots,
		submission?.code,
		sessionDuration,
	]);

	const getEventTimeOffset = useCallback(
		(timestamp: string) => {
			const baseTime = new Date(assessment?.createdAt || Date.now()).getTime();
			const eventTime = new Date(timestamp).getTime();
			return Math.max(0, (eventTime - baseTime) / 1000);
		},
		[assessment?.createdAt],
	);

	const getCurrentCode = useCallback(() => {
		const baseTime = new Date(assessment?.createdAt || Date.now()).getTime();
		const targetTime = baseTime + currentTime * 1000;

		let currentSnapshot = codeSnapshots[0];
		for (const snapshot of codeSnapshots) {
			const snapshotTime = new Date(snapshot.timestamp).getTime();
			if (snapshotTime <= targetTime) {
				currentSnapshot = snapshot;
			} else {
				break;
			}
		}
		return currentSnapshot?.code || "";
	}, [assessment?.createdAt, currentTime, codeSnapshots]);

	const getCurrentEvent = useCallback(() => {
		const baseTime = new Date(assessment?.createdAt || Date.now()).getTime();
		const targetTime = baseTime + currentTime * 1000;

		let currentEvent: AssessmentEvent | null = null;
		for (const event of sampleEvents) {
			const eventTime = new Date(event.timestamp).getTime();
			if (eventTime <= targetTime) {
				currentEvent = event;
			} else {
				break;
			}
		}
		return currentEvent;
	}, [assessment?.createdAt, currentTime, sampleEvents]);

	useEffect(() => {
		const event = getCurrentEvent();
		if (event && event.id !== activeEventId) {
			setActiveEventId(event.id);
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
		(event: AssessmentEvent) => {
			const offset = getEventTimeOffset(event.timestamp);
			setCurrentTime(offset);
			setIsPlaying(false);
		},
		[getEventTimeOffset],
	);

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-[#09090d]">
				<Loader2 className="h-8 w-8 animate-spin text-violet-400" />
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
							className="gap-1.5 border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
						>
							<CheckCircle2 className="h-3 w-3" />
							{assessment.status === "completed"
								? "Completed"
								: assessment.status}
						</Badge>
					</div>
				</div>
			</header>

			<main className="relative z-10 flex-1 overflow-hidden p-3">
				{submission ? (
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
														{submission.language}
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
													language={languageId}
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
													{submission.terminalOutput.length > 0 ? (
														submission.terminalOutput.map((line, idx) => {
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
											{sampleEvents.length}
										</Badge>
									</div>

									<ScrollArea className="flex-1" ref={eventListRef}>
										<div className="p-3 space-y-1.5">
											{sampleEvents.map((event) => {
												const style = getEventStyle(event.type);
												const eventOffset = getEventTimeOffset(event.timestamp);
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
																	? `border-white/4 bg-white/2 opacity-60`
																	: `border-white/4 bg-white/2 opacity-40`,
															"hover:opacity-100 hover:bg-white/4 cursor-pointer",
														)}
														aria-label={`Jump to ${getEventLabel(event.type)} at ${formatPlaybackTime(eventOffset)}`}
													>
														<div
															className={cn(
																"flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors",
																isActive
																	? `${style.bg} ${style.text}`
																	: "bg-white/5 text-white/40",
															)}
														>
															{getEventIcon(event.type)}
														</div>
														<div className="flex-1 min-w-0">
															<div className="flex items-center justify-between gap-2">
																<span
																	className={cn(
																		"text-sm font-medium transition-colors",
																		isActive ? style.text : "text-white/70",
																	)}
																>
																	{getEventLabel(event.type)}
																</span>
																<span className="text-xs text-white/40 tabular-nums font-mono">
																	{formatPlaybackTime(eventOffset)}
																</span>
															</div>
															{event.details && (
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
											{submission.notes ? (
												<pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-white/70">
													{submission.notes}
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
									{sampleEvents.map((event) => {
										const offset = getEventTimeOffset(event.timestamp);
										const position = (offset / sessionDuration) * 100;
										const style = getEventStyle(event.type);
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
												title={`${getEventLabel(event.type)} at ${formatPlaybackTime(offset)}`}
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
