import { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionButton } from '../ui/MotionButton';
import { MotionCard } from '../ui/MotionCard';
import { Sparkles, Trophy, Users, Award } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const CounterCard = ({
  value,
  label,
  suffix = '+',
  icon: Icon,
}: {
  value: number;
  label: string;
  suffix?: string;
  icon: React.ComponentType<{ className?: string }>;
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const duration = 1800;
      const totalSteps = 45;
      const stepDuration = duration / totalSteps;
      const stepIncrement = end / totalSteps;

      const timer = setInterval(() => {
        start += stepIncrement;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, stepDuration);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <div ref={ref} className="stat-card will-change-transform">
      <MotionCard
        interactive={true}
        className="text-center p-8 bg-navy-800/90 rounded-2xl border border-navy-700/80 hover:border-blue-accent/40 shadow-lg flex flex-col items-center justify-center h-full"
      >
        <div className="w-12 h-12 rounded-xl bg-blue-accent/10 border border-blue-accent/20 flex items-center justify-center text-blue-accent mb-4">
          <Icon className="w-6 h-6" />
        </div>
        <div className="text-4xl md:text-5xl font-extrabold text-white font-mono tracking-tight mb-2">
          {count.toLocaleString()}
          <span className="text-blue-accent">{suffix}</span>
        </div>
        <div className="text-slate-400 font-semibold uppercase tracking-wider text-xs md:text-sm">
          {label}
        </div>
      </MotionCard>
    </div>
  );
};

export default function StatsCounters() {
  const sectionRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Stagger stats cards
      const cards = sectionRef.current?.querySelectorAll('.stat-card');
      if (cards && cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.15,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
              once: true,
            },
          }
        );
      }

      // CTA Banner Reveal
      if (ctaRef.current) {
        gsap.fromTo(
          ctaRef.current,
          { opacity: 0, scale: 0.96, y: 20 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: ctaRef.current,
              start: 'top 85%',
              once: true,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-navy-900 border-t border-navy-700/60 relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-5xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <CounterCard value={1420} label="Students Matched" icon={Users} />
          <CounterCard value={385} label="Teams Formed" icon={Trophy} />
          <CounterCard value={48} label="Hackathons Covered" icon={Award} />
        </div>

        {/* Bottom CTA Banner */}
        <div
          ref={ctaRef}
          className="relative bg-gradient-to-r from-navy-800 via-navy-800 to-navy-700/80 rounded-3xl border border-navy-700/80 p-8 md:p-14 text-center overflow-hidden shadow-2xl will-change-transform"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-accent/10 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 blur-3xl rounded-full pointer-events-none" />

          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-accent/10 border border-blue-accent/20 text-xs font-semibold text-blue-accent mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Join Hundreds of Collegiate Hackers</span>
          </span>

          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Ready to find your winning team?
          </h2>
          <p className="text-slate-300 text-base md:text-lg max-w-xl mx-auto mb-8">
            Create your profile in 2 minutes, get instant AI-matched teammate suggestions, and assemble your dream team.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="/signup">
              <MotionButton size="lg" glow className="px-10 py-4 text-base font-bold shadow-xl">
                Get Started Free
              </MotionButton>
            </a>
            <a href="/login">
              <MotionButton size="lg" variant="ghost" className="text-slate-300 hover:text-white">
                Already registered? Sign In
              </MotionButton>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
