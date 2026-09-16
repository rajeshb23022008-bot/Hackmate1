import { useRef, useEffect } from 'react';
import { Award, ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SwipeCarousel } from '../ui/SwipeCarousel';
import { MotionCard } from '../ui/MotionCard';
import { MotionButton } from '../ui/MotionButton';

gsap.registerPlugin(ScrollTrigger);

interface MatchCardData {
  id: string;
  name: string;
  role: string;
  college: string;
  skills: string[];
  matchScore: number;
  lookingFor: string;
  hackathon: string;
  avatarColor: string;
}

const mockMatches: MatchCardData[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    role: 'Full-Stack Developer',
    college: 'BITS Pilani',
    skills: ['Next.js', 'PostgreSQL', 'Docker', 'GraphQL'],
    matchScore: 98,
    lookingFor: 'Seeking AI/ML specialist for SIH 2026',
    hackathon: 'Smart India Hackathon',
    avatarColor: 'from-blue-500 to-indigo-600',
  },
  {
    id: '2',
    name: 'Rohan Gupta',
    role: 'AI / Computer Vision',
    college: 'IIT Delhi',
    skills: ['PyTorch', 'OpenCV', 'FastAPI', 'CUDA'],
    matchScore: 95,
    lookingFor: 'Seeking Frontend Dev & UI Designer',
    hackathon: 'HackMIT India',
    avatarColor: 'from-emerald-500 to-teal-600',
  },
  {
    id: '3',
    name: 'Ananya Verma',
    role: 'UI/UX & Product Designer',
    college: 'NID Ahmedabad',
    skills: ['Figma', 'Prototyping', 'Design Systems', 'Tailwind'],
    matchScore: 93,
    lookingFor: 'Ready to join existing Web3/FinTech team',
    hackathon: 'ETHIndia',
    avatarColor: 'from-pink-500 to-purple-600',
  },
  {
    id: '4',
    name: 'Kabir Mehta',
    role: 'Blockchain / Smart Contracts',
    college: 'IIIT Hyderabad',
    skills: ['Solidity', 'Foundry', 'Ethereum', 'Web3.js'],
    matchScore: 91,
    lookingFor: 'Looking for Fullstack dev & Pitch leader',
    hackathon: 'Polygon Hackathon',
    avatarColor: 'from-amber-500 to-orange-600',
  },
  {
    id: '5',
    name: 'Sneha Patel',
    role: 'IoT & Embedded Systems',
    college: 'VIT Vellore',
    skills: ['ESP32', 'C++', 'MQTT', 'Raspberry Pi'],
    matchScore: 89,
    lookingFor: 'Building smart hardware for Smart Cities track',
    hackathon: 'SIH Hardware Edition',
    avatarColor: 'from-cyan-500 to-blue-600',
  },
];

export default function LiveMatchesCarousel() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-navy-900 overflow-hidden relative">
      <div className="container mx-auto px-6 max-w-6xl">
        <SwipeCarousel
          title="Live Teammate Recommendations"
          subtitle="Swipe or drag horizontally to discover student builders matched to upcoming hackathons."
        >
          {mockMatches.map((match) => (
            <div key={match.id} className="min-w-[310px] md:min-w-[340px] max-w-[360px] shrink-0 select-none">
              <MotionCard
                interactive={true}
                className="bg-navy-800/90 border border-navy-700/80 hover:border-blue-accent/50 p-6 flex flex-col justify-between h-[380px] shadow-lg"
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-full bg-gradient-to-tr ${match.avatarColor} flex items-center justify-center text-white font-bold text-base shadow-sm`}
                      >
                        {match.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white leading-snug">{match.name}</h4>
                        <p className="text-xs text-blue-accent font-medium">{match.role}</p>
                        <p className="text-[11px] text-slate-400">{match.college}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {match.matchScore}%
                      </span>
                      <span className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">match</span>
                    </div>
                  </div>

                  {/* Target Hackathon Badge */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-navy-900 border border-navy-700 text-xs text-slate-300 mb-3">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span className="truncate">{match.hackathon}</span>
                  </div>

                  {/* Pitch / Looking For */}
                  <p className="text-xs text-slate-300 italic mb-4 line-clamp-2">
                    "{match.lookingFor}"
                  </p>

                  {/* Skills Pills */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {match.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-navy-700/60 text-slate-300 text-[11px] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-navy-700/60 flex items-center justify-between mt-auto">
                  <span className="text-xs text-slate-400">Status: Looking for team</span>
                  <a href="/signup">
                    <MotionButton size="sm" variant="outline" className="gap-1 text-xs py-1 px-3">
                      <span>Connect</span>
                      <ArrowRight className="w-3 h-3" />
                    </MotionButton>
                  </a>
                </div>
              </MotionCard>
            </div>
          ))}
        </SwipeCarousel>
      </div>
    </section>
  );
}
