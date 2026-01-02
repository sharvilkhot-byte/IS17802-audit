import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface DataPoint {
    date: string;
    value: number; // 0-100 scale represented as Low/Mod/High
    label: string;
}

interface PatternChartProps {
    data: DataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-slate-100 shadow-sm rounded-lg text-xs">
                <p className="font-semibold text-slate-700">{label}</p>
                <p className="text-slate-500">{payload[0].payload.label}</p>
            </div>
        );
    }
    return null;
};

const PatternChart: React.FC<PatternChartProps> = ({ data }) => {
    if (!data || data.length === 0) return <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No pattern data yet</div>;

    return (
        <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
                <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#34D399" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#34D399" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        hide={true}
                        domain={[0, 100]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#34D399"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorValue)"
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PatternChart;
