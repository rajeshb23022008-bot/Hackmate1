import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useSpring, type PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

interface SwipeCarouselProps {
  children: React.ReactNode;
  className?: string;
  itemGap?: number;
  title?: string;
  subtitle?: string;
}

export const SwipeCarousel: React.FC<SwipeCarouselProps> = ({
  children,
  className,
  itemGap = 20,
  title,
  subtitle,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [maxScroll, setMaxScroll] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const x = useMotionValue(0);
  const smoothX = useSpring(x, { damping: 28, stiffness: 220, mass: 0.8 });

  const calculateBounds = useCallback(() => {
    if (!containerRef.current || !trackRef.current) return;
    const containerWidth = containerRef.current.offsetWidth;
    const trackWidth = trackRef.current.scrollWidth;
    const max = Math.min(0, containerWidth - trackWidth - 32);
    setMaxScroll(max);

    const currentX = x.get();
    if (currentX < max) {
      x.set(max);
    } else if (currentX > 0) {
      x.set(0);
    }

    setCanScrollPrev(x.get() < -10);
    setCanScrollNext(x.get() > max + 10);
  }, [x]);

  useEffect(() => {
    calculateBounds();
    window.addEventListener('resize', calculateBounds);
    return () => window.removeEventListener('resize', calculateBounds);
  }, [calculateBounds]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    // Add momentum offset
    const momentumOffset = info.velocity.x * 0.2;
    let targetX = x.get() + momentumOffset;

    if (targetX > 0) targetX = 0;
    if (targetX < maxScroll) targetX = maxScroll;

    x.set(targetX);
    setCanScrollPrev(targetX < -10);
    setCanScrollNext(targetX > maxScroll + 10);
  };

  const handlePrev = () => {
    if (!containerRef.current) return;
    const step = containerRef.current.offsetWidth * 0.75;
    const newX = Math.min(0, x.get() + step);
    x.set(newX);
    setCanScrollPrev(newX < -10);
    setCanScrollNext(newX > maxScroll + 10);
  };

  const handleNext = () => {
    if (!containerRef.current) return;
    const step = containerRef.current.offsetWidth * 0.75;
    const newX = Math.max(maxScroll, x.get() - step);
    x.set(newX);
    setCanScrollPrev(newX < -10);
    setCanScrollNext(newX > maxScroll + 10);
  };

  return (
    <div className={clsx('w-full relative select-none', className)}>
      {(title || subtitle) && (
        <div className="flex items-end justify-between mb-6 px-1">
          <div>
            {title && <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{title}</h3>}
            {subtitle && <p className="text-slate-400 text-sm md:text-base mt-1">{subtitle}</p>}
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={!canScrollPrev}
              aria-label="Previous slide"
              className={clsx(
                'w-10 h-10 rounded-full border border-navy-700 bg-navy-800 flex items-center justify-center transition-all',
                canScrollPrev
                  ? 'text-white hover:bg-navy-700 hover:border-blue-accent/50 cursor-pointer active:scale-95'
                  : 'text-slate-600 border-navy-800/50 cursor-not-allowed opacity-50'
              )}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              disabled={!canScrollNext}
              aria-label="Next slide"
              className={clsx(
                'w-10 h-10 rounded-full border border-navy-700 bg-navy-800 flex items-center justify-center transition-all',
                canScrollNext
                  ? 'text-white hover:bg-navy-700 hover:border-blue-accent/50 cursor-pointer active:scale-95'
                  : 'text-slate-600 border-navy-800/50 cursor-not-allowed opacity-50'
              )}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Overflow container with draggable motion track */}
      <div ref={containerRef} className="overflow-hidden cursor-grab active:cursor-grabbing w-full py-4 -my-4">
        <motion.div
          ref={trackRef}
          drag="x"
          dragConstraints={{ left: maxScroll, right: 0 }}
          dragElastic={0.12}
          onDragEnd={handleDragEnd}
          style={{ x: smoothX, gap: `${itemGap}px` }}
          className="flex flex-nowrap items-stretch will-change-transform"
        >
          {children}
        </motion.div>
      </div>

      {/* Mobile swipe hint */}
      <div className="flex sm:hidden justify-center items-center gap-2 mt-4 text-xs text-slate-400">
        <span>← Swipe to explore →</span>
      </div>
    </div>
  );
};
