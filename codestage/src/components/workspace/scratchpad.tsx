"use client";

import type { Client } from "@stomp/stompjs";
import { useEffect } from "react";
import { Tldraw, useEditor } from "tldraw";
import "tldraw/tldraw.css";

type ScratchPadProps = {
	sessionId: string;
	stompClient: Client;
	isAdmin: boolean;
	onRemoteChange?: (handler: (changes: unknown) => void) => void;
};

export function ScratchPad({
	sessionId,
	stompClient,
	isAdmin,
	onRemoteChange,
}: ScratchPadProps) {
	return (
		<div className="h-full w-full overflow-hidden rounded-lg bg-white">
			<Tldraw
				persistenceKey={`codestage-scratchpad-${sessionId}`}
				hideUi={false}
			>
				<EditorLogger
					sessionId={sessionId}
					stompClient={stompClient}
					isAdmin={isAdmin}
					onRemoteChange={onRemoteChange}
				/>
			</Tldraw>
		</div>
	);
}

type EditorLoggerProps = {
	sessionId: string;
	stompClient: Client;
	isAdmin: boolean;
	onRemoteChange?: (handler: (changes: unknown) => void) => void;
};

function EditorLogger({
	sessionId,
	stompClient,
	isAdmin,
	onRemoteChange,
}: EditorLoggerProps) {
	const editor = useEditor();

	useEffect(() => {
		if (!editor) return;

		if (isAdmin) {
			editor.updateInstanceState({ isReadonly: true });
		}

		const unsubscribe = editor.store.listen(
			(entry) => {
				if (entry.source !== "user" || isAdmin) return;

				if (stompClient.connected) {
					const payload = JSON.stringify(entry.changes);
					stompClient.publish({
						destination: `/app/${sessionId}/draw-diff`,
						body: payload,
					});
				}
			},
			{ scope: "document" },
		);

		// Set up handler for remote changes (admin only)
		if (isAdmin && onRemoteChange) {
			const handleRemoteChange = (changes: unknown) => {
				if (editor && changes) {
					editor.store.mergeRemoteChanges(() => {
						editor.store.applyDiff(changes as never);
					});
				}
			};
			onRemoteChange(handleRemoteChange);
		}

		return unsubscribe;
	}, [editor, sessionId, stompClient, isAdmin, onRemoteChange]);

	return null;
}
