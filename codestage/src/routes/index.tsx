import { createFileRoute } from "@tanstack/react-router";
import { HeroSection } from "@/components/hero-section";
import { FeaturesStrip } from "@/components/features-strip";
import { HowItWorks } from "@/components/how-it-works";
import { WorkspacePreview } from "@/components/workspace-preview";
import { UseCases } from "@/components/use-cases";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

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
