import { CTASection } from '@/features/landing/components/CTASection';
import { FeaturesSection } from '@/features/landing/components/FeaturesSection';
import { HeroSection } from '@/features/landing/components/HeroSection';
import { LandingFooter } from '@/features/landing/components/LandingFooter';
import { LandingNav } from '@/features/landing/components/LandingNav';
import { ProductShowcase } from '@/features/landing/components/ProductShowcase';
import { StatisticsSection } from '@/features/landing/components/StatisticsSection';
import { TestimonialsSection } from '@/features/landing/components/TestimonialsSection';
import { TrustedBySection } from '@/features/landing/components/TrustedBySection';
import { WorkflowSection } from '@/features/landing/components/WorkflowSection';

/**
 * TalentFlow marketing landing page. Composes independent, reusable sections
 * into the full narrative: hero → social proof → features → product →
 * workflow → stats → testimonials → CTA → footer. Lazily loaded so Framer
 * Motion stays out of the app bundle.
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen scroll-smooth bg-background text-foreground">
      <LandingNav />
      <main id="main-content">
        <HeroSection />
        <TrustedBySection />
        <FeaturesSection />
        <ProductShowcase />
        <WorkflowSection />
        <StatisticsSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
