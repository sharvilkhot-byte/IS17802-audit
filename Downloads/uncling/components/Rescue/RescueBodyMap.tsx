import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface BodyArea {
    id: string;
    label: string;
    description: string;
    position: { top: string; left: string };
    color: string;
}

const BODY_AREAS: BodyArea[] = [
    {
        id: 'head',
        label: 'Head',
        description: 'Racing thoughts / Fog',
        position: { top: '15%', left: '50%' },
        color: 'bg-indigo-400'
    },
    {
        id: 'throat',
        label: 'Throat',
        description: 'Stifled voice / Choking',
        position: { top: '25%', left: '50%' },
        color: 'bg-blue-400'
    },
    {
        id: 'chest',
        label: 'Chest',
        description: 'Panic / Heartache',
        position: { top: '35%', left: '50%' },
        color: 'bg-rose-400'
    },
    {
        id: 'gut',
        label: 'Gut',
        description: 'Dread / Intuition',
        position: { top: '50%', left: '50%' },
        color: 'bg-amber-400'
    },
];

interface RescueBodyMapProps {
    onSelect: (areaId: string) => void;
}

const RescueBodyMap: React.FC<RescueBodyMapProps> = ({ onSelect }) => {
    const [selected, setSelected] = useState<string | null>(null);

    return (
        <div className="flex flex-col items-center justify-center h-full px-6 text-center animate-fade-in">
            <h2 className="text-2xl font-serif text-slate-800 mb-2">Where do you feel it?</h2>
            <p className="text-slate-500 mb-8 text-sm">Tap the area active in your body.</p>

            <div className="relative w-64 h-96 bg-slate-100 rounded-full border-2 border-slate-200 shadow-inner flex items-center justify-center mb-8">
                {/* Abstract Body Silhouette */}
                <div className="absolute inset-0 opacity-10">
                    <svg viewBox="0 0 100 200" className="w-full h-full">
                        <path d="M50 20 C65 20 75 35 75 50 C75 60 70 65 85 80 L90 150 L50 190 L10 150 L15 80 C30 65 25 60 25 50 C25 35 35 20 50 20 Z" fill="currentColor" />
                    </svg>
                </div>

                {BODY_AREAS.map((area) => (
                    <motion.button
                        key={area.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.2 }}
                        onClick={() => {
                            setSelected(area.id);
                            setTimeout(() => onSelect(area.id), 800); // Delay for visual feedback
                        }}
                        className={`absolute w-16 h-16 rounded-full -ml-8 -mt-8 flex items-center justify-center transition-all duration-300 ${selected === area.id ? 'ring-4 ring-white shadow-xl scale-110 z-10' : 'hover:opacity-90'}`}
                        style={{
                            top: area.position.top,
                            left: area.position.left,
                            backgroundColor: selected === area.id ? undefined : 'rgba(255,255,255,0.8)',
                        }}
                    >
                        <div className={`w-12 h-12 rounded-full ${area.color} opacity-80 backdrop-blur-sm flex items-center justify-center shadow-sm`}>
                            {selected === area.id && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-4 h-4 bg-white rounded-full"
                                />
                            )}
                        </div>
                    </motion.button>
                ))}
            </div>

            <div className="h-12">
                {selected && (
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-slate-600 font-medium bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm"
                    >
                        {BODY_AREAS.find(a => a.id === selected)?.description}
                    </motion.p>
                )}
            </div>
        </div>
    );
};

export default RescueBodyMap;
