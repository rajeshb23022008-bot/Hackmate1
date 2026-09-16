import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

interface AnimatedListProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedList: React.FC<AnimatedListProps> = ({ children, className }) => {
  return (
    <div className={className}>
      <AnimatePresence mode="popLayout">{children}</AnimatePresence>
    </div>
  );
};

interface AnimatedListItemProps {
  children: React.ReactNode;
  className?: string;
  index?: number;
  layout?: boolean;
}

export const AnimatedListItem: React.FC<AnimatedListItemProps> = ({
  children,
  className,
  index = 0,
  layout = true,
}) => {
  return (
    <motion.div
      layout={layout}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{
        duration: 0.25,
        delay: index * 0.04,
        ease: [0.25, 1, 0.5, 1],
      }}
      className={clsx('will-change-transform', className)}
    >
      {children}
    </motion.div>
  );
};
