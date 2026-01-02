import React from 'react';

const LogoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <img src="https://i.ibb.co/wZh3tzCj/uncling.png" alt="Uncling Logo" className={`h-20 sm:h-24 w-auto ${className}`} />
);

export default LogoIcon;
