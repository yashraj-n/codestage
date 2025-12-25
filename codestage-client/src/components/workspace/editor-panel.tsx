"use client";

import Editor, { type Monaco } from "@monaco-editor/react";
import type { Client } from "@stomp/stompjs";
import {
	Check,
	ChevronDown,
	Code2,
	Minus,
	Pencil,
	Play,
	Plus,
	RotateCcw,
	Settings,
} from "lucide-react";
import type { editor } from "monaco-editor";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	languageConfig,
	registerLanguageCompletions,
	setupEditorTheme,
} from "@/lib/editor-languages";
import { ScratchPad } from "./scratchpad";

// Remote cursor configuration
interface RemoteCursor {
	id: string;
	name: string;
	color: string;
	position: { lineNumber: number; column: number };
}

// Inject styles for remote cursors
const injectRemoteCursorStyles = () => {
	const styleId = "remote-cursor-styles";
	if (document.getElementById(styleId)) return;

	const style = document.createElement("style");
	style.id = styleId;
	style.textContent = `
		.remote-cursor-label {
			padding: 2px 8px;
			font-size: 11px;
			font-weight: 600;
			border-radius: 4px 4px 4px 0;
			white-space: nowrap;
			pointer-events: none;
			z-index: 101;
			animation: cursor-label-fade-in 0.15s ease-out;
			box-shadow: 0 2px 8px rgba(0,0,0,0.3);
			margin-top: -20px;
			margin-left: 2px;
		}
		@keyframes cursor-label-fade-in {
			from { opacity: 0; transform: translateY(-4px); }
			to { opacity: 1; transform: translateY(0); }
		}
		.remote-cursor-caret {
			border-left: 2px solid #f59e0b !important;
			margin-left: -1px;
		}
		.remote-cursor-caret::before {
			content: '';
			position: absolute;
			left: -2px;
			top: 0;
			width: 2px;
			height: 100%;
			background: #f59e0b;
			animation: cursor-blink 1s ease-in-out infinite;
		}
		@keyframes cursor-blink {
			0%, 50% { opacity: 1; }
			51%, 100% { opacity: 0.5; }
		}
		.remote-cursor-line-highlight {
			background: rgba(245, 158, 11, 0.08) !important;
		}
	`;
	document.head.appendChild(style);
};

// Content widget class for cursor label
class RemoteCursorWidget implements editor.IContentWidget {
	private readonly id: string;
	private readonly domNode: HTMLElement;
	private position: editor.IContentWidgetPosition;

	constructor(
		id: string,
		name: string,
		color: string,
		lineNumber: number,
		column: number,
	) {
		this.id = `remote-cursor-widget-${id}`;
		this.domNode = document.createElement("div");
		this.domNode.className = "remote-cursor-label";
		this.domNode.style.backgroundColor = color;
		this.domNode.style.color = "#fff";
		this.domNode.textContent = name;
		this.position = {
			position: { lineNumber, column },
			preference: [
				0, // ABOVE
				1, // BELOW
			],
		};
	}

	getId(): string {
		return this.id;
	}

	getDomNode(): HTMLElement {
		return this.domNode;
	}

	getPosition(): editor.IContentWidgetPosition {
		return this.position;
	}

	updatePosition(lineNumber: number, column: number): void {
		this.position = {
			position: { lineNumber, column },
			preference: [0, 1],
		};
	}
}

interface EditorPanelProps {
	value: string;
	onChange: (value: string) => void;
	onRun: () => void;
	isRunning?: boolean;
	language?: string;
	onLanguageChange?: (language: string) => void;
	onCaretChange?: (line: number, column: number) => void;
	remoteCursorPosition?: { lineNumber: number; column: number };
	showRemoteCursor?: boolean;
	readOnly?: boolean;
	sessionId: string;
	stompClient?: Client;
	isAdmin?: boolean;
	onRemoteDrawChange?: (handler: (changes: unknown) => void) => void;
	onCopy?: (text: string) => void;
	onPaste?: (text: string) => void;
}

const FONT_SIZE_OPTIONS = [12, 14, 16, 18, 20, 22, 24] as const;

export function EditorPanel({
	value,
	onChange,
	onRun,
	isRunning,
	language: controlledLanguage,
	onLanguageChange,
	onCaretChange,
	remoteCursorPosition,
	showRemoteCursor = false,
	readOnly = false,
	sessionId,
	stompClient,
	isAdmin = false,
	onRemoteDrawChange,
	onCopy,
	onPaste,
}: EditorPanelProps) {
	const [internalLanguage, setInternalLanguage] = useState("JavaScript");
	const language = controlledLanguage ?? internalLanguage;
	const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
	const [activeTab, setActiveTab] = useState("editor");
	const [fontSize, setFontSize] = useState(14);
	const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
	const monacoRef = useRef<Monaco | null>(null);

	// Remote cursor state
	const [remoteCursor, setRemoteCursor] = useState<RemoteCursor>({
		id: "candidate-1",
		name: "Candidate",
		color: "#f59e0b", // Amber color
		position: { lineNumber: 1, column: 1 },
	});

	const remoteCursorWidgetRef = useRef<RemoteCursorWidget | null>(null);
	const decorationsRef = useRef<string[]>([]);

	// Update remote cursor decorations
	const updateRemoteCursorDecorations = useCallback(() => {
		const editor = editorRef.current;
		const monaco = monacoRef.current;
		if (!editor || !monaco || !showRemoteCursor) return;

		const { lineNumber, column } = remoteCursor.position;

		// Update decorations (cursor caret + line highlight)
		const newDecorations: editor.IModelDeltaDecoration[] = [
			// Cursor caret (vertical line)
			{
				range: new monaco.Range(lineNumber, column, lineNumber, column),
				options: {
					className: "remote-cursor-caret",
					stickiness: 1,
					hoverMessage: { value: `**${remoteCursor.name}** is here` },
				},
			},
			// Line highlight
			{
				range: new monaco.Range(lineNumber, 1, lineNumber, 1),
				options: {
					isWholeLine: true,
					className: "remote-cursor-line-highlight",
					stickiness: 1,
				},
			},
		];

		decorationsRef.current = editor.deltaDecorations(
			decorationsRef.current,
			newDecorations,
		);

		// Update or create content widget for name label
		if (remoteCursorWidgetRef.current) {
			editor.removeContentWidget(remoteCursorWidgetRef.current);
		}

		remoteCursorWidgetRef.current = new RemoteCursorWidget(
			remoteCursor.id,
			remoteCursor.name,
			remoteCursor.color,
			lineNumber,
			column,
		);
		editor.addContentWidget(remoteCursorWidgetRef.current);
	}, [remoteCursor, showRemoteCursor]);

	useEffect(() => {
		if (showRemoteCursor) {
			updateRemoteCursorDecorations();
		}
	}, [updateRemoteCursorDecorations, showRemoteCursor]);

	useEffect(() => {
		if (remoteCursorPosition && showRemoteCursor) {
			setRemoteCursor((prev) => ({
				...prev,
				position: remoteCursorPosition,
			}));
		}
	}, [remoteCursorPosition, showRemoteCursor]);

	// Inject styles on mount and cleanup on unmount
	useEffect(() => {
		injectRemoteCursorStyles();

		return () => {
			// Cleanup: remove content widget when component unmounts
			const editor = editorRef.current;
			if (editor && remoteCursorWidgetRef.current) {
				editor.removeContentWidget(remoteCursorWidgetRef.current);
			}
		};
	}, []);

	useEffect(() => {
		if (editorRef.current) {
			editorRef.current.updateOptions({ fontSize });
		}
	}, [fontSize]);

	useEffect(() => {
		const editor = editorRef.current;
		if (!editor) return;

		const handleEditorCopy = () => {
			const selection = editor.getSelection();
			if (selection) {
				const model = editor.getModel();
				if (model) {
					const text = model.getValueInRange(selection);
					if (text.length > 0) {
						onCopy?.(text);
					}
				}
			}
		};

		const handleEditorPaste = (e: ClipboardEvent) => {
			// Check if the editor or its container is focused
			const domNode = editor.getDomNode();
			if (!domNode?.contains(document.activeElement)) return;
			
			const text = e.clipboardData?.getData("text") || "";
			if (text.length > 0) {
				onPaste?.(text);
			}
		};

		window.addEventListener("copy", handleEditorCopy, true);
		window.addEventListener("paste", handleEditorPaste, true);

		return () => {
			window.removeEventListener("copy", handleEditorCopy, true);
			window.removeEventListener("paste", handleEditorPaste, true);
		};
	}, [onCopy, onPaste]);

	const handleIncreaseFontSize = () => {
		const currentIndex = FONT_SIZE_OPTIONS.indexOf(
			fontSize as (typeof FONT_SIZE_OPTIONS)[number],
		);
		if (currentIndex < FONT_SIZE_OPTIONS.length - 1) {
			setFontSize(FONT_SIZE_OPTIONS[currentIndex + 1]);
		}
	};

	const handleDecreaseFontSize = () => {
		const currentIndex = FONT_SIZE_OPTIONS.indexOf(
			fontSize as (typeof FONT_SIZE_OPTIONS)[number],
		);
		if (currentIndex > 0) {
			setFontSize(FONT_SIZE_OPTIONS[currentIndex - 1]);
		}
	};

	const handleReset = () => {
		onChange(languageConfig[language].defaultCode);
	};

	const handleLanguageChange = (newLang: string) => {
		if (onLanguageChange) {
			onLanguageChange(newLang);
		} else {
			setInternalLanguage(newLang);
		}
		onChange(languageConfig[newLang].defaultCode);
	};

	const handleEditorMount = (
		editor: editor.IStandaloneCodeEditor,
		monaco: Monaco,
	) => {
		editorRef.current = editor;
		monacoRef.current = monaco;

		setupEditorTheme(monaco);
		registerLanguageCompletions(monaco);

		editor.onDidChangeCursorPosition((e) => {
			setCursorPosition({
				line: e.position.lineNumber,
				column: e.position.column,
			});
			onCaretChange?.(e.position.lineNumber, e.position.column);
		});

		if (showRemoteCursor) {
			setTimeout(() => {
				updateRemoteCursorDecorations();
			}, 100);
		}

		editor.focus();
	};

	return (
		<div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/8 bg-linear-to-b from-[#13131a] to-[#0d0d14]">
			<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-violet-500/50 to-transparent" />

			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="flex h-full flex-col"
			>
				<div className="flex items-center justify-between border-b border-white/6 bg-white/2 px-4 py-3">
					<div className="flex items-center gap-3">
						<div className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-br from-violet-500/20 to-purple-500/20 ring-1 ring-white/10">
							{activeTab === "editor" ? (
								<Code2 className="h-4 w-4 text-violet-400" />
							) : (
								<Pencil className="h-4 w-4 text-violet-400" />
							)}
						</div>

						<TabsList className="h-8 bg-white/4 p-0.5">
							<TabsTrigger
								value="editor"
								className="h-7 gap-1.5 rounded-md px-3 text-xs font-medium text-white/60 data-[state=active]:bg-white/8 data-[state=active]:text-white data-[state=active]:shadow-none"
							>
								<Code2 className="h-3.5 w-3.5" />
								Editor
							</TabsTrigger>
							<TabsTrigger
								value="scratchpad"
								className="h-7 gap-1.5 rounded-md px-3 text-xs font-medium text-white/60 data-[state=active]:bg-white/8 data-[state=active]:text-white data-[state=active]:shadow-none"
							>
								<Pencil className="h-3.5 w-3.5" />
								ScratchPad
							</TabsTrigger>
						</TabsList>

						{activeTab === "editor" && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										size="sm"
										className="h-7 gap-2 rounded-lg border border-white/8 bg-white/3 px-2.5 text-xs text-white/70 hover:bg-white/6 hover:text-white"
									>
										<span className={languageConfig[language].iconColor}>
											{languageConfig[language].icon}
										</span>
										{language}
										<ChevronDown className="h-3 w-3 opacity-50" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									align="start"
									className="min-w-[140px] border-white/8 bg-[#18181b] text-white"
								>
									{Object.entries(languageConfig).map(([lang, config]) => (
										<DropdownMenuItem
											key={lang}
											onClick={() => handleLanguageChange(lang)}
											className="gap-2 focus:bg-white/6"
										>
											<span className={config.iconColor}>{config.icon}</span>
											{lang}
											{language === lang && (
												<Check className="ml-auto h-3.5 w-3.5 text-violet-400" />
											)}
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					</div>

					{activeTab === "editor" && (
						<div className="flex items-center gap-2">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										size="sm"
										className="h-8 w-8 rounded-lg p-0 text-white/50 hover:bg-white/6 hover:text-white"
										aria-label="Editor settings"
									>
										<Settings className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									align="end"
									className="w-48 border-white/8 bg-[#18181b] text-white"
								>
									<div className="px-2 py-1.5 text-xs font-medium text-white/40">
										Font Size
									</div>
									<div className="flex items-center justify-between px-2 py-1.5">
										<Button
											variant="ghost"
											size="sm"
											onClick={handleDecreaseFontSize}
											disabled={fontSize === FONT_SIZE_OPTIONS[0]}
											className="h-7 w-7 rounded-md p-0 text-white/70 hover:bg-white/8 hover:text-white disabled:opacity-30"
											aria-label="Decrease font size"
										>
											<Minus className="h-3.5 w-3.5" />
										</Button>
										<span className="min-w-12 text-center text-sm font-medium text-white/90">
											{fontSize}px
										</span>
										<Button
											variant="ghost"
											size="sm"
											onClick={handleIncreaseFontSize}
											disabled={
												fontSize ===
												FONT_SIZE_OPTIONS[FONT_SIZE_OPTIONS.length - 1]
											}
											className="h-7 w-7 rounded-md p-0 text-white/70 hover:bg-white/8 hover:text-white disabled:opacity-30"
											aria-label="Increase font size"
										>
											<Plus className="h-3.5 w-3.5" />
										</Button>
									</div>
									<div className="my-1 h-px bg-white/6" />
									<div className="grid grid-cols-4 gap-1 p-2">
										{FONT_SIZE_OPTIONS.map((size) => (
											<Button
												key={size}
												variant="ghost"
												size="sm"
												onClick={() => setFontSize(size)}
												className={`h-7 rounded-md px-0 text-xs ${fontSize === size ? "bg-violet-500/20 text-violet-400" : "text-white/60 hover:bg-white/6 hover:text-white"}`}
											>
												{size}
											</Button>
										))}
									</div>
								</DropdownMenuContent>
							</DropdownMenu>
							<Button
								variant="ghost"
								size="sm"
								onClick={handleReset}
								className="h-8 gap-1.5 rounded-lg text-xs text-white/50 hover:bg-white/6 hover:text-white"
							>
								<RotateCcw className="h-3.5 w-3.5" />
								Reset
							</Button>
							<Button
								size="sm"
								onClick={onRun}
								disabled={isRunning}
								className="h-8 gap-1.5 rounded-lg bg-linear-to-r from-emerald-500 to-green-600 text-xs font-medium text-white shadow-lg shadow-emerald-500/20 transition-all hover:from-emerald-400 hover:to-green-500 hover:shadow-emerald-500/30"
							>
								{isRunning ? (
									<div className="flex items-center gap-1">
										<div className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
										<span>Running...</span>
									</div>
								) : (
									<>
										<Play className="h-3.5 w-3.5" />
										Run
									</>
								)}
							</Button>
						</div>
					)}
				</div>

				<TabsContent value="editor" className="m-0 flex-1 overflow-hidden">
					<Editor
						height="100%"
						language={languageConfig[language].id}
						value={value}
						onChange={(val) => onChange(val || "")}
						onMount={handleEditorMount}
						options={{
							readOnly,
							fontSize,
							fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
							fontLigatures: true,
							lineHeight: 24,
							letterSpacing: 0.5,
							padding: { top: 16, bottom: 16 },
							minimap: { enabled: false },
							scrollBeyondLastLine: false,
							automaticLayout: true,
							tabSize: 2,
							wordWrap: "on",
							bracketPairColorization: { enabled: true },
							cursorBlinking: "smooth",
							cursorSmoothCaretAnimation: "on",
							cursorStyle: "line",
							cursorWidth: 2,
							smoothScrolling: true,
							renderLineHighlight: "all",
							renderWhitespace: "selection",
							guides: {
								indentation: true,
								bracketPairs: true,
								highlightActiveIndentation: true,
							},
							suggest: {
								showKeywords: true,
								showSnippets: true,
								showFunctions: true,
								showVariables: true,
								showClasses: true,
								showInterfaces: true,
								showModules: true,
								showProperties: true,
								showMethods: true,
								showConstants: true,
								preview: true,
								insertMode: "replace",
								filterGraceful: true,
								localityBonus: true,
								shareSuggestSelections: true,
								showWords: true,
							},
							quickSuggestions: {
								other: true,
								comments: false,
								strings: true,
							},
							parameterHints: { enabled: true },
							formatOnPaste: true,
							formatOnType: true,
							autoClosingBrackets: "always",
							autoClosingQuotes: "always",
							autoSurround: "languageDefined",
							matchBrackets: "always",
						}}
						loading={
							<div className="flex h-full items-center justify-center bg-[#0d0d14]">
								<div className="flex items-center gap-3 text-white/40">
									<div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />
									<span>Loading editor...</span>
								</div>
							</div>
						}
					/>
				</TabsContent>

				<TabsContent value="scratchpad" className="m-0 flex-1 overflow-hidden">
					{stompClient && (
						<ScratchPad
							sessionId={sessionId}
							stompClient={stompClient}
							isAdmin={isAdmin}
							onRemoteChange={onRemoteDrawChange}
						/>
					)}
				</TabsContent>

				{activeTab === "editor" && (
					<div className="flex items-center justify-between border-t border-white/6 bg-white/1.5 px-4 py-2">
						<div className="flex items-center gap-4 text-xs text-white/40">
							<span className="font-mono">
								Ln {cursorPosition.line}, Col {cursorPosition.column}
							</span>
							<span>UTF-8</span>
							<span className="capitalize">{languageConfig[language].id}</span>
							<span>{fontSize}px</span>
						</div>
						<Badge
							variant="outline"
							className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
						>
							<div className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
							Synced
						</Badge>
					</div>
				)}
			</Tabs>
		</div>
	);
}
