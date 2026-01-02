import React, { ReactNode } from 'react';
import EducationCard from '../Education/EducationCard';
import { EducationContent } from '../../data/embeddedEducation';

interface InsightCardProps {
    title: string;
    children: ReactNode;
    education?: EducationContent;
    className?: string;
    icon?: ReactNode;
}

const InsightCard: React.FC<InsightCardProps> = ({ title, children, education, className = '', icon }) => {
    return (
        <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-6 ${className}`}>
            <div className="flex items-center gap-3 mb-6">
                {icon && <div className="text-forest">{icon}</div>}
                <h3 className="text-lg font-medium text-textPrimary">{title}</h3>
            </div>

            <div className="mb-6">
                {children}
            </div>

            {education && (
                <div className="mt-4 pt-4 border-t border-slate-50">
                    <EducationCard content={education} />
                </div>
            )}
        </div>
    );
};

export default InsightCard;
