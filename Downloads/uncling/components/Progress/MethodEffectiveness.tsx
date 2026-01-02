import React from 'react';

interface MethodData {
    method: string;
    effectiveness: number; // 0-100
    usageCount: number;
}

interface MethodEffectivenessProps {
    data: MethodData[];
}

const MethodEffectiveness: React.FC<MethodEffectivenessProps> = ({ data }) => {
    // Sort by effectiveness
    const sortedData = [...data].sort((a, b) => b.effectiveness - a.effectiveness);

    return (
        <div className="space-y-4">
            {sortedData.map((item, idx) => (
                <div key={idx} className="group">
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-textPrimary font-medium">{item.method}</span>
                        <span className="text-textSecondary text-xs">{item.usageCount} sessions</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-400 rounded-full transition-all duration-1000 ease-out group-hover:bg-blue-500"
                            style={{ width: `${item.effectiveness}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MethodEffectiveness;
