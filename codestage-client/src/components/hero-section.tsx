"use client";

import { ArrowRight, Play } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "@tanstack/react-router";

export function HeroSection() {
	const spotlightRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (spotlightRef.current) {
				const rect = spotlightRef.current.getBoundingClientRect();
				const x = e.clientX - rect.left;
				const y = e.clientY - rect.top;
				spotlightRef.current.style.setProperty("--mouse-x", `${x}px`);
				spotlightRef.current.style.setProperty("--mouse-y", `${y}px`);
			}
		};
		window.addEventListener("mousemove", handleMouseMove);
		return () => window.removeEventListener("mousemove", handleMouseMove);
	}, []);

    const router = useRouter();

	return (
		<section
			ref={spotlightRef}
			className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-16"
			style={{
				background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(120, 119, 198, 0.08), transparent 40%)`,
			}}
		>
			{/* Spotlight effect */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div
					className="animate-spotlight absolute -top-40 left-0 h-[200%] w-[200%] opacity-0"
					style={{
						background: `radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 119, 198, 0.15), transparent)`,
					}}
				/>
			</div>

			{/* Floating orbs */}
			<div className="pointer-events-none absolute left-1/4 top-1/3 h-72 w-72 rounded-full bg-accent/10 blur-[100px] animate-pulse-glow" />
			<div
				className="pointer-events-none absolute right-1/4 bottom-1/3 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px] animate-pulse-glow"
				style={{ animationDelay: "1s" }}
			/>

			<div className="relative z-10 flex flex-col items-center text-center">
				{/* Badge */}
				<div className="mb-8 flex items-center gap-2 rounded-full border border-border/60 bg-secondary/50 px-4 py-1.5 backdrop-blur-sm">
					<span className="relative flex h-2 w-2">
						<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
						<span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
					</span>
					<span className="text-sm text-muted-foreground">Live now</span>
					<ArrowRight className="h-3 w-3 text-muted-foreground" />
				</div>

				{/* Heading */}
				<h1 className="max-w-4xl text-balance text-5xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
					The complete platform for{" "}
					<span className="bg-linear-to-r from-foreground via-foreground/80 to-foreground bg-clip-text">
						coding interviews
					</span>
				</h1>

				<p className="mt-6 max-w-2xl text-balance text-lg text-muted-foreground md:text-xl">
					Real-time collaborative coding built for technical interviews.
					Securely conduct, monitor, and evaluate candidates with zero setup.
				</p>

				{/* CTAs */}
				<div className="mt-10 flex flex-col gap-4 sm:flex-row">
					<Button
						size="lg"
						className="group h-12 bg-foreground px-8 text-background hover:bg-foreground/90"
                        onClick={() => router.navigate({ to: "/admin" })}
					>
						Start a Session
						<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
					</Button>
					<Button
						size="lg"
						variant="outline"
						className="h-12 border-border/60 bgatransparent px-8 backdrop-blur-sm hover:bg-secondary/50"
                        onClick={() => window.open("https://youtu.be/dcWqru1yc9w", "_blank")}
					>
						<Play className="mr-2 h-4 w-4" />
						Watch Demo
					</Button>
				</div>

				{/* Stats */}
				<div className="mt-20 flex flex-wrap items-center justify-center gap-8 border-t border-border/40 pt-10 md:gap-16">
					{[
						{ value: "<200ms", label: "Editor latency" },
						{ value: "100%", label: "Open Source" },
						{ value: "MIT License", label: "License" },
					].map((stat) => (
						<div key={stat.label} className="text-center">
							<div className="text-2xl font-bold text-foreground md:text-3xl">
								{stat.value}
							</div>
							<div className="mt-1 text-sm text-muted-foreground">
								{stat.label}
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
