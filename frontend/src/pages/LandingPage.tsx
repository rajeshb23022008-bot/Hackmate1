import LandingNavbar from '../components/landing/LandingNavbar';
import Hero3D from '../components/landing/Hero3D';
import ProblemStatement from '../components/landing/ProblemStatement';
import HowItWorks from '../components/landing/HowItWorks';
import MatchExplainer from '../components/landing/MatchExplainer';
import LiveMatchesCarousel from '../components/landing/LiveMatchesCarousel';
import SkillCloud from '../components/landing/SkillCloud';
import StatsCounters from '../components/landing/StatsCounters';
import { PageTransition } from '../components/ui/PageTransition';

export default function LandingPage() {
  return (
    <PageTransition className="bg-navy-900 min-h-screen text-slate-300 font-sans selection:bg-blue-accent/30 selection:text-blue-accent">
      <LandingNavbar />
      <main>
        <Hero3D />
        <ProblemStatement />
        <HowItWorks />
        <MatchExplainer />
        <LiveMatchesCarousel />
        <SkillCloud />
        <StatsCounters />
      </main>
      
      {/* Footer */}
      <footer className="py-8 bg-navy-950 border-t border-navy-800 text-center text-xs text-slate-400">
        <div className="container mx-auto px-6">
          <p>© {new Date().getFullYear()} HACKMATE. Built for Smart India Hackathon & Collegiate Hackers.</p>
        </div>
      </footer>
    </PageTransition>
  );
}
