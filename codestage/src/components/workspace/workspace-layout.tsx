"use client";

import type { Client, Message } from "@stomp/stompjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import type { AssessmentEvent, AssessmentEventType } from "@/lib/assessments";
import type { JwtCandidate } from "@/lib/generated-api";
import { createStompMessage, type StompMessage, StompMessageType } from "@/lib/ws-helper";
import { EditorPanel } from "./editor-panel";
import { EventsPanel } from "./events-panel";
import { NotesPanel } from "./notes-panel";
import { TerminalPanel } from "./terminal-panel";
import { WorkspaceHeader } from "./workspace-header";

interface RemoteCursorProps {
	name: string;
	color: string;
	x: number;
	y: number;
}

interface WorkspaceLayoutProps {
	user: JwtCandidate;
	stompClient: Client;
}

function RemoteCursor({ name, color, x, y }: RemoteCursorProps) {
	return (
		<div
			className="pointer-events-none fixed z-9999 transition-all duration-150 ease-out"
			style={{ left: x, top: y }}
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
	const [code, setCode] = useState(`function solution(arr) {
  return arr.flat(Infinity);
}

console.log(solution([1, [2, [3, [4]]]]));
console.log(solution([1, 2, 3]));`);
	const [terminalOutput, setTerminalOutput] = useState<string[]>([
		"CodeStage Console Output",
	]);
	const [events, setEvents] = useState<AssessmentEvent[]>([]);
	const tabSwitchTimeRef = useRef<number | null>(null);

	const [remoteCursorPos, setRemoteCursorPos] = useState({ x: 400, y: 300 });
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const interval = setInterval(() => {
			setRemoteCursorPos((prev) => {
				const maxX = window.innerWidth - 100;
				const maxY = window.innerHeight - 100;

				const deltaX = (Math.random() - 0.5) * 120;
				const deltaY = (Math.random() - 0.5) * 80;

				const newX = Math.max(50, Math.min(maxX, prev.x + deltaX));
				const newY = Math.max(80, Math.min(maxY, prev.y + deltaY));

				return { x: newX, y: newY };
			});
		}, 600);

		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		if (!user.isAdmin) {
			console.log(`Subscribing to notes for session: ${user.sessionId}`);
			stompClient.subscribe(
				`/topic/${user.sessionId}/notes`,
				(message: Message) => {
					const messageData = JSON.parse(message.body) as StompMessage<string>;
					if (messageData.type === StompMessageType.NOTES) {
						setNotes(messageData.data);
					}
				},
			);
		}
	}, [stompClient.subscribe, user.isAdmin, user.sessionId]);

	const addEvent = useCallback(
		(type: AssessmentEventType, details?: string) => {
			const newEvent: AssessmentEvent = {
				id: crypto.randomUUID(),
				type,
				timestamp: new Date().toISOString(),
				details,
			};
			setEvents((prev) => [...prev, newEvent]);
		},
		[],
	);

	useEffect(() => {
		addEvent("session_start");
	}, [addEvent]);

	useEffect(() => {
		const handleVisibilityChange = () => {
			if (document.hidden) {
				tabSwitchTimeRef.current = Date.now();
				addEvent("tab_switch", "Switched away from tab");
			} else {
				if (tabSwitchTimeRef.current) {
					const awayTime = Math.round(
						(Date.now() - tabSwitchTimeRef.current) / 1000,
					);
					addEvent("focus_gained", `Returned after ${awayTime}s`);
					tabSwitchTimeRef.current = null;
				}
			}
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);
		return () =>
			document.removeEventListener("visibilitychange", handleVisibilityChange);
	}, [addEvent]);

	useEffect(() => {
		const handlePaste = (e: ClipboardEvent) => {
			const pastedText = e.clipboardData?.getData("text") || "";
			addEvent("paste", `${pastedText.length} chars`);
		};

		document.addEventListener("paste", handlePaste);
		return () => document.removeEventListener("paste", handlePaste);
	}, [addEvent]);

	useEffect(() => {
		const handleCopy = () => {
			const selection = window.getSelection();
			const selectedText = selection?.toString() || "";
			addEvent("copy", `${selectedText.length} chars`);
		};

		document.addEventListener("copy", handleCopy);
		return () => document.removeEventListener("copy", handleCopy);
	}, [addEvent]);

	const handleRunCode = () => {
		addEvent("code_run");
		setTerminalOutput((prev) => [
			...prev,
			"",
			"$ node solution.js",
			"[1, 2, 3, 4]",
			"[1, 2, 3]",
			"",
			"✓ Executed successfully",
		]);
	};

	const handleEditNotes = (notes: string) => {
		setNotes(notes);
		stompClient.publish({
			destination: `/app/${user.sessionId}/notes`,
			body: createStompMessage(
				notes,
				StompMessageType.NOTES,
				user.sessionId ?? "",
			),
		});
		console.log(`Sent notes to server: ${notes}`);
	};

	const handleClearTerminal = () => {
		setTerminalOutput(["CodeStage Terminal v1.0"]);
	};

	return (
		<div
			ref={containerRef}
			className="relative flex h-screen flex-col overflow-hidden bg-[#09090d]"
		>
			{/* Remote Cursor Overlay - shows candidate's cursor position */}
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

			<WorkspaceHeader isAdmin={user.isAdmin ?? false} />

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
							onChange={setCode}
							onRun={handleRunCode}
						/>
					</Panel>

					<PanelResizeHandle className="group relative w-1.5 rounded-full transition-all hover:w-2 hover:bg-fuchsia-500/20 active:bg-fuchsia-500/30">
						<div className="absolute inset-y-4 left-1/2 w-px -translate-x-1/2 rounded-full bg-white/6 transition-colors group-hover:bg-fuchsia-500/50 group-active:bg-fuchsia-500" />
					</PanelResizeHandle>

					<Panel defaultSize={30} minSize={15} maxSize={40}>
						<TerminalPanel
							output={terminalOutput}
							onClear={handleClearTerminal}
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
	);
}
