import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	Check,
	Clock,
	Code2,
	Copy,
	ExternalLink,
	Eye,
	Loader2,
	LogOut,
	Mail,
	Plus,
	Trash2,
	Users,
} from "lucide-react";
import { useEffect, useState } from "react";
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
import {
	type Assessment,
	addAssessment,
	deleteAssessment,
	getAssessments,
} from "@/lib/assessments";
import { useAuthStore } from "@/stores/auth-store";

export const Route = createFileRoute("/admin/dashboard")({
	component: AdminDashboard,
});

function AdminDashboard() {
	const { admin, signOut } = useAuthStore();
	const navigate = useNavigate();
	const [assessments, setAssessments] = useState<Assessment[]>([]);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [candidateName, setCandidateName] = useState("");
	const [candidateEmail, setCandidateEmail] = useState("");
	const [isCreating, setIsCreating] = useState(false);
	const [copiedId, setCopiedId] = useState<string | null>(null);
	const [createdAssessment, setCreatedAssessment] = useState<Assessment | null>(
		null,
	);

	useEffect(() => {
		if (!admin) {
			navigate({ to: "/admin" });
			return;
		}
		setAssessments(getAssessments());
	}, [admin, navigate]);

	const handleCreateAssessment = async () => {
		if (!candidateName.trim() || !candidateEmail.trim()) return;

		setIsCreating(true);
		await new Promise((resolve) => setTimeout(resolve, 800));

		const newAssessment = addAssessment({
			candidateName: candidateName.trim(),
			candidateEmail: candidateEmail.trim(),
		});

		setAssessments(getAssessments());
		setCreatedAssessment(newAssessment);
		setCandidateName("");
		setCandidateEmail("");
		setIsCreating(false);
	};

	const handleDeleteAssessment = (id: string) => {
		deleteAssessment(id);
		setAssessments(getAssessments());
	};

	const handleCopyLink = async (id: string, link: string) => {
		await navigator.clipboard.writeText(link);
		setCopiedId(id);
		setTimeout(() => setCopiedId(null), 2000);
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
	};

	const getStatusBadge = (status: Assessment["status"]) => {
		const variants: Record<Assessment["status"], string> = {
			pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
			in_progress: "bg-blue-500/10 text-blue-500 border-blue-500/20",
			completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
		};
		const labels: Record<Assessment["status"], string> = {
			pending: "Pending",
			in_progress: "In Progress",
			completed: "Completed",
		};
		return (
			<Badge variant="outline" className={variants[status]}>
				{labels[status]}
			</Badge>
		);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
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
						<span className="text-sm text-muted-foreground">{admin.email}</span>
						<Button
							variant="ghost"
							size="sm"
							onClick={handleSignOut}
							className="gap-2"
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
											The assessment link has been created successfully.
										</DialogDescription>
									</DialogHeader>
									<div className="space-y-4 py-4">
										<div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
											<div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
												<Mail className="h-4 w-4" />
												<span>
													Email sent to{" "}
													<strong>{createdAssessment.candidateEmail}</strong>
												</span>
											</div>
										</div>
										<div className="rounded-lg border border-border/50 bg-muted/30 p-3">
											<p className="mb-1 text-xs text-muted-foreground">
												Session Link
											</p>
											<div className="flex items-center gap-2">
												<code className="flex-1 truncate text-sm">
													{createdAssessment.sessionLink}
												</code>
												<Button
													size="sm"
													variant="ghost"
													onClick={() =>
														handleCopyLink(
															createdAssessment.id,
															createdAssessment.sessionLink,
														)
													}
												>
													{copiedId === createdAssessment.id ? (
														<Check className="h-4 w-4 text-emerald-500" />
													) : (
														<Copy className="h-4 w-4" />
													)}
												</Button>
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
											Enter the candidate details to generate a unique session
											link.
										</DialogDescription>
									</DialogHeader>
									<div className="space-y-4 py-4">
										<div className="space-y-2">
											<Label htmlFor="name">Candidate Name</Label>
											<Input
												id="name"
												placeholder="John Doe"
												value={candidateName}
												onChange={(e) => setCandidateName(e.target.value)}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="email">Candidate Email</Label>
											<Input
												id="email"
												type="email"
												placeholder="john@example.com"
												value={candidateEmail}
												onChange={(e) => setCandidateEmail(e.target.value)}
											/>
										</div>
										<Button
											onClick={handleCreateAssessment}
											disabled={
												isCreating ||
												!candidateName.trim() ||
												!candidateEmail.trim()
											}
											className="w-full bg-foreground text-background hover:bg-foreground/90"
										>
											{isCreating ? (
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
								{assessments.filter((a) => a.status === "pending").length}
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
								{assessments.filter((a) => a.status === "completed").length}
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
												{assessment.candidateName}
											</TableCell>
											<TableCell className="text-muted-foreground">
												{assessment.candidateEmail}
											</TableCell>
											<TableCell>{getStatusBadge(assessment.status)}</TableCell>
											<TableCell className="text-muted-foreground">
												{formatDate(assessment.createdAt)}
											</TableCell>
											<TableCell className="text-right">
												<div className="flex items-center justify-end gap-1">
													{assessment.status === "completed" ? (
														<Button
															variant="ghost"
															size="icon"
															className="h-8 w-8"
															asChild
															title="View submission"
														>
															<Link to={`/admin/assessment/${assessment.id}`}>
																<Eye className="h-4 w-4" />
															</Link>
														</Button>
													) : (
														<>
															<Button
																variant="ghost"
																size="icon"
																className="h-8 w-8"
																onClick={() =>
																	handleCopyLink(
																		assessment.id,
																		assessment.sessionLink,
																	)
																}
																title="Copy link"
															>
																{copiedId === assessment.id ? (
																	<Check className="h-4 w-4 text-emerald-500" />
																) : (
																	<Copy className="h-4 w-4" />
																)}
															</Button>
															<Button
																variant="ghost"
																size="icon"
																className="h-8 w-8"
																asChild
																title="Open session"
															>
																<a
																	href={assessment.sessionLink}
																	target="_blank"
																	rel="noopener noreferrer"
																>
																	<ExternalLink className="h-4 w-4" />
																</a>
															</Button>
															<Button
																variant="ghost"
																size="icon"
																className="h-8 w-8 text-destructive hover:text-destructive"
																onClick={() =>
																	handleDeleteAssessment(assessment.id)
																}
																title="Delete"
															>
																<Trash2 className="h-4 w-4" />
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
