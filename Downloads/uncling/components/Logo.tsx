import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`flex items-center ${className}`}>
        <img src="https://i.ibb.co/wZh3tzCj/uncling.png" alt="Uncling Logo" className="h-10 sm:h-12 w-auto" />
        <span className="text-2xl sm:text-3xl font-heading font-bold text-brand-deep ml-2 sm:ml-3 tracking-tight">Uncling</span>
    </div>
);

export default Logo;
