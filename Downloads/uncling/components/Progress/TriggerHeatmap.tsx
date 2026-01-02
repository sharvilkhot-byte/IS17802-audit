import React from 'react';

// For MVP, we can just use a simple grid of badges as planned in the implementation
// referencing the visual plan: "Visual grid for trigger intensity"
// We can make it look like small heat cells.

interface TriggerEvent {
    name: string;
    intensity: 'low' | 'medium' | 'high';
}

interface TriggerHeatmapProps {
    triggers: TriggerEvent[];
}

const TriggerHeatmap: React.FC<TriggerHeatmapProps> = ({ triggers }) => {
    return (
        <div className="flex flex-wrap gap-2">
            {triggers.map((t, idx) => {
                let colorClass = 'bg-slate-100 text-slate-600';
                if (t.intensity === 'high') colorClass = 'bg-red-50 text-red-400 border border-red-100';
                if (t.intensity === 'medium') colorClass = 'bg-orange-50 text-orange-400 border border-orange-100';
                if (t.intensity === 'low') colorClass = 'bg-green-50 text-green-400 border border-green-100';

                return (
                    <span key={idx} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${colorClass}`}>
                        {t.name}
                    </span>
                );
            })}
        </div>
    );
};

export default TriggerHeatmap;
