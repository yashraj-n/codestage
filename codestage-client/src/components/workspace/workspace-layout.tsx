"use client";

import type { Message } from "@stomp/stompjs";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, ClipboardCheck, PartyPopper } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { AssessmentEvent, AssessmentEventType } from "@/lib/assessments";
import { JUDGE0_LANGUAGE_INDEX, languageConfig } from "@/lib/editor-languages";
import { generateId } from "@/lib/utils";
import type {
	EndSessionEvent,
	Judge0Request,
	Judge0Response,
	RemoteCursorProps,
	WorkspaceLayoutProps,
} from "@/types/workspace";
import { EditorPanel } from "./editor-panel";
import { EventsPanel } from "./events-panel";
import { NotesPanel } from "./notes-panel";
import { TerminalPanel } from "./terminal-panel";
import { WorkspaceHeader } from "./workspace-header";

const SMOOTH_FACTOR = 0.5;
const SEND_THROTTLE = 20;
const MIN_DISTANCE_THRESHOLD = 1;
const INITIAL_CURSOR_POS = { x: 400, y: 300 };
const SEND_MOUSE = true;

const lerp = (start: number, end: number, factor: number) =>
	start + (end - start) * factor;

const normalizeCoordinates = (x: number, y: number) => ({
	x: x / window.innerWidth,
	y: y / window.innerHeight,
});

const denormalizeCoordinates = (x: number, y: number) => ({
	x: x * window.innerWidth,
	y: y * window.innerHeight,
});

const calculateDistance = (
	p1: { x: number; y: number },
	p2: { x: number; y: number },
) => Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);

const formatBytes = (bytes: number) => {
	if (!Number.isFinite(bytes)) return "N/A";
	const kb = bytes / 1024;
	if (kb < 1024) return `${kb.toFixed(1)} KB`;
	const mb = kb / 1024;
	return `${mb.toFixed(2)} MB`;
};

function RemoteCursor({ name, color, x, y }: RemoteCursorProps) {
	return (
		<div
			className="pointer-events-none fixed left-0 top-0 z-9999"
			style={{
				transform: `translate3d(${x}px, ${y}px, 0) translate(-2px, -2px)`,
			}}
		>
			{/* Cursor SVG */}
			<svg
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				className="drop-shadow-lg"
				style={{ filter: `drop-shadow(0 2px 4px ${color}40)` }}
				aria-hidden="true"
			>
				<path
					d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.48 0 .72-.58.38-.92L6.35 2.85a.5.5 0 0 0-.85.36Z"
					fill={color}
					stroke="white"
					strokeWidth="1.5"
				/>
			</svg>
			{/* Name label */}
			<div
				className="ml-4 -mt-1 whitespace-nowrap rounded-md px-2 py-1 text-xs font-semibold text-white shadow-lg"
				style={{
					backgroundColor: color,
					boxShadow: `0 4px 12px ${color}50`,
				}}
			>
				{name}
			</div>
		</div>
	);
}

export function WorkspaceLayout({ user, stompClient }: WorkspaceLayoutProps) {
	const [notes, setNotes] = useState("Only admin can edit these notes");
	const [language, setLanguage] = useState("JavaScript");
	const [code, setCode] = useState(`function solution(arr) {
  return arr.flat(Infinity);
}

console.log(solution([1, [2, [3, [4]]]]));
console.log(solution([1, 2, 3]));`);
	const [stdin, setStdin] = useState("");
	const [terminalOutput, setTerminalOutput] = useState<string[]>([
		"CodeStage Console Output",
	]);
	const [events, setEvents] = useState<AssessmentEvent[]>([]);
	const tabSwitchTimeRef = useRef<number | null>(null);
	const runTimeoutRef = useRef<number | null>(null);
	const [isRunning, setIsRunning] = useState(false);
	const [remoteCaretPos, setRemoteCaretPos] = useState({ lineNumber: 1, column: 1 });
	const [sessionEnded, setSessionEnded] = useState(false);

	const [remoteCursorPos, setRemoteCursorPos] = useState(INITIAL_CURSOR_POS);
	const cursorRefs = {
		current: useRef(INITIAL_CURSOR_POS),
		target: useRef(INITIAL_CURSOR_POS),
		mouse: useRef({ x: 0, y: 0 }),
		animationFrame: useRef<number | null>(null),
		lastSendTime: useRef(0),
	};

	const containerRef = useRef<HTMLDivElement>(null);
	const remoteDrawChangeHandlerRef = useRef<((changes: unknown) => void) | null>(
		null,
	);

	const addEvent = useCallback(
		(type: AssessmentEventType, details?: string) => {
			const timestamp = new Date().toISOString();
			const newEvent: AssessmentEvent = {
				id: generateId(),
				type,
				timestamp,
				details,
			};
			setEvents((prev) => [...prev, newEvent]);

			if (!user.isAdmin && stompClient.connected) {
				stompClient.publish({
					destination: `/app/${user.sessionId}/events`,
					body: JSON.stringify({
						type,
						details: details ?? null,
						timestamp,
					}),
				});
			}
		},
		[user.isAdmin, user.sessionId, stompClient],
	);

	useEffect(() => {
		const subscriptions: Array<{ unsubscribe: () => void }> = [];
		let mouseMoveHandler: ((e: MouseEvent) => void) | null = null;

		if (!user.isAdmin) {
			const notesSub = stompClient.subscribe(
				`/topic/${user.sessionId}/notes`,
				(message: Message) => setNotes(message.body),
			);
			subscriptions.push(notesSub);
		}

		if (user.isAdmin) {
			const langSub = stompClient.subscribe(
				`/topic/${user.sessionId}/language-switch`,
				(message: Message) => {
					setLanguage(message.body);
				},
			);
			subscriptions.push(langSub);

			const codeSub = stompClient.subscribe(
				`/topic/${user.sessionId}/code-change`,
				(message: Message) => {
					setCode(message.body);
				},
			);
			subscriptions.push(codeSub);

			const caretSub = stompClient.subscribe(
				`/topic/${user.sessionId}/caret-move`,
				(message: Message) => {
					const [lineNumber, column] = JSON.parse(message.body);
					setRemoteCaretPos({ lineNumber, column });
				},
			);
			subscriptions.push(caretSub);

			const drawDiffSub = stompClient.subscribe(
				`/topic/${user.sessionId}/draw-diff`,
				(message: Message) => {
					try {
						const changes = JSON.parse(message.body);
						remoteDrawChangeHandlerRef.current?.(changes);
					} catch (error) {
						console.error("Error parsing draw-diff:", error);
					}
				},
			);
			subscriptions.push(drawDiffSub);

			const eventsSub = stompClient.subscribe(
				`/topic/${user.sessionId}/events`,
				(message: Message) => {
					try {
						const event = JSON.parse(message.body);
						const newEvent: AssessmentEvent = {
							id: generateId(),
							type: event.type as AssessmentEventType,
							timestamp: event.timestamp,
							details: event.details,
						};
						setEvents((prev) => [...prev, newEvent]);
					} catch (error) {
						console.error("Error parsing event:", error);
					}
				},
			);
			subscriptions.push(eventsSub);
		}

		const executionSub = stompClient.subscribe(
			`/topic/${user.sessionId}/execute-code`,
			(message: Message) => {
				try {
					const response: Judge0Response = JSON.parse(message.body);
					const lines: string[] = [];

					if (response.stdout) {
						lines.push(...response.stdout.split("\n").filter(Boolean));
					}
					if (response.stderr) {
						lines.push(`stderr: ${response.stderr}`);
					}
					if (response.compile_output) {
						lines.push(`compile_output: ${response.compile_output}`);
					}
					if (lines.length === 0) {
						lines.push("No output");
					}

					setTerminalOutput((prev) => [
						...prev,
						"",
						"$ Execution Result",
						...lines,
						"",
						`Time: ${response.time}s | Memory: ${formatBytes(response.memory)}`,
					]);
					setIsRunning(false);
					if (runTimeoutRef.current) {
						clearTimeout(runTimeoutRef.current);
						runTimeoutRef.current = null;
					}
				} catch (error) {
					console.error("Error parsing execution response:", error);
					setIsRunning(false);
				}
			},
		);
		subscriptions.push(executionSub);

		const endSessionSub = stompClient.subscribe(
			`/topic/${user.sessionId}/end-session`,
			() => {
				setSessionEnded(true);
				if (!user.isAdmin) {
					addEvent("SESSION_END");
				}
			},
		);
		subscriptions.push(endSessionSub);

		if (!user.isAdmin && SEND_MOUSE) {
			mouseMoveHandler = (e: MouseEvent) => {
				const { x, y } = normalizeCoordinates(e.clientX, e.clientY);
				cursorRefs.mouse.current = { x: e.clientX, y: e.clientY };

				const now = Date.now();
				if (now - cursorRefs.lastSendTime.current >= SEND_THROTTLE) {
					cursorRefs.lastSendTime.current = now;

					if (stompClient.connected) {
						stompClient.publish({
							destination: `/app/${user.sessionId}/mouse`,
							body: JSON.stringify([x, y]),
						});
					}
				}
			};

			window.addEventListener("mousemove", mouseMoveHandler);
		}

		if (user.isAdmin) {
			const interpolatePosition = () => {
				const current = cursorRefs.current.current;
				const target = cursorRefs.target.current;

				const newPos = {
					x: lerp(current.x, target.x, SMOOTH_FACTOR),
					y: lerp(current.y, target.y, SMOOTH_FACTOR),
				};

				cursorRefs.current.current = newPos;
				setRemoteCursorPos(newPos);

				const distance = calculateDistance(newPos, target);
				if (distance > MIN_DISTANCE_THRESHOLD) {
					cursorRefs.animationFrame.current =
						requestAnimationFrame(interpolatePosition);
				} else {
					cursorRefs.animationFrame.current = null;
				}
			};

		const mouseSub = stompClient.subscribe(
				`/topic/${user.sessionId}/mouse`,
				(message: Message) => {
			
					const [nx, ny] = JSON.parse(message.body);
					cursorRefs.target.current = denormalizeCoordinates(nx, ny);
					if (!cursorRefs.animationFrame.current) {
						cursorRefs.animationFrame.current =
							requestAnimationFrame(interpolatePosition);
					}
				},
			);
			subscriptions.push(mouseSub);
		}

		return () => {
			if (mouseMoveHandler) {
				window.removeEventListener("mousemove", mouseMoveHandler);
			}
			for (const sub of subscriptions) {
				sub.unsubscribe();
			}
			if (cursorRefs.animationFrame.current) {
				cancelAnimationFrame(cursorRefs.animationFrame.current);
			}
		};
	}, [
		user.isAdmin,
		user.sessionId,
		stompClient,
			cursorRefs.animationFrame,
			cursorRefs.current,
			cursorRefs.lastSendTime,
			cursorRefs.mouse,
			cursorRefs.target,
		addEvent,
		]);

	useEffect(() => {
		if (!user.isAdmin) {
			addEvent("SESSION_START");
		}
	}, [addEvent, user.isAdmin]);

	useEffect(() => {
		if (user.isAdmin) return;

		const handleVisibilityChange = () => {
			if (document.hidden) {
				tabSwitchTimeRef.current = Date.now();
				addEvent("TAB_SWITCH", "Switched away from tab");
			} else if (tabSwitchTimeRef.current) {
				const awayTime = Math.round(
					(Date.now() - tabSwitchTimeRef.current) / 1000,
				);
				addEvent("FOCUS_GAINED", `Returned after ${awayTime}s`);
				tabSwitchTimeRef.current = null;
			}
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);

		return () => {
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, [addEvent, user.isAdmin]);

	const handleRunCode = useCallback(() => {
		if (!user.isAdmin) {
			addEvent("CODE_RUN");
		}
		setTerminalOutput((prev) => [...prev, "", "$ Running code..."]);
		setIsRunning(true);
		if (runTimeoutRef.current) {
			clearTimeout(runTimeoutRef.current);
		}
		runTimeoutRef.current = window.setTimeout(() => {
			setIsRunning(false);
			runTimeoutRef.current = null;
		}, 5000);

		if (stompClient?.connected) {
			const langConfig = languageConfig[language];
			const judge0Index = JUDGE0_LANGUAGE_INDEX[langConfig?.id] ?? 0;

			const request: Judge0Request = {
				language_id: judge0Index,
				source_code: code,
				stdin,
			};

			stompClient.publish({
				destination: `/app/${user.sessionId}/execute-code`,
				body: JSON.stringify(request),
			});
		}
	}, [addEvent, code, language, stdin, stompClient, user.sessionId, user.isAdmin]);

	const handleLanguageChange = useCallback(
		(newLang: string) => {
			setLanguage(newLang);
			if (!user.isAdmin) {
				stompClient.publish({
					destination: `/app/${user.sessionId}/language-switch`,
					body: newLang,
				});
			}
		},
		[user.isAdmin, user.sessionId, stompClient],
	);

	const handleCodeChange = useCallback(
		(newCode: string) => {
			setCode(newCode);
			if (!user.isAdmin) {
				stompClient.publish({
					destination: `/app/${user.sessionId}/code-change`,
					body: newCode,
				});
			}
		},
		[user.isAdmin, user.sessionId, stompClient],
	);

	const handleCaretChange = useCallback(
		(line: number, column: number) => {
			if (!user.isAdmin && stompClient.connected) {
				stompClient.publish({
					destination: `/app/${user.sessionId}/caret-move`,
					body: JSON.stringify([line, column]),
				});
			}
		},
		[user.isAdmin, user.sessionId, stompClient],
	);

	const handleEditNotes = useCallback(
		(notes: string) => {
			setNotes(notes);
			stompClient.publish({
				destination: `/app/${user.sessionId}/notes`,
				body: notes,
			});
		},
		[user.sessionId, stompClient],
	);

	const handleClearTerminal = () => {
		setTerminalOutput(["CodeStage Terminal v1.0"]);
	};

	const handleEndSession = useCallback(() => {
		if (stompClient.connected) {
			const event: EndSessionEvent = {
				code,
				notes,
			};
			stompClient.publish({
				destination: `/app/${user.sessionId}/end-session`,
				body: JSON.stringify(event),
			});
		}
	}, [code, notes, stompClient, user.sessionId]);

	return (
		<>
			<Dialog open={sessionEnded}>
				<DialogContent
					showCloseButton={false}
					className="border-white/10 bg-[#0d0d14] text-white sm:max-w-md"
				>
					{user.isAdmin ? (
						<>
							<DialogHeader className="items-center text-center">
								<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-emerald-500/20 to-green-500/20 ring-1 ring-emerald-500/30">
									<ClipboardCheck className="h-8 w-8 text-emerald-400" />
								</div>
								<DialogTitle className="text-2xl text-white">
									Session Ended
								</DialogTitle>
								<DialogDescription className="text-white/60">
									You have successfully ended this assessment session. The candidate's submission has been recorded.
								</DialogDescription>
							</DialogHeader>
							<DialogFooter className="mt-4 sm:justify-center">
								<Link to="/admin/dashboard">
									<Button className="gap-2 bg-linear-to-r from-violet-500 to-purple-600 text-white hover:from-violet-400 hover:to-purple-500">
										<CheckCircle2 className="h-4 w-4" />
										View Results
									</Button>
								</Link>
							</DialogFooter>
						</>
					) : (
						<>
							<DialogHeader className="items-center text-center">
								<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-violet-500/20 to-purple-500/20 ring-1 ring-violet-500/30">
									<PartyPopper className="h-8 w-8 text-violet-400" />
								</div>
								<DialogTitle className="text-2xl text-white">
									Session Complete!
								</DialogTitle>
								<DialogDescription className="text-white/60">
									Thank you for completing the assessment. Your submission has been recorded and will be reviewed by the team.
								</DialogDescription>
							</DialogHeader>
							<div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-center">
								<p className="text-sm text-white/50">
									You may now close this window.
								</p>
							</div>
						</>
					)}
				</DialogContent>
			</Dialog>

			<div
				ref={containerRef}
				className="relative flex h-screen flex-col overflow-hidden bg-[#09090d]"
			>
				{user.isAdmin && (
					<RemoteCursor
						name="Candidate"
						color="#f59e0b"
						x={remoteCursorPos.x}
						y={remoteCursorPos.y}
					/>
				)}

				<div className="pointer-events-none absolute inset-0 overflow-hidden">
					<div className="absolute -left-48 -top-48 h-[600px] w-[600px] rounded-full bg-violet-600/8 blur-[150px]" />
					<div className="absolute -right-48 top-1/3 h-[500px] w-[500px] rounded-full bg-fuchsia-600/6 blur-[130px]" />
					<div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-purple-600/5 blur-[120px]" />
				</div>

				<div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-size-[64px_64px] mask-[radial-gradient(ellipse_at_center,black_30%,transparent_80%)]" />

				<WorkspaceHeader isAdmin={user.isAdmin ?? false} onEndSession={handleEndSession} />

				<div className="relative z-10 flex-1 overflow-hidden p-3">
					<PanelGroup direction="horizontal" className="h-full gap-3">
						<Panel defaultSize={15} minSize={12} maxSize={25}>
							<NotesPanel
								value={notes}
								onChange={handleEditNotes}
								isAdmin={user.isAdmin ?? false}
							/>
						</Panel>

						<PanelResizeHandle className="group relative w-1.5 rounded-full transition-all hover:w-2 hover:bg-violet-500/20 active:bg-violet-500/30">
							<div className="absolute inset-y-4 left-1/2 w-px -translate-x-1/2 rounded-full bg-white/6 transition-colors group-hover:bg-violet-500/50 group-active:bg-violet-500" />
						</PanelResizeHandle>

						<Panel defaultSize={40} minSize={30}>
							<EditorPanel
								value={code}
								onChange={handleCodeChange}
								onRun={handleRunCode}
								sessionId={user.sessionId ?? ""}
								readOnly={user.isAdmin ?? false}
								isRunning={isRunning}
								language={language}
								onLanguageChange={handleLanguageChange}
								onCaretChange={handleCaretChange}
								remoteCursorPosition={user.isAdmin ? remoteCaretPos : undefined}
								showRemoteCursor={user.isAdmin}
								stompClient={stompClient}
								isAdmin={user.isAdmin ?? false}
								onRemoteDrawChange={(handler) => {
									remoteDrawChangeHandlerRef.current = handler;
								}}
								onCopy={!user.isAdmin ? (text) => addEvent("COPY", `${text.length} chars`) : undefined}
								onPaste={!user.isAdmin ? (text) => addEvent("PASTE", `${text.length} chars`) : undefined}
							/>
						</Panel>

						<PanelResizeHandle className="group relative w-1.5 rounded-full transition-all hover:w-2 hover:bg-fuchsia-500/20 active:bg-fuchsia-500/30">
							<div className="absolute inset-y-4 left-1/2 w-px -translate-x-1/2 rounded-full bg-white/6 transition-colors group-hover:bg-fuchsia-500/50 group-active:bg-fuchsia-500" />
						</PanelResizeHandle>

						<Panel defaultSize={30} minSize={15} maxSize={40}>
							<TerminalPanel
								output={terminalOutput}
								onClear={handleClearTerminal}
								stdin={stdin}
								onStdinChange={setStdin}
							/>
						</Panel>

						{user.isAdmin && (
							<>
								<PanelResizeHandle className="group relative w-1.5 rounded-full transition-all hover:w-2 hover:bg-rose-500/20 active:bg-rose-500/30">
									<div className="absolute inset-y-4 left-1/2 w-px -translate-x-1/2 rounded-full bg-white/6 transition-colors group-hover:bg-rose-500/50 group-active:bg-rose-500" />
								</PanelResizeHandle>

								<Panel defaultSize={15} minSize={12} maxSize={25}>
									<EventsPanel events={events} isAdmin={user.isAdmin} />
								</Panel>
							</>
						)}
					</PanelGroup>
				</div>
			</div>
		</>
	);
}
