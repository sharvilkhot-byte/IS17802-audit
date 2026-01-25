
import React, { useRef } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { cn } from '../../utils/cn';

interface SeedProps {
    id: string;
    type: 'vine' | 'stone' | 'oak' | 'thistle' | 'shell' | 'reed';
    label: string;
    description?: string;
    onDragEnd: (id: string, point: { x: number, y: number }) => void;
    className?: string;
}

const DraggableSeed: React.FC<SeedProps> = ({ id, type, label, description, onDragEnd, className }) => {
    const controls = useDragControls();

    // Seed Visuals
    const visuals = {
        vine: "bg-purple-400 rounded-tr-3xl rounded-bl-3xl", // Spiral-ish
        stone: "bg-slate-400 rounded-2xl", // Blocky
        oak: "bg-amber-600 rounded-full", // Acorn
        thistle: "bg-red-400/80 rotate-45 rounded-sm", // Sharp
        shell: "bg-blue-300 rounded-t-full rounded-b-none", // Clam
        reed: "bg-emerald-400 rounded-full w-4 h-12" // Tall
    };

    return (
        <div className={cn("flex flex-col items-center gap-3 touch-none", className)}>
            <motion.div
                drag
                dragControls={controls}
                dragSnapToOrigin
                whileDrag={{ scale: 1.2, zIndex: 50, cursor: 'grabbing' }}
                whileHover={{ scale: 1.05, cursor: 'grab' }}
                onDragEnd={(e, info) => onDragEnd(id, info.point)}
                className={cn(
                    "w-16 h-16 shadow-lg flex items-center justify-center relative cursor-grab active:cursor-grabbing",
                    visuals[type]
                )}
            >
                <div className="absolute inset-0 bg-white/20 blur-sm rounded-inherit pointer-events-none" />
                <div className="w-2 h-2 bg-white/60 rounded-full blur-[1px]" />
            </motion.div>

            <div className="text-center pointer-events-none select-none">
                <p className="font-heading font-bold text-brand-deep text-sm">{label}</p>
                {description && <p className="text-xs text-brand-deep/50 max-w-[120px]">{description}</p>}
            </div>
        </div>
    );
};

export default DraggableSeed;
