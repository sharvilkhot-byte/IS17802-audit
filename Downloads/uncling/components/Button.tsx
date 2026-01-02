
import React, { ReactNode } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className, ...props }) => {
  const baseClasses = 'px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl font-medium text-white transition-all duration-500 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed tracking-wide';
  const variantClasses = {
    primary: 'bg-forest text-white hover:bg-moss focus:ring-moss', // Unclinq Primary
    secondary: 'bg-sage/50 text-textPrimary hover:bg-sage focus:ring-sage shadow-none', // Unclinq Secondary
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
