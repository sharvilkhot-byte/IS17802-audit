
import React, { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  className,
  isLoading,
  disabled,
  ...props
}) => {
  const baseClasses = 'relative px-8 py-3 rounded-full font-heading font-bold text-base transition-all flex items-center justify-center gap-2 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-brand-lavender text-white hover:bg-brand-deep shadow-lg shadow-brand-lavender/30',
    secondary: 'bg-brand-coral text-white hover:opacity-90 shadow-lg shadow-brand-coral/20',
    ghost: 'bg-transparent text-brand-deep hover:bg-brand-lavender/10',
    glass: 'bg-white/40 backdrop-blur-md border border-white/50 text-brand-deep hover:bg-white/60 shadow-glass',
  };

  return (
    <motion.button
      className={cn(baseClasses, variantClasses[variant], className)}
      whileHover={!disabled && !isLoading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : null}
      {children}
    </motion.button>
  );
};

export default Button;
