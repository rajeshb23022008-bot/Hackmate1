import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { UserCheck, Compass, Sparkles, Trophy } from 'lucide-react';
import { MotionCard } from '../ui/MotionCard';

gsap.registerPlugin(ScrollTrigger);

export default function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const stepsListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Header trigger
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 85%',
            once: true,
          },
        }
      );

      // Staggered step items
      if (stepsListRef.current) {
        const stepElements = stepsListRef.current.querySelectorAll('.step-row');
        gsap.fromTo(
          stepElements,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.15,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: stepsListRef.current,
              start: 'top 80%',
              once: true,
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const steps = [
    {
      num: '01',
      title: 'Create Your Profile & Set Goals',
      desc: 'Add your primary skills, preferred tech stack, GitHub/LinkedIn, and whether you are looking to lead an idea or join as a specialist.',
      icon: UserCheck,
      tag: '5 min setup',
    },
    {
      num: '02',
      title: 'Select Target Hackathons',
      desc: 'Choose from Smart India Hackathon, college hackathons, or global challenges. State your track (FinTech, HealthTech, AI, Web3).',
      icon: Compass,
      tag: 'Track alignment',
    },
    {
      num: '03',
      title: 'Get Ranked Synergy Matches',
      desc: 'Our compatibility engine matches complementary skills, time commitments, and team requirements with a clear % compatibility score.',
      icon: Sparkles,
      tag: 'Two-way matching',
    },
    {
      num: '04',
      title: 'Form Team & Collaborate in Real-Time',
      desc: 'Send join requests, instant message with prospective teammates in dedicated team channels, and finalize your roster before deadline.',
      icon: Trophy,
      tag: 'Win together',
    },
  ];

  return (
    <section className="py-24 bg-navy-900 relative" ref={containerRef}>
      <div className="container mx-auto px-6 max-w-5xl">
        <div ref={headerRef} className="text-center mb-16 will-change-transform">
          <span className="text-xs uppercase tracking-widest text-blue-accent font-semibold px-3 py-1 rounded-full bg-blue-accent/10 border border-blue-accent/20">
            Simple 4-Step Process
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mt-4 mb-4 tracking-tight">
            How HACKMATE Works
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            From solo developer to hackathon podium in 4 simple steps.
          </p>
        </div>

        <div ref={stepsListRef} className="space-y-6 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="step-row will-change-transform">
                <MotionCard className="bg-navy-800/80 border border-navy-700/80 hover:border-blue-accent/40 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-blue-accent/10 border border-blue-accent/30 text-blue-accent font-mono font-bold text-lg flex items-center justify-center">
                      {step.num}
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-navy-700/60 flex items-center justify-center text-slate-300">
                      <Icon className="w-5 h-5 text-blue-accent" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold text-white">{step.title}</h3>
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-navy-700 text-slate-300">
                        {step.tag}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm md:text-base leading-relaxed">{step.desc}</p>
                  </div>
                </MotionCard>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
