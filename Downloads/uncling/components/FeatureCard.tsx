


import React, { ReactNode } from 'react';
// Fix: Changed react-router-dom import to a namespace import to resolve module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';

interface FeatureCardProps {
  to: string;
  icon: ReactNode;
  title: string;
  description: string;
}

const FeatureCard = React.forwardRef<HTMLAnchorElement, FeatureCardProps>(
  ({ to, icon, title, description }, ref) => {
    return (
      <ReactRouterDOM.Link ref={ref} to={to} className="block group">
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full">
          <div className="text-forest mb-4">
            {icon}
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-textPrimary mb-2">{title}</h3>
          <p className="text-textSecondary">{description}</p>
        </div>
      </ReactRouterDOM.Link>
    );
  }
);

export default FeatureCard;
