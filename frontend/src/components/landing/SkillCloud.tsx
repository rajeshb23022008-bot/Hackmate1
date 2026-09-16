import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const skillCategories = [
  { name: 'PyTorch', category: 'ai' },
  { name: 'React', category: 'frontend' },
  { name: 'Node.js', category: 'backend' },
  { name: 'TensorFlow', category: 'ai' },
  { name: 'Figma', category: 'design' },
  { name: 'UI/UX Design', category: 'design' },
  { name: 'AWS Cloud', category: 'devops' },
  { name: 'Docker', category: 'devops' },
  { name: 'Solidity', category: 'web3' },
  { name: 'PostgreSQL', category: 'backend' },
  { name: 'TailwindCSS', category: 'frontend' },
  { name: 'Next.js', category: 'frontend' },
  { name: 'GraphQL', category: 'backend' },
  { name: 'Computer Vision', category: 'ai' },
  { name: 'FastAPI', category: 'backend' },
  { name: 'Flutter', category: 'mobile' },
  { name: 'Rust', category: 'systems' },
  { name: 'Smart India Hackathon', category: 'hackathon' },
  { name: 'Go / Golang', category: 'backend' },
  { name: 'Embedded / IoT', category: 'hardware' },
];

export default function SkillCloud() {
  const containerRef = useRef<HTMLElement>(null);
  const badgeGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      if (badgeGridRef.current) {
        const badges = badgeGridRef.current.querySelectorAll('.skill-badge');
        gsap.fromTo(
          badges,
          { opacity: 0, scale: 0.8, y: 15 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.03,
            ease: 'back.out(1.5)',
            scrollTrigger: {
              trigger: badgeGridRef.current,
              start: 'top 85%',
              once: true,
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-24 bg-navy-900/90 border-t border-navy-700/60 overflow-hidden">
      <div className="container mx-auto px-6 text-center max-w-5xl">
        <span className="text-xs uppercase tracking-widest text-blue-accent font-semibold px-3 py-1 rounded-full bg-blue-accent/10 border border-blue-accent/20">
          Versatile Matching Engine
        </span>
        <h2 className="text-3xl md:text-5xl font-bold text-white mt-4 mb-4 tracking-tight">
          Any Skill. Any Domain. Any Stack.
        </h2>
        <p className="text-slate-400 text-base md:text-lg mb-12 max-w-xl mx-auto">
          Whether you're developing generative AI pipelines, hardware firmware, or Web3 protocols, find the teammates who complete your team.
        </p>

        <div ref={badgeGridRef} className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
          {skillCategories.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{
                scale: 1.06,
                y: -2,
                backgroundColor: 'rgba(100, 255, 218, 0.12)',
                borderColor: 'rgba(100, 255, 218, 0.6)',
                color: '#64ffda',
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="skill-badge px-4 py-2 bg-navy-800 border border-navy-700/80 rounded-xl text-slate-300 text-sm font-medium select-none cursor-pointer transition-colors shadow-sm will-change-transform"
            >
              {item.name}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
