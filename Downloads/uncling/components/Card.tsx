
import React, { ReactNode } from 'react';

// Fix: Extend React.HTMLAttributes<HTMLDivElement> to allow standard div props like onClick.
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div className={`bg-white p-5 sm:p-6 rounded-2xl shadow-lg overflow-hidden ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
