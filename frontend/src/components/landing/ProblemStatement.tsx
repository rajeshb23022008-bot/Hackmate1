import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Code, Lightbulb, CheckCircle2 } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionCard } from '../ui/MotionCard';

gsap.registerPlugin(ScrollTrigger);

export default function ProblemStatement() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 85%',
            once: true,
          },
        }
      );

      // Staggered reveal of cards
      if (cardsRef.current) {
        const cards = cardsRef.current.querySelectorAll('.problem-card');
        gsap.fromTo(
          cards,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 80%',
              once: true,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-navy-800/80 border-y border-navy-700/60 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10 max-w-6xl">
        <div ref={headerRef} className="text-center mb-16 will-change-transform">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            The Two-Way Matching Problem
          </h2>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
            Finding complementary skillsets shouldn't be the hardest part of winning a hackathon.
          </p>
        </div>

        <div ref={cardsRef} className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
          {/* Persona 1: Has idea, needs skills */}
          <div className="problem-card w-full max-w-md will-change-transform">
            <MotionCard className="bg-navy-900/90 border border-navy-700 hover:border-amber-500/40 p-8 h-full">
              <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mb-6">
                <Lightbulb className="w-7 h-7 text-amber-400" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-2xl font-bold text-white">The Visionary</h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300">Idea Lead</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                "I have a winning solution for the Smart India Hackathon problem statement, but I need an AI expert to build the pipeline."
              </p>
              <div className="space-y-2 pt-4 border-t border-navy-800">
                <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Missing Roles:</div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-300 text-xs rounded-lg font-medium">
                    Needs: PyTorch / ML
                  </span>
                  <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-300 text-xs rounded-lg font-medium">
                    Needs: Backend Architect
                  </span>
                </div>
              </div>
            </MotionCard>
          </div>

          {/* Connection Animation */}
          <div className="flex lg:flex-col items-center justify-center my-2 lg:my-0">
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
              className="w-14 h-14 rounded-full bg-blue-accent/10 border border-blue-accent/30 flex items-center justify-center text-blue-accent shadow-[0_0_20px_rgba(100,255,218,0.2)]"
            >
              <UserPlus className="w-6 h-6" />
            </motion.div>
          </div>

          {/* Persona 2: Has skills, needs team */}
          <div className="problem-card w-full max-w-md will-change-transform">
            <MotionCard className="bg-navy-900/90 border border-navy-700 hover:border-emerald-500/40 p-8 h-full">
              <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-6">
                <Code className="w-7 h-7 text-emerald-400" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-2xl font-bold text-white">The Builder</h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300">Deep Specialist</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                "I've built neural networks and fast microservices, but I don't have a registered team or domain problem statement yet."
              </p>
              <div className="space-y-2 pt-4 border-t border-navy-800">
                <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Available Skills:</div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-lg font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Python & FastAI
                  </span>
                  <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-lg font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Go / Distributed
                  </span>
                </div>
              </div>
            </MotionCard>
          </div>
        </div>
      </div>
    </section>
  );
}
