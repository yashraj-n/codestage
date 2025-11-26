import { createFileRoute } from "@tanstack/react-router";
import { InviteForm } from "@/components/invite-form";
import { Code2 } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/invite/")({
  component: InvitePage,
});

function InvitePage() {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Background gradient effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-accent/30 blur-[100px]" />
        <div className="absolute -right-40 top-1/3 h-80 w-80 rounded-full bg-accent/20 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-6 py-16">
        {/* Logo */}
        <Link to="/" className="mb-12 inline-flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
            <Code2 className="h-4 w-4 text-background" />
          </div>
          <span className="font-semibold tracking-tight text-foreground">
            CodeStage
          </span>
        </Link>

        {/* Header */}
        <div className="mb-10">
          <h1 className="mb-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Start a Session
          </h1>
          <p className="text-muted-foreground">
            Add participants to your coding interview session. Designate one as
            the admin who will control the session.
          </p>
        </div>

        {/* Invite Form */}
        <InviteForm />
      </div>
    </div>
  );
}
