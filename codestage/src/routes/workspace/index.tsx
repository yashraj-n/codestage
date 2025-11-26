import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/workspace/")({
  component: WorkspacePage,
});

export default function WorkspacePage() {
  return <WorkspaceLayout />;
}
