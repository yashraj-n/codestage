"use client";

import { Layout, Lock, Pencil, Shield, Users, Zap } from "lucide-react";
import { useRef } from "react";

const features = [
	{
		icon: Zap,
		title: "Instant Setup",
		description:
			"Create a session in seconds. No downloads, no configuration required.",
	},
	{
		icon: Pencil,
		title: "Real-Time Editing",
		description:
			"Monaco-powered editor with live collaboration and syntax highlighting.",
	},
	{
		icon: Layout,
		title: "Structured Workspace",
		description: "Notes, Editor, and Terminal in a clean tri-panel layout.",
	},
	{
		icon: Users,
		title: "Multi-Participant",
		description:
			"Invite up to 5 participants with granular permission controls.",
	},
	{
		icon: Shield,
		title: "Admin Controls",
		description: "Lightweight permissions system for focused interviews.",
	},
	{
		icon: Lock,
		title: "Secure Sessions",
		description: "End-to-end encryption with automatic session expiry.",
	},
];

export function FeaturesStrip() {
	const containerRef = useRef<HTMLDivElement>(null);

	return (
		<section
			id="features"
			className="relative border-y border-border/40 bg-secondary/20 px-6 py-24"
		>
			{/* Glow line at top */}
			<div className="absolute left-0 right-0 top-0 h-px glow-line" />

			<div className="mx-auto max-w-7xl">
				<div className="mb-16 text-center">
					<h2 className="text-3xl font-bold text-foreground md:text-4xl">
						Everything you need
					</h2>
					<p className="mt-4 text-muted-foreground">
						Powerful features designed for seamless technical interviews
					</p>
				</div>

				<div
					ref={containerRef}
					className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
				>
					{features.map((feature, index) => (
						<div
							key={feature.title}
							className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-border hover:bg-card"
							style={{ animationDelay: `${index * 100}ms` }}
						>
							{/* Hover gradient */}
							<div
								className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
								style={{
									background:
										"radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(120, 119, 198, 0.06), transparent 40%)",
								}}
							/>

							<div className="relative z-10">
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-border/60 bg-secondary/50">
									<feature.icon
										className="h-6 w-6 text-foreground"
										strokeWidth={1.5}
									/>
								</div>
								<h3 className="mb-2 text-lg font-semibold text-foreground">
									{feature.title}
								</h3>
								<p className="text-sm leading-relaxed text-muted-foreground">
									{feature.description}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
