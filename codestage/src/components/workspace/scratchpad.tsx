"use client";

import { useEffect } from "react";
import { Tldraw, useEditor } from "tldraw";
import "tldraw/tldraw.css";

export function ScratchPad() {
	return (
		<div className="h-full w-full overflow-hidden rounded-lg bg-white">
			<Tldraw persistenceKey="codestage-scratchpad" hideUi={false}>
				<EditorLogger />
			</Tldraw>
		</div>
	);
}

function EditorLogger() {
	const editor = useEditor();

	useEffect(() => {
		if (!editor) return;
		const schema = editor.store.schema.serialize();
		const unsubscribe = editor.store.listen(
			(entry) => {
				if (entry.source !== "user") return;
				const payload = {
					type: "tldraw-diff",
					schema,
					changes: entry.changes,
				};
				console.log(
					"[ScratchPad] ws payload",
					JSON.stringify(payload),
					"(apply with editor.store.mergeRemoteChanges(() => editor.store.applyDiff(payload.changes)))",
				);
			},
			{ scope: "document" },
		);
		return unsubscribe;
	}, [editor]);

	return null;
}
