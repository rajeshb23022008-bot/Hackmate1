import { useRef, useEffect } from 'react';
import { Check, Target, Zap, Clock, Briefcase, Award, Cpu } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionCard } from '../ui/MotionCard';

gsap.registerPlugin(ScrollTrigger);

export default function MatchExplainer() {
  const sectionRef = useRef<HTMLElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Animate left side factors with stagger
      if (leftColRef.current) {
        const factorItems = leftColRef.current.querySelectorAll('.factor-item');
        gsap.fromTo(
          factorItems,
          { opacity: 0, x: -30 },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: leftColRef.current,
              start: 'top 80%',
              once: true,
            },
          }
        );
      }

      // Animate right side preview card
      if (rightColRef.current) {
        gsap.fromTo(
          rightColRef.current,
          { opacity: 0, scale: 0.95, y: 30 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: rightColRef.current,
              start: 'top 80%',
              once: true,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const factors = [
    { label: 'Skill Gap Coverage', weight: '35%', icon: Cpu, desc: 'Fills what existing members lack' },
    { label: 'Domain & Track Alignment', weight: '20%', icon: Target, desc: 'SIH, AI, FinTech, Web3, etc.' },
    { label: 'Hackathon Overlap', weight: '15%', icon: Award, desc: 'Targeting same event dates & rules' },
    { label: 'Role & Chemistry Fit', weight: '10%', icon: Briefcase, desc: 'Leader, Specialist, Designer, etc.' },
    { label: 'Experience Level Balance', weight: '10%', icon: Zap, desc: 'Complementary seniority levels' },
    { label: 'Weekly Availability', weight: '10%', icon: Clock, desc: 'Matching time commitment (15-20h)' },
  ];

  return (
    <section ref={sectionRef} className="py-24 bg-navy-800/80 border-y border-navy-700/60 relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left Column: Weighted Algorithm Factors */}
          <div ref={leftColRef} className="flex-1 w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-accent/10 border border-blue-accent/20 text-xs font-semibold text-blue-accent mb-4">
              <Zap className="w-3.5 h-3.5" />
              <span>Weighted Matching Algorithm</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
              Not just a search bar. <br />
              A <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-accent to-blue-400">Two-Way Engine</span>.
            </h2>
            <p className="text-base md:text-lg text-slate-300 mb-8 leading-relaxed">
              We calculate multidimensional compatibility so every team formed has the balanced skills required to submit a winning hackathon project.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {factors.map((factor, index) => {
                const Icon = factor.icon;
                return (
                  <div
                    key={index}
                    className="factor-item p-3.5 bg-navy-900/90 rounded-xl border border-navy-700/80 hover:border-blue-accent/30 transition-colors will-change-transform"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-navy-800 flex items-center justify-center text-blue-accent">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-white text-sm font-semibold">{factor.label}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-blue-accent px-2 py-0.5 rounded bg-blue-accent/10">
                        {factor.weight}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 pl-9">{factor.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Live Compatibility Card Preview */}
          <div ref={rightColRef} className="flex-1 w-full max-w-md will-change-transform">
            <MotionCard
              interactive={false}
              className="bg-navy-900/95 rounded-2xl border border-navy-700/80 p-6 md:p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-accent/15 blur-3xl rounded-full pointer-events-none"></div>

              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Top Teammate Recommendation
                  </div>
                  <h3 className="text-2xl font-bold text-white">Alex Chen</h3>
                  <p className="text-blue-accent text-sm font-medium">AI/ML & Distributed Systems</p>
                  <p className="text-slate-400 text-xs mt-0.5">IIT Bombay • 3rd Year CS</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full border-2 border-emerald-400/80 bg-emerald-500/10 flex items-center justify-center relative shadow-[0_0_15px_rgba(52,211,153,0.2)]">
                    <span className="text-xl font-extrabold text-emerald-300">96%</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-1">
                    SYNERGY
                  </span>
                </div>
              </div>

              {/* Verified Checks */}
              <div className="space-y-3 pt-4 border-t border-navy-800">
                <div className="flex items-start gap-3 text-slate-300 text-sm">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>
                    Fills missing <strong className="text-white">PyTorch & FastAPI</strong> requirement
                  </span>
                </div>

                <div className="flex items-start gap-3 text-slate-300 text-sm">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>
                    Selected track: <strong className="text-white">Smart India Hackathon (HealthTech)</strong>
                  </span>
                </div>

                <div className="flex items-start gap-3 text-slate-300 text-sm">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>
                    Available <strong className="text-white">20+ hrs/week</strong> for sprint hacking
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-navy-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Previous: 2x Hackathon Finalist</span>
                <span className="text-xs font-semibold text-blue-accent cursor-pointer hover:underline">
                  View Full Profile →
                </span>
              </div>
            </MotionCard>
          </div>
        </div>
      </div>
    </section>
  );
}
