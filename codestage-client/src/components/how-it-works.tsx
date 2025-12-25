"use client";

import { CheckCircle2, Link, Play, Plus } from "lucide-react";

const steps = [
	{
		icon: Plus,
		step: "01",
		title: "Create a Room",
		description:
			"Generate a secure session with a single click. Your workspace is ready instantly.",
		features: ["Unique session ID", "Automatic encryption", "Custom settings"],
	},
	{
		icon: Link,
		step: "02",
		title: "Invite Participants",
		description:
			"Share the link with your candidates. They join directly in browser.",
		features: [
			"No sign-up required",
			"Up to 5 participants",
			"Permission controls",
		],
	},
	{
		icon: Play,
		step: "03",
		title: "Start Interviewing",
		description:
			"Collaborate in real-time with shared notes, code editor, and terminal.",
		features: [
			"Live code execution",
			"Shared annotations",
			"Session recording",
		],
	},
];

export function HowItWorks() {
	return (
		<section id="how-it-works" className="relative px-6 py-32">
			<div className="mx-auto max-w-7xl">
				<div className="mb-20 text-center">
					<span className="mb-4 inline-block rounded-full border border-border/60 bg-secondary/50 px-4 py-1 text-sm text-muted-foreground">
						Simple workflow
					</span>
					<h2 className="text-3xl font-bold text-foreground md:text-4xl">
						How It Works
					</h2>
					<p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
						Get started in minutes, not hours. Our streamlined process ensures
						you spend more time interviewing.
					</p>
				</div>

				<div className="relative grid gap-8 lg:grid-cols-3">
					{/* Connection line */}
					<div className="absolute left-0 right-0 top-16 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block" />

					{steps.map((step, index) => (
						<div key={step.step} className="relative">
							{/* Step card */}
							<div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/30 p-8 backdrop-blur-sm transition-all duration-500 hover:border-border hover:bg-card/50">
								{/* Step number badge */}
								<div className="absolute -right-4 -top-4 flex h-24 w-24 items-center justify-center">
									<span className="text-6xl font-bold text-secondary/60">
										{step.step}
									</span>
								</div>

								{/* Icon */}
								<div className="relative z-10 mb-6 flex h-14 w-14 items-center justify-center rounded-xl border border-border/60 bg-background transition-transform duration-300 group-hover:scale-110">
									<step.icon
										className="h-7 w-7 text-foreground"
										strokeWidth={1.5}
									/>
								</div>

								<h3 className="mb-3 text-xl font-semibold text-foreground">
									{step.title}
								</h3>
								<p className="mb-6 text-sm leading-relaxed text-muted-foreground">
									{step.description}
								</p>

								{/* Features list */}
								<ul className="space-y-2">
									{step.features.map((feature) => (
										<li
											key={feature}
											className="flex items-center gap-2 text-sm text-muted-foreground"
										>
											<CheckCircle2 className="h-4 w-4 text-green-500/70" />
											{feature}
										</li>
									))}
								</ul>
							</div>

							{/* Arrow connector for mobile */}
							{index < steps.length - 1 && (
								<div className="my-4 flex justify-center lg:hidden">
									<div className="h-8 w-px bg-gradient-to-b from-border to-transparent" />
								</div>
							)}
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
