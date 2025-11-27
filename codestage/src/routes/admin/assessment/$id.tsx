import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { useAuthStore } from "@/stores/auth-store"
import {
  getAssessmentById,
  type Assessment,
  type AssessmentEvent,
  type AssessmentEventType,
} from "@/lib/assessments"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Code2,
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Clock,
  FileText,
  Terminal,
  CheckCircle2,
  Loader2,
  Activity,
  Eye,
  EyeOff,
  Clipboard,
  Copy,
  Play,
  LogIn,
  LogOut,
} from "lucide-react"
import Editor from "@monaco-editor/react"
import { setupEditorTheme, languageConfig } from "@/lib/editor-languages"
import type { Monaco } from "@monaco-editor/react"

export const Route = createFileRoute("/admin/assessment/$id")({
  component: AssessmentViewPage,
})

function AssessmentViewPage() {
  const { id } = Route.useParams()
  const { admin } = useAuthStore()
  const navigate = useNavigate()
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!admin) {
      navigate({ to: "/admin" })
      return
    }

    const found = getAssessmentById(id)
    setAssessment(found || null)
    setIsLoading(false)
  }, [admin, id, navigate])

  const handleEditorMount = (_editor: unknown, monaco: Monaco) => {
    setupEditorTheme(monaco)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatEventTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

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
    }
    return icons[type]
  }

  const getEventStyle = (type: AssessmentEventType) => {
    const styles: Record<AssessmentEventType, { bg: string; text: string; border: string }> = {
      tab_switch: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
      paste: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
      copy: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
      focus_lost: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
      focus_gained: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
      session_start: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20" },
      session_end: { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/20" },
      code_run: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
    }
    return styles[type]
  }

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
    }
    return labels[type]
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090d]">
        <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
      </div>
    )
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
    )
  }

  const submission = assessment.submission
  const languageId =
    submission && languageConfig[submission.language]
      ? languageConfig[submission.language].id
      : "javascript"

  // Sample events for demonstration (would come from submission.events in real usage)
  const sampleEvents: AssessmentEvent[] = submission?.events ?? [
    { id: "1", type: "session_start", timestamp: assessment.createdAt },
    { id: "2", type: "paste", timestamp: new Date(Date.now() - 3600000).toISOString(), details: "Pasted 45 characters" },
    { id: "3", type: "tab_switch", timestamp: new Date(Date.now() - 3000000).toISOString(), details: "Away for 12 seconds" },
    { id: "4", type: "focus_gained", timestamp: new Date(Date.now() - 2988000).toISOString() },
    { id: "5", type: "code_run", timestamp: new Date(Date.now() - 1800000).toISOString() },
    { id: "6", type: "copy", timestamp: new Date(Date.now() - 900000).toISOString(), details: "Copied 23 characters" },
    { id: "7", type: "tab_switch", timestamp: new Date(Date.now() - 600000).toISOString(), details: "Away for 8 seconds" },
    { id: "8", type: "focus_gained", timestamp: new Date(Date.now() - 592000).toISOString() },
    { id: "9", type: "code_run", timestamp: new Date(Date.now() - 300000).toISOString() },
    { id: "10", type: "session_end", timestamp: submission?.submittedAt ?? new Date().toISOString() },
  ]

  return (
    <div className="min-h-screen bg-[#09090d]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-48 -top-48 h-[500px] w-[500px] rounded-full bg-violet-600/5 blur-[150px]" />
        <div className="absolute -right-48 bottom-0 h-[400px] w-[400px] rounded-full bg-fuchsia-600/5 blur-[130px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#09090d]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-white/60 hover:bg-white/[0.06] hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <div className="h-6 w-px bg-white/[0.08]" />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                <Code2 className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-white">CodeStage</span>
            </div>
          </div>

          <Badge
            variant="outline"
            className="gap-1.5 border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
          >
            <CheckCircle2 className="h-3 w-3" />
            {assessment.status === "completed" ? "Completed" : assessment.status}
          </Badge>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
          <h1 className="mb-6 text-2xl font-semibold text-white">
            Assessment Submission
          </h1>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                <User className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <p className="text-xs text-white/40">Candidate</p>
                <p className="font-medium text-white">
                  {assessment.candidateName}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
                <Mail className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-xs text-white/40">Email</p>
                <p className="font-medium text-white">
                  {assessment.candidateEmail}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                <Calendar className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-white/40">Created</p>
                <p className="font-medium text-white">
                  {formatDate(assessment.createdAt)}
                </p>
              </div>
            </div>

            {submission && (
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                  <Clock className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-white/40">Submitted</p>
                  <p className="font-medium text-white">
                    {formatDate(submission.submittedAt)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {submission ? (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d14]">
                <div className="flex items-center gap-3 border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 ring-1 ring-white/10">
                    <Code2 className="h-4 w-4 text-violet-400" />
                  </div>
                  <span className="font-medium text-white/90">
                    Submitted Code
                  </span>
                  <Badge
                    variant="outline"
                    className="ml-auto border-white/10 bg-white/5 text-white/60"
                  >
                    {submission.language}
                  </Badge>
                </div>
                <div className="h-[400px]">
                  <Editor
                    height="100%"
                    language={languageId}
                    value={submission.code}
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

              <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d14]">
                <div className="flex items-center gap-3 border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20 ring-1 ring-white/10">
                    <Terminal className="h-4 w-4 text-fuchsia-400" />
                  </div>
                  <span className="font-medium text-white/90">
                    Console Output
                  </span>
                </div>
                <div className="max-h-[250px] overflow-auto bg-[#0a0a0f] p-4">
                  <div className="font-mono text-sm leading-7">
                    {submission.terminalOutput.length > 0 ? (
                      submission.terminalOutput.map((line, i) => (
                        <div
                          key={i}
                          className={
                            line.startsWith("$")
                              ? "text-violet-400"
                              : line.startsWith("✓")
                                ? "text-emerald-400"
                                : line.startsWith("✗") || line.includes("Error")
                                  ? "text-red-400"
                                  : "text-white/60"
                          }
                        >
                          {line || "\u00A0"}
                        </div>
                      ))
                    ) : (
                      <p className="text-white/30">No output recorded</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d14]">
                <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 ring-1 ring-white/10">
                      <Activity className="h-4 w-4 text-rose-400" />
                    </div>
                    <span className="font-medium text-white/90">
                      Session Events
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-white/10 bg-white/5 text-white/60"
                  >
                    {sampleEvents.length} events
                  </Badge>
                </div>
                <ScrollArea className="h-[280px]">
                  <div className="p-3 space-y-2">
                    {sampleEvents.map((event) => {
                      const style = getEventStyle(event.type)
                      return (
                        <div
                          key={event.id}
                          className={`flex items-start gap-3 rounded-xl border ${style.border} ${style.bg} p-3 transition-colors`}
                        >
                          <div
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${style.bg} ${style.text}`}
                          >
                            {getEventIcon(event.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-sm font-medium ${style.text}`}>
                                {getEventLabel(event.type)}
                              </span>
                              <span className="text-xs text-white/40 tabular-nums">
                                {formatEventTime(event.timestamp)}
                              </span>
                            </div>
                            {event.details && (
                              <p className="mt-0.5 text-xs text-white/50 truncate">
                                {event.details}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d14]">
                <div className="flex items-center gap-3 border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 ring-1 ring-white/10">
                    <FileText className="h-4 w-4 text-amber-400" />
                  </div>
                  <span className="font-medium text-white/90">
                    Interview Notes
                  </span>
                </div>
                <div className="max-h-[250px] overflow-auto p-4">
                  {submission.notes ? (
                    <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-white/70">
                      {submission.notes}
                    </pre>
                  ) : (
                    <p className="text-sm text-white/30">
                      No notes were recorded for this session.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.02] py-16">
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
  )
}
