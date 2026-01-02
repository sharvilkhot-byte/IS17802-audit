import React from 'react';

// For simplicity in this demo, we'll use a visual radial-style metric or just stats
// since a full complex radial graph might be overkill for the MVP without heavy libraries.
// Let's do a "Stat Cluster" design which is very clean.

interface RecoveryMetrics {
    averageTimeMinutes: number;
    improvementPercent: number; // e.g. 15% faster
}

const RecoveryGraph: React.FC<RecoveryMetrics> = ({ averageTimeMinutes, improvementPercent }) => {
    return (
        <div className="flex items-center justify-around py-4">
            <div className="text-center">
                <p className="text-xs text-textSecondary uppercase tracking-wider mb-1">Avg Recovery</p>
                <p className="text-3xl font-light text-textPrimary">
                    {averageTimeMinutes}<span className="text-sm text-slate-400 ml-1">min</span>
                </p>
            </div>

            <div className="h-10 w-px bg-slate-100" />

            <div className="text-center">
                <p className="text-xs text-textSecondary uppercase tracking-wider mb-1">Trend</p>
                <div className="flex items-center justify-center gap-1">
                    <span className="text-2xl font-light text-moss">
                        {improvementPercent > 0 ? '↓' : '↑'} {Math.abs(improvementPercent)}%
                    </span>
                    <span className="text-xs text-slate-400">faster</span>
                </div>
            </div>
        </div>
    );
};

export default RecoveryGraph;
