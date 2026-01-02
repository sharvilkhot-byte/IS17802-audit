import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import NudgeToast from './NudgeToast';
import { nudgeService } from '../../services/nudgeService';

interface NudgeContextType {
    showNudge: (message: string, type?: 'observation' | 'pattern') => void;
    checkAppOpenNudge: () => void;
}

const NudgeContext = createContext<NudgeContextType | undefined>(undefined);

export const useNudge = () => {
    const context = useContext(NudgeContext);
    if (!context) throw new Error('useNudge must be used within a NudgeProvider');
    return context;
};

export const NudgeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentNudge, setCurrentNudge] = useState<{ message: string, type: 'observation' | 'pattern' } | null>(null);

    const showNudge = useCallback((message: string, type: 'observation' | 'pattern' = 'observation') => {
        // Safety check can be added here if needed, but service handles frequency
        setCurrentNudge({ message, type });
        nudgeService.markShown();
    }, []);

    const checkAppOpenNudge = useCallback(() => {
        const nudge = nudgeService.getAppOpenNudge();
        if (nudge) {
            // Delay slightly so it doesn't pop immediately on load
            setTimeout(() => {
                showNudge(nudge.message, nudge.type);
            }, 2000);
        }
    }, [showNudge]);

    const handleDismiss = () => {
        setCurrentNudge(null);
        nudgeService.markDismissed();
    };

    return (
        <NudgeContext.Provider value={{ showNudge, checkAppOpenNudge }}>
            {children}
            {currentNudge && (
                <NudgeToast
                    message={currentNudge.message}
                    type={currentNudge.type}
                    onDismiss={handleDismiss}
                />
            )}
        </NudgeContext.Provider>
    );
};
