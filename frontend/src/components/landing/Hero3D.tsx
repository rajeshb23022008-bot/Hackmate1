import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Trophy, Users, ShieldCheck } from 'lucide-react';
import * as THREE from 'three';
import { MotionButton } from '../ui/MotionButton';

// Highly optimized interactive 3D Node & Constellation Network
const InteractiveConstellation = () => {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  const { pointer } = useThree();

  // Particle & Network configuration
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const nodeCount = isMobile ? 30 : 55; // Reduced for mobile
  const connectionDistance = isMobile ? 2.5 : 3.2;

  // Pre-generate stable positions
  const { nodePositions, lineGeometry } = useMemo(() => {
    const pos = new Float32Array(nodeCount * 3);
    const coords: THREE.Vector3[] = [];

    // Distribute nodes in an organic 3D ellipsoid
    for (let i = 0; i < nodeCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * 4.5;
      
      const x = r * Math.sin(phi) * Math.cos(theta) * 1.3;
      const y = r * Math.sin(phi) * Math.sin(theta) * 0.9;
      const z = r * Math.cos(phi) * 0.8;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      coords.push(new THREE.Vector3(x, y, z));
    }

    // Connect close neighbors
    const lineIndices: number[] = [];
    for (let i = 0; i < nodeCount; i++) {
      let connections = 0;
      for (let j = i + 1; j < nodeCount; j++) {
        if (coords[i].distanceTo(coords[j]) < connectionDistance && connections < 3) {
          lineIndices.push(i, j);
          connections++;
        }
      }
    }

    const lineGeom = new THREE.BufferGeometry();
    lineGeom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    lineGeom.setIndex(lineIndices);

    return { nodePositions: pos, lineGeometry: lineGeom };
  }, [nodeCount, connectionDistance]);

  // Frame loop for 60fps smooth rotation and mouse-follow parallax
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Smooth lerping mouse parallax
    const targetRotX = -pointer.y * 0.25;
    const targetRotY = pointer.x * 0.35 + state.clock.elapsedTime * 0.04;

    groupRef.current.rotation.x = THREE.MathUtils.damp(
      groupRef.current.rotation.x,
      targetRotX,
      3,
      delta
    );
    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      targetRotY,
      3,
      delta
    );

    // Subtle breathing scale
    const breath = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.015;
    groupRef.current.scale.set(breath, breath, breath);
  });

  return (
    <group ref={groupRef}>
      {/* Network Nodes */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[nodePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.16}
          color="#64ffda"
          sizeAttenuation
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Network Connection Lines */}
      <lineSegments ref={linesRef} geometry={lineGeometry}>
        <lineBasicMaterial
          color="#2563eb"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* Central Pulsing Synergy Sphere */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshBasicMaterial color="#64ffda" wireframe transparent opacity={0.4} />
      </mesh>
    </group>
  );
};

export default function Hero3D() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative min-h-[92vh] w-full bg-navy-900 overflow-hidden flex items-center justify-center pt-20 pb-16">
      {/* Background Glow Orbs (GPU transformed) */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none will-change-transform" 
      />
      <div 
        className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-blue-accent/10 rounded-full blur-[100px] pointer-events-none will-change-transform" 
      />

      {/* 3D Canvas with Performance-tuned R3F Settings */}
      {mounted && (
        <div className="absolute inset-0 z-0 opacity-70 pointer-events-auto">
          <Canvas
            camera={{ position: [0, 0, 7.5], fov: 50 }}
            dpr={[1, 1.5]} // Capped pixel ratio to ensure 60fps on retina and mid-tier GPUs
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: 'high-performance',
              precision: 'mediump',
            }}
          >
            <ambientLight intensity={0.6} />
            <InteractiveConstellation />
          </Canvas>
        </div>
      )}

      {/* Hero UI Content (GPU-accelerated entry & transforms) */}
      <div className="relative z-10 container mx-auto px-6 max-w-6xl">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-navy-800/80 border border-navy-700/80 backdrop-blur-md text-xs font-semibold text-blue-accent mb-6 shadow-sm will-change-transform"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Smart India Hackathon & College Hackathons</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight max-w-4xl will-change-transform"
          >
            Find the skills. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-accent via-teal-300 to-blue-400">
              Build the dream team.
            </span> <br />
            Win the hackathon.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
            className="text-lg sm:text-xl text-slate-300 mt-6 max-w-2xl leading-relaxed will-change-transform"
          >
            HACKMATE is the two-way matching platform that pairs builders with idea-leaders based on verified skills, domains, and goals.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto will-change-transform"
          >
            <a href="/signup" className="w-full sm:w-auto block">
              <MotionButton size="lg" className="w-full sm:w-auto gap-2 group shadow-lg">
                <span>Get Matched Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </MotionButton>
            </a>
            <a href="/login" className="w-full sm:w-auto block">
              <MotionButton size="lg" variant="secondary" className="w-full sm:w-auto">
                Sign In
              </MotionButton>
            </a>
          </motion.div>

          {/* Floating Live Highlights (GPU-only micro-float animation) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 w-full max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ y: -3, scale: 1.02 }}
              className="flex items-center gap-3 p-4 bg-navy-800/60 backdrop-blur-md rounded-xl border border-navy-700/60 shadow-md text-left will-change-transform"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-white font-bold text-sm">Two-Way Match</div>
                <div className="text-slate-400 text-xs">Mutual skill complement</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              whileHover={{ y: -3, scale: 1.02 }}
              className="flex items-center gap-3 p-4 bg-navy-800/60 backdrop-blur-md rounded-xl border border-navy-700/60 shadow-md text-left will-change-transform"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-white font-bold text-sm">Role Synergy</div>
                <div className="text-slate-400 text-xs">AI, Web, Design & Leads</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{ y: -3, scale: 1.02 }}
              className="flex items-center gap-3 p-4 bg-navy-800/60 backdrop-blur-md rounded-xl border border-navy-700/60 shadow-md text-left will-change-transform"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="text-white font-bold text-sm">Smart India Hackathon</div>
                <div className="text-slate-400 text-xs">Verified college teams</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
