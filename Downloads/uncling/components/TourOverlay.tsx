import React, { useState, useEffect, useRef, RefObject, useLayoutEffect } from 'react';
import Button from './Button';

interface StepConfig {
    ref: RefObject<HTMLElement>;
    title: string;
    content: string;
}

interface TourOverlayProps {
  stepConfig: StepConfig;
  onNext: () => void;
  onEnd: () => void;
  isLastStep: boolean;
}

const ARROW_SIZE = 8;
const GAP = 12;

const TourOverlay: React.FC<TourOverlayProps> = ({ stepConfig, onNext, onEnd, isLastStep }) => {
    const { ref: targetRef, title, content } = stepConfig;
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState<React.CSSProperties>({ opacity: 0 });
    const [placement, setPlacement] = useState<'top' | 'bottom'>('bottom');

    useLayoutEffect(() => {
        const updatePosition = () => {
            if (!targetRef.current || !tooltipRef.current) return;

            targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            const targetRect = targetRef.current.getBoundingClientRect();
            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            
            let newPlacement: 'top' | 'bottom' = 'bottom';
            const spaceBelow = window.innerHeight - targetRect.bottom;
            
            if (spaceBelow < tooltipRect.height + GAP + 20) { // Prefer top if space is tight
                newPlacement = 'top';
            }

            setPlacement(newPlacement);

            const newTop = newPlacement === 'bottom'
                ? targetRect.bottom + GAP + window.scrollY
                : targetRect.top - tooltipRect.height - GAP + window.scrollY;

            let newLeft = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
            newLeft = Math.max(10, Math.min(newLeft, window.innerWidth - tooltipRect.width - 10));

            setStyle({
                opacity: 1,
                top: `${newTop}px`,
                left: `${newLeft}px`,
                transformOrigin: newPlacement === 'bottom' ? 'top center' : 'bottom center',
            });
        };
        
        // A short delay allows the scroll into view to complete before measuring
        const timeoutId = setTimeout(updatePosition, 300);
        
        targetRef.current?.classList.add('tour-highlight');
        window.addEventListener('resize', updatePosition);
        
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', updatePosition);
            targetRef.current?.classList.remove('tour-highlight');
        };
    }, [targetRef]);

    return (
        <div className="fixed inset-0 z-[1000]">
            <div className="fixed inset-0 bg-black/70 transition-opacity duration-300" onMouseDown={onEnd}></div>
            <style>{`
                .tour-highlight {
                    position: relative !important;
                    z-index: 1001 !important;
                    box-shadow: 0 0 0 9999px rgba(0,0,0,0.7);
                    border-radius: 1rem;
                    cursor: pointer;
                }
                @keyframes scale-in-tour {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-scale-in-tour {
                    animation: scale-in-tour 0.3s ease-out forwards;
                }
                .tooltip-arrow::after {
                    content: '';
                    position: absolute;
                    width: 0;
                    height: 0;
                    border-style: solid;
                }
                .tooltip-arrow.placement-bottom::after {
                    bottom: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    border-width: 0 ${ARROW_SIZE}px ${ARROW_SIZE}px ${ARROW_SIZE}px;
                    border-color: transparent transparent #F9F9F7 transparent;
                }
                .tooltip-arrow.placement-top::after {
                    top: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    border-width: ${ARROW_SIZE}px ${ARROW_SIZE}px 0 ${ARROW_SIZE}px;
                    border-color: #F9F9F7 transparent transparent transparent;
                }
            `}</style>
             <div
                ref={tooltipRef}
                className={`absolute bg-background p-5 rounded-lg shadow-2xl shadow-forest/30 z-[1002] w-full max-w-xs transition-opacity duration-300 animate-scale-in-tour tooltip-arrow placement-${placement}`}
                style={style}
                onMouseDown={e => e.stopPropagation()}
            >
                <h3 className="font-bold text-forest text-lg mb-2">{title}</h3>
                <p className="text-textSecondary text-sm leading-relaxed">{content}</p>
                <div className="flex justify-between items-center mt-4">
                    <button onClick={onEnd} className="text-xs text-textSecondary hover:underline">Skip Tour</button>
                    <Button onClick={onNext} className="!px-4 !py-2 text-sm">
                        {isLastStep ? "Got it!" : "Next"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TourOverlay;
