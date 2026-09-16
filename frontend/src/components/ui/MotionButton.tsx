import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import clsx from 'clsx';

export interface MotionButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}

export const MotionButton = React.forwardRef<HTMLButtonElement, MotionButtonProps>(
  ({ children, className, variant = 'primary', size = 'md', glow = false, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-bold rounded-lg select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-accent will-change-transform';
    
    const sizeStyles = {
      sm: 'px-3.5 py-1.5 text-xs',
      md: 'px-6 py-3 text-sm',
      lg: 'px-8 py-4 text-base'
    };

    const variantStyles = {
      primary: 'bg-blue-accent text-navy-900 shadow-sm hover:shadow-[0_0_20px_rgba(100,255,218,0.4)]',
      secondary: 'bg-navy-800 border border-navy-700 text-white hover:bg-navy-700 hover:border-navy-600',
      outline: 'bg-transparent border border-blue-accent/60 text-blue-accent hover:bg-blue-accent/10',
      ghost: 'bg-transparent text-slate-300 hover:text-white hover:bg-navy-800/60'
    };

    const glowStyles = glow ? 'shadow-[0_0_25px_rgba(100,255,218,0.35)]' : '';

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.18, ease: [0.25, 1, 0.5, 1] }}
        className={clsx(baseStyles, sizeStyles[size], variantStyles[variant], glowStyles, className)}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

MotionButton.displayName = 'MotionButton';
