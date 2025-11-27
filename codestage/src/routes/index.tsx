import { createFileRoute } from "@tanstack/react-router";
import { FeaturesStrip } from "@/components/features-strip";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/hero-section";
import { HowItWorks } from "@/components/how-it-works";
import { Navbar } from "@/components/navbar";
import { UseCases } from "@/components/use-cases";
import { WorkspacePreview } from "@/components/workspace-preview";

export const Route = createFileRoute("/")({
	component: HomePage,
});

export default function HomePage() {
	return (
		<main className="relative min-h-screen overflow-hidden bg-background">
			<div className="pointer-events-none fixed inset-0 grid-pattern" />
			<Navbar />
			<HeroSection />
			<FeaturesStrip />
			<HowItWorks />
			<WorkspacePreview />
			<UseCases />
			<Footer />
		</main>
	);
}
