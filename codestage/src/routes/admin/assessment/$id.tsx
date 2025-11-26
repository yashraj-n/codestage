import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { useAuthStore } from "@/stores/auth-store"
import { getAssessmentById, type Assessment } from "@/lib/assessments"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
                <div className="flex items-center gap-3 border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 ring-1 ring-white/10">
                    <FileText className="h-4 w-4 text-amber-400" />
                  </div>
                  <span className="font-medium text-white/90">
                    Interview Notes
                  </span>
                </div>
                <div className="max-h-[500px] overflow-auto p-4">
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
