import { createFileRoute } from "@tanstack/react-router";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";

export const Route = createFileRoute("/workspace/")({
	component: WorkspacePage,
});

export default function WorkspacePage() {
	return <WorkspaceLayout />;
}
