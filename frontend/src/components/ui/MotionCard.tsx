import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import clsx from 'clsx';

export interface MotionCardProps extends HTMLMotionProps<'div'> {
  interactive?: boolean;
  glowOnHover?: boolean;
}

export const MotionCard = React.forwardRef<HTMLDivElement, MotionCardProps>(
  ({ children, className, interactive = true, glowOnHover = true, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={interactive ? { scale: 1.015, y: -2 } : undefined}
        whileTap={interactive ? { scale: 0.99 } : undefined}
        transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
        className={clsx(
          'bg-navy-800 rounded-2xl border border-navy-700/80 p-6 transition-colors will-change-transform',
          interactive && 'hover:border-navy-600 cursor-pointer',
          glowOnHover && 'hover:shadow-[0_8px_30px_rgba(0,0,0,0.35),0_0_15px_rgba(100,255,218,0.12)]',
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

MotionCard.displayName = 'MotionCard';
