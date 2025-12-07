import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	AlertCircle,
	Check,
	Clock,
	Code2,
	Copy,
	Eye,
	Loader2,
	LogOut,
	Mail,
	Plus,
	RefreshCw,
	Users,
} from "lucide-react";
import { useEffect, useId, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { assessmentsApi } from "@/lib/api-client";
import type {
	Assessment,
	CreateAssessmentDTO,
} from "@/lib/generated-api/models";
import { useAuthStore } from "@/stores/auth-store";

export const Route = createFileRoute("/admin/dashboard")({
	component: AdminDashboard,
});

function AdminDashboard() {
	const { admin, signOut } = useAuthStore();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const formId = useId();

	const {
		data: assessments = [],
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery({
		queryKey: ["assessments"],
		queryFn: () => assessmentsApi.getAllAssessments(),
		enabled: !!admin,
	});

	const createAssessmentMutation = useMutation({
		mutationFn: (dto: CreateAssessmentDTO) =>
			assessmentsApi.createAssessment({ createAssessmentDTO: dto }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["assessments"] });
		},
	});

	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [candidateName, setCandidateName] = useState("");
	const [candidateEmail, setCandidateEmail] = useState("");
	const [assessmentNotes, setAssessmentNotes] = useState("");
	const [copiedId, setCopiedId] = useState<number | null>(null);
	const [createdAssessment, setCreatedAssessment] = useState<Assessment | null>(
		null,
	);

	useEffect(() => {
		if (!admin) {
			navigate({ to: "/admin" });
		}
	}, [admin, navigate]);

	const handleCreateAssessment = async () => {
		if (!candidateName.trim() || !candidateEmail.trim()) return;

		try {
			await createAssessmentMutation.mutateAsync({
				candidateName: candidateName.trim(),
				candidateEmail: candidateEmail.trim(),
				assessmentNotes: assessmentNotes.trim(),
			});

			setCreatedAssessment({
				candidateName: candidateName.trim(),
				candidateEmail: candidateEmail.trim(),
				inviteNotes: assessmentNotes.trim(),
			});
			setCandidateName("");
			setCandidateEmail("");
			setAssessmentNotes("");
		} catch (err) {
			console.error("Failed to create assessment:", err);
		}
	};

	const handleCopyLink = async (id: number, link: string) => {
		await navigator.clipboard.writeText(link);
		setCopiedId(id);
		setTimeout(() => setCopiedId(null), 2000);
	};

	const handleJoin = async (assessment: Assessment) => {
		const joinToken = await assessmentsApi.createJoinToken({
			sessionId: assessment.id?.toString() ?? "",
		});
		if (joinToken) {
			window.open(`${window.location.origin}/workspace?token=${joinToken}`, "_blank");
		} else {
			alert("Failed to create join link");
		}
	};

	const handleSignOut = () => {
		signOut();
		navigate({ to: "/admin" });
	};

	const closeDialog = () => {
		setIsDialogOpen(false);
		setCreatedAssessment(null);
		setCandidateName("");
		setCandidateEmail("");
		setAssessmentNotes("");
	};

	const getStatusBadge = (completed?: boolean) => {
		if (completed) {
			return (
				<Badge
					variant="outline"
					className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
				>
					Completed
				</Badge>
			);
		}
		return (
			<Badge
				variant="outline"
				className="bg-amber-500/10 text-amber-500 border-amber-500/20"
			>
				Pending
			</Badge>
		);
	};

	const formatDate = (date?: Date) => {
		if (!date) return "N/A";
		return new Date(date).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	if (!admin) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center gap-4">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				<p className="text-sm text-muted-foreground">Loading assessments...</p>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center gap-4">
				<div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
					<AlertCircle className="h-8 w-8 text-destructive" />
				</div>
				<div className="text-center">
					<h2 className="text-lg font-semibold text-foreground">
						Failed to load assessments
					</h2>
					<p className="mt-1 text-sm text-muted-foreground">
						{error instanceof Error
							? error.message
							: "An unexpected error occurred"}
					</p>
				</div>
				<Button
					onClick={() => refetch()}
					variant="outline"
					className="gap-2"
					aria-label="Retry loading assessments"
					tabIndex={0}
				>
					<RefreshCw className="h-4 w-4" />
					Retry
				</Button>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
				<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
					<Link to="/" className="flex items-center gap-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
							<Code2 className="h-4 w-4 text-background" />
						</div>
						<span className="font-semibold tracking-tight text-foreground">
							CodeStage
						</span>
						<Badge variant="outline" className="ml-2">
							Admin
						</Badge>
					</Link>

					<div className="flex items-center gap-4">
						{admin.photoUrl ? (
							<img
								src={admin.photoUrl}
								alt={`${admin.name}'s profile`}
								className="h-9 w-9 rounded-full object-cover border border-border"
								aria-label={`Admin profile photo: ${admin.name}`}
							/>
						) : (
							<div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-foreground/60 border border-border">
								<span className="text-base font-medium">
									{admin.name?.[0] ?? ""}
								</span>
							</div>
						)}
						<span className="text-sm text-muted-foreground">{admin.name}</span>
						<Button
							variant="ghost"
							size="sm"
							onClick={handleSignOut}
							className="gap-2"
							aria-label="Sign out"
							tabIndex={0}
						>
							<LogOut className="h-4 w-4" />
							Sign out
						</Button>
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-7xl px-6 py-8">
				<div className="mb-8 flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-semibold tracking-tight text-foreground">
							Dashboard
						</h1>
						<p className="mt-1 text-muted-foreground">
							Manage your coding assessments
						</p>
					</div>

					<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
						<DialogTrigger asChild>
							<Button className="gap-2 bg-foreground text-background hover:bg-foreground/90">
								<Plus className="h-4 w-4" />
								Create Assessment
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-md">
							{createdAssessment ? (
								<>
									<DialogHeader>
										<DialogTitle className="flex items-center gap-2">
											<div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10">
												<Check className="h-4 w-4 text-emerald-500" />
											</div>
											Assessment Created
										</DialogTitle>
										<DialogDescription>
											The assessment has been created successfully.
										</DialogDescription>
									</DialogHeader>
									<div className="space-y-4 py-4">
										<div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
											<div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
												<Mail className="h-4 w-4" />
												<span>
													Assessment created for{" "}
													<strong>{createdAssessment.candidateEmail}</strong>
												</span>
											</div>
										</div>
										<Button onClick={closeDialog} className="w-full">
											Done
										</Button>
									</div>
								</>
							) : (
								<>
									<DialogHeader>
										<DialogTitle>Create New Assessment</DialogTitle>
										<DialogDescription>
											Enter the candidate details to create a new assessment.
										</DialogDescription>
									</DialogHeader>
									<div className="space-y-4 py-4">
										<div className="space-y-2">
											<Label htmlFor={`${formId}-name`}>Candidate Name</Label>
											<Input
												id={`${formId}-name`}
												placeholder="John Doe"
												value={candidateName}
												onChange={(e) => setCandidateName(e.target.value)}
												aria-label="Candidate name"
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor={`${formId}-email`}>Candidate Email</Label>
											<Input
												id={`${formId}-email`}
												type="email"
												placeholder="john@example.com"
												value={candidateEmail}
												onChange={(e) => setCandidateEmail(e.target.value)}
												aria-label="Candidate email"
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor={`${formId}-notes`}>
												Notes (Optional)
											</Label>
											<Textarea
												id={`${formId}-notes`}
												placeholder="Add any notes for this assessment..."
												value={assessmentNotes}
												onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
													setAssessmentNotes(e.target.value)
												}
												aria-label="Assessment notes"
												rows={3}
											/>
										</div>
										{createAssessmentMutation.isError && (
											<div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
												<p className="text-sm text-destructive">
													{createAssessmentMutation.error instanceof Error
														? createAssessmentMutation.error.message
														: "Failed to create assessment"}
												</p>
											</div>
										)}
										<Button
											onClick={handleCreateAssessment}
											disabled={
												createAssessmentMutation.isPending ||
												!candidateName.trim() ||
												!candidateEmail.trim()
											}
											className="w-full bg-foreground text-background hover:bg-foreground/90"
										>
											{createAssessmentMutation.isPending ? (
												<Loader2 className="h-4 w-4 animate-spin" />
											) : (
												"Create Assessment"
											)}
										</Button>
									</div>
								</>
							)}
						</DialogContent>
					</Dialog>
				</div>

				<div className="mb-8 grid gap-4 sm:grid-cols-3">
					<Card className="border-border/50 bg-card/50">
						<CardHeader className="pb-2">
							<CardDescription className="flex items-center gap-2">
								<Users className="h-4 w-4" />
								Total Assessments
							</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-3xl font-semibold">{assessments.length}</p>
						</CardContent>
					</Card>
					<Card className="border-border/50 bg-card/50">
						<CardHeader className="pb-2">
							<CardDescription className="flex items-center gap-2">
								<Clock className="h-4 w-4" />
								Pending
							</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-3xl font-semibold">
								{assessments.filter((a) => !a.completed).length}
							</p>
						</CardContent>
					</Card>
					<Card className="border-border/50 bg-card/50">
						<CardHeader className="pb-2">
							<CardDescription className="flex items-center gap-2">
								<Check className="h-4 w-4" />
								Completed
							</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-3xl font-semibold">
								{assessments.filter((a) => a.completed).length}
							</p>
						</CardContent>
					</Card>
				</div>

				<Card className="border-border/50">
					<CardHeader>
						<CardTitle>Recent Assessments</CardTitle>
						<CardDescription>
							View and manage all candidate assessments
						</CardDescription>
					</CardHeader>
					<CardContent>
						{assessments.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-12 text-center">
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
									<Users className="h-6 w-6 text-muted-foreground" />
								</div>
								<h3 className="mb-1 text-lg font-medium">No assessments yet</h3>
								<p className="mb-4 text-sm text-muted-foreground">
									Create your first assessment to get started
								</p>
								<Button
									onClick={() => setIsDialogOpen(true)}
									variant="outline"
									className="gap-2"
									aria-label="Create new assessment"
									tabIndex={0}
								>
									<Plus className="h-4 w-4" />
									Create Assessment
								</Button>
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Candidate</TableHead>
										<TableHead>Email</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Created</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{assessments.map((assessment) => (
										<TableRow key={assessment.id}>
											<TableCell className="font-medium">
												{assessment.candidateName ?? "N/A"}
											</TableCell>
											<TableCell className="text-muted-foreground">
												{assessment.candidateEmail ?? "N/A"}
											</TableCell>
											<TableCell>
												{getStatusBadge(assessment.completed)}
											</TableCell>
											<TableCell className="text-muted-foreground">
												{formatDate(assessment.createdAt)}
											</TableCell>
											<TableCell className="text-right">
												<div className="flex items-center justify-end gap-1">
													{assessment.completed ? (
														<Button
															variant="ghost"
															size="icon"
															className="h-8 w-8"
															asChild
															title="View submission"
															aria-label="View submission"
														>
															<Link
																to="/admin/assessment/$id"
																params={{ id: String(assessment.id) }}
															>
																<Eye className="h-4 w-4" />
															</Link>
														</Button>
													) : (
														<>
															<Button
																variant="outline"
																size="sm"
																className="h-8"
																onClick={() => handleJoin(assessment)}
															>
																Join
															</Button>
															<Button
																variant="ghost"
																size="icon"
																className="h-8 w-8"
																onClick={() =>
																	assessment.id &&
																	handleCopyLink(
																		assessment.id,
																		`${window.location.origin}/assessment/${assessment.id}`,
																	)
																}
																title="Copy link"
																aria-label="Copy assessment link"
																tabIndex={0}
															>
																{copiedId === assessment.id ? (
																	<Check className="h-4 w-4 text-emerald-500" />
																) : (
																	<Copy className="h-4 w-4" />
																)}
															</Button>
														</>
													)}
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>
			</main>
		</div>
	);
}
