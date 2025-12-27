import { Link } from "@tanstack/react-router";
import { Code2, Github } from "lucide-react";

export function Footer() {
	return (
		<footer className="border-t border-border/40 bg-background px-6 py-16">
			<div className="mx-auto max-w-7xl">
				<div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
					{/* Brand */}
					<div className="lg:col-span-2">
						<Link to="/" className="flex items-center gap-2">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
								<Code2 className="h-4 w-4 text-background" />
							</div>
							<span className="font-semibold tracking-tight text-foreground">
								CodeStage
							</span>
						</Link>
						<p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
							The complete platform for collaborative coding interviews. No
							setup, no friction.
						</p>
						<div className="mt-6 flex gap-4">
							<a
								href="https://github.com/yashraj-n/codestage"
								className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:border-border hover:text-foreground"
							>
								<Github className="h-4 w-4" />
								<span className="sr-only">GitHub</span>
							</a>
						
						</div>
					</div>

					{/* Links */}
				</div>

				{/* Bottom bar */}
				<div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-8 md:flex-row">
					<p className="text-sm text-muted-foreground">
						© {new Date().getFullYear()} CodeStage. All rights reserved.
					</p>
				</div>
			</div>
		</footer>
	);
}
