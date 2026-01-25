
import React, { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for class merging (should be in a utils file, but inlining for speed)
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  variant?: 'white' | 'glass';
}

const Card: React.FC<CardProps> = ({ children, className, variant = 'white', ...props }) => {
  const baseClasses = 'p-6 sm:p-8 rounded-3xl overflow-hidden transition-shadow duration-300 border border-brand-rose/20';

  const variantClasses = {
    white: 'bg-white shadow-soft hover:shadow-lg text-brand-deep',
    glass: 'bg-white/60 backdrop-blur-xl border-white/40 shadow-glass text-brand-deep',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
