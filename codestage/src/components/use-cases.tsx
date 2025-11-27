"use client";

import {
	Briefcase,
	Building2,
	Code,
	GraduationCap,
	Laptop,
	Users,
} from "lucide-react";

const useCases = [
	{
		icon: Users,
		label: "Tech Interviewers",
		description: "Run live coding interviews",
	},
	{
		icon: Briefcase,
		label: "Hiring Managers",
		description: "Evaluate candidates effectively",
	},
	{
		icon: GraduationCap,
		label: "Bootcamp Instructors",
		description: "Teach coding in real-time",
	},
	{
		icon: Code,
		label: "Pair Programming",
		description: "Collaborate with teammates",
	},
	{
		icon: Building2,
		label: "Enterprise Teams",
		description: "Scale your hiring process",
	},
	{
		icon: Laptop,
		label: "Remote Teams",
		description: "Interview from anywhere",
	},
];

export function UseCases() {
	return (
		<section className="relative border-y border-border/40 bg-secondary/10 px-6 py-24">
			{/* Glow line */}
			<div className="absolute left-0 right-0 top-0 h-px glow-line" />

			<div className="mx-auto max-w-7xl">
				<div className="mb-16 text-center">
					<h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
						Trusted by teams worldwide
					</h2>
					<p className="mt-4 text-2xl font-bold text-foreground md:text-3xl">
						Built for everyone who codes
					</p>
				</div>

				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{useCases.map((item, index) => (
						<div
							key={item.label}
							className="group flex items-center gap-4 rounded-xl border border-border/40 bg-card/30 p-5 backdrop-blur-sm transition-all duration-300 hover:border-border/80 hover:bg-card/50"
							style={{ animationDelay: `${index * 50}ms` }}
						>
							<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-secondary/50 transition-colors group-hover:border-border">
								<item.icon
									className="h-5 w-5 text-foreground/80"
									strokeWidth={1.5}
								/>
							</div>
							<div>
								<h3 className="font-medium text-foreground">{item.label}</h3>
								<p className="text-sm text-muted-foreground">
									{item.description}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
