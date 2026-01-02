import React from 'react';
import { LucideIcon } from 'lucide-react';
import Card from '../Card';

interface ActionCardProps {
    title: string;
    subtitle?: string; // For "Let's notice together" contexts
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
    className?: string; // For extra styling
}

const ActionCard: React.FC<ActionCardProps> = ({ title, subtitle, icon, onClick, variant = 'primary', className = '' }) => {
    const isPrimary = variant === 'primary';

    // Primary: Large, central, subtle shadow/pulse
    // Secondary: Smaller, simpler

    if (isPrimary) {
        return (
            <button
                onClick={onClick}
                className={`w-full max-w-md aspect-[4/3] sm:aspect-[2/1] bg-white rounded-3xl shadow-sm hover:shadow-md transition-all duration-500 group relative overflow-hidden text-left p-8 border border-slate-100 ${className}`}
            >
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500 scale-150 transform origin-top-right">
                    {icon}
                </div>

                <div className="flex flex-col justify-between h-full relative z-10">
                    <div>
                        {/* Optional Icon/Indicator */}
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-4 text-textPrimary group-hover:scale-110 transition-transform duration-500">
                            {icon || <div className="w-2 h-2 bg-textPrimary rounded-full" />}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-light text-textPrimary mb-2 group-hover:translate-x-1 transition-transform duration-300">
                            {title}
                        </h2>
                        {subtitle && <p className="text-textSecondary font-light">{subtitle}</p>}
                    </div>
                </div>
            </button>
        );
    }

    return (
        <button
            onClick={onClick}
            className={`w-full max-w-md bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-100 p-4 flex items-center gap-4 hover:bg-white transition-colors duration-300 text-left shadow-sm ${className}`}
        >
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-textSecondary shrink-0">
                {icon}
            </div>
            <div>
                <span className="text-textSecondary font-medium block">{title}</span>
            </div>
        </button>
    );
};

export default ActionCard;
