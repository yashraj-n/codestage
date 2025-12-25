import { Link } from "@tanstack/react-router";
import { Home, Loader2, Lock, RotateCcw, ShieldAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const AuthLoadingPage = () => {
	return (
		<main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0f]">
			<div
				className="pointer-events-none absolute inset-0"
				style={{
					backgroundImage: `
              radial-gradient(ellipse 50% 80% at 20% 40%, rgba(99, 102, 241, 0.12), transparent),
              radial-gradient(ellipse 50% 80% at 80% 50%, rgba(139, 92, 246, 0.08), transparent),
              radial-gradient(ellipse 80% 50% at 50% 100%, rgba(99, 102, 241, 0.1), transparent)
            `,
				}}
			/>

			<div className="pointer-events-none absolute inset-0 opacity-20">
				<div
					className="absolute inset-0"
					style={{
						backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
					}}
				/>
			</div>

			<div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/5 blur-[150px]" />

			<div className="relative z-10 flex flex-col items-center px-6 text-center">
				<div className="relative mb-8">
					<div className="absolute -inset-4 animate-pulse rounded-full bg-indigo-500/20 blur-xl" />
					<div className="absolute -inset-8 rounded-full bg-indigo-500/10 blur-2xl" />

					<div className="relative flex h-28 w-28 items-center justify-center">
						<div className="absolute inset-0 rounded-full border border-indigo-500/30 bg-linear-to-b from-indigo-950/80 to-indigo-900/40" />
						<div className="absolute inset-[3px] rounded-full border border-indigo-500/20 bg-linear-to-b from-indigo-950 to-[#0a0a0f]" />

						<div className="absolute inset-0 rounded-full">
							<div
								className="h-full w-full rounded-full"
								style={{
									background:
										"conic-gradient(from 0deg, transparent, rgba(99, 102, 241, 0.5), transparent 30%)",
									animation: "spin 2s linear infinite",
								}}
							/>
						</div>

						<div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-b from-indigo-600 to-indigo-700 shadow-lg shadow-indigo-600/30">
							<Loader2
								className="h-8 w-8 animate-spin text-white"
								strokeWidth={2.5}
								aria-hidden="true"
							/>
						</div>
					</div>
				</div>

				<div className="mb-3 flex items-center gap-2">
					<Lock className="h-4 w-4 text-indigo-400" aria-hidden="true" />
					<span className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
						Authenticating
					</span>
				</div>

				<h1 className="mb-4 bg-linear-to-b from-white via-white to-white/60 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
					Verifying Token
				</h1>

				<p className="mb-10 max-w-md text-base leading-relaxed text-zinc-400 sm:text-lg">
					Please wait while we verify your authentication token and prepare your
					session.
				</p>

				<div className="flex items-center gap-3">
					<div
						className="h-2 w-2 animate-pulse rounded-full bg-indigo-500"
						style={{ animationDelay: "0ms" }}
					/>
					<div
						className="h-2 w-2 animate-pulse rounded-full bg-indigo-500"
						style={{ animationDelay: "150ms" }}
					/>
					<div
						className="h-2 w-2 animate-pulse rounded-full bg-indigo-500"
						style={{ animationDelay: "300ms" }}
					/>
				</div>
			</div>

			<div className="pointer-events-none absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 text-zinc-700">
				<ShieldAlert className="h-4 w-4" aria-hidden="true" />
				<span className="text-xs">Secure authentication by CodeStage</span>
			</div>

			<style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
		</main>
	);
};

export const InvalidTokenPage = () => {
	const handleRefresh = () => {
		window.location.reload();
	};

	return (
		<main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0f]">
			<div
				className="pointer-events-none absolute inset-0"
				style={{
					backgroundImage: `
              radial-gradient(ellipse 50% 80% at 20% 40%, rgba(220, 38, 38, 0.12), transparent),
              radial-gradient(ellipse 50% 80% at 80% 50%, rgba(251, 146, 60, 0.08), transparent),
              radial-gradient(ellipse 80% 50% at 50% 100%, rgba(220, 38, 38, 0.1), transparent)
            `,
				}}
			/>

			<div className="pointer-events-none absolute inset-0 opacity-20">
				<div
					className="absolute inset-0"
					style={{
						backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
					}}
				/>
			</div>

			<div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600/5 blur-[150px]" />

			<div className="relative z-10 flex flex-col items-center px-6 text-center">
				<div className="relative mb-8">
					<div className="absolute -inset-4 animate-pulse rounded-full bg-red-500/20 blur-xl" />
					<div className="absolute -inset-8 rounded-full bg-red-500/10 blur-2xl" />

					<div className="relative flex h-28 w-28 items-center justify-center">
						<div className="absolute inset-0 rounded-full border border-red-500/30 bg-linear-to-b from-red-950/80 to-red-900/40" />
						<div className="absolute inset-[3px] rounded-full border border-red-500/20 bg-linear-to-b from-red-950 to-[#0a0a0f]" />

						<div className="absolute inset-0 rounded-full opacity-60">
							<div
								className="h-full w-full rounded-full"
								style={{
									background:
										"conic-gradient(from 0deg, transparent, rgba(239, 68, 68, 0.3), transparent 30%)",
									animation: "spin 4s linear infinite",
								}}
							/>
						</div>

						<div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-b from-red-600 to-red-700 shadow-lg shadow-red-600/30">
							<X
								className="h-8 w-8 text-white"
								strokeWidth={3}
								aria-hidden="true"
							/>
						</div>
					</div>
				</div>

				<div className="mb-3 flex items-center gap-2">
					<Lock className="h-4 w-4 text-red-400" aria-hidden="true" />
					<span className="text-xs font-semibold uppercase tracking-widest text-red-400">
						Authentication Error
					</span>
				</div>

				<h1 className="mb-4 bg-linear-to-b from-white via-white to-white/60 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
					Invalid Token
				</h1>

				<p className="mb-10 max-w-md text-base leading-relaxed text-zinc-400 sm:text-lg">
					The authentication token provided is either{" "}
					<span className="text-zinc-300">missing</span>,{" "}
					<span className="text-zinc-300">expired</span>, or{" "}
					<span className="text-zinc-300">invalid</span>. Please request a new
					link to continue.
				</p>

				<div className="mb-12 grid w-full max-w-sm grid-cols-3 gap-3">
					{[
						{ icon: "⏱", label: "Expired" },
						{ icon: "🔗", label: "Invalid URL" },
						{ icon: "✓", label: "Already Used" },
					].map((item) => (
						<div
							key={item.label}
							className="flex flex-col items-center gap-2 rounded-xl border border-zinc-800/80 bg-zinc-900/50 px-3 py-4 backdrop-blur-sm"
						>
							<span className="text-xl">{item.icon}</span>
							<span className="text-xs text-zinc-500">{item.label}</span>
						</div>
					))}
				</div>

				<div className="flex w-full max-w-sm flex-col gap-3 sm:flex-row">
					<Button
						variant="outline"
						size="lg"
						className="group flex-1 gap-2 border-zinc-700 bg-zinc-900/80 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
						onClick={handleRefresh}
						aria-label="Try again"
					>
						<RotateCcw
							className="h-4 w-4 transition-transform group-hover:-rotate-45"
							aria-hidden="true"
						/>
						Retry
					</Button>
					<Button
						asChild
						size="lg"
						className="group flex-1 gap-2 bg-linear-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-600/20 hover:from-red-500 hover:to-red-400"
					>
						<Link to="/" aria-label="Go back to home page">
							<Home className="h-4 w-4" aria-hidden="true" />
							Back Home
						</Link>
					</Button>
				</div>
			</div>

			<div className="pointer-events-none absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 text-zinc-700">
				<ShieldAlert className="h-4 w-4" aria-hidden="true" />
				<span className="text-xs">Secure authentication by CodeStage</span>
			</div>

			<style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
		</main>
	);
};
