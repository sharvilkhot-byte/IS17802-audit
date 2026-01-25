
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types for the Inner Landscape
export type GardenWeather = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'foggy';
export type GardenSeason = 'planting' | 'growing' | 'harvest' | 'dormant';
export type GardenTime = 'dawn' | 'day' | 'dusk' | 'night';

export interface UserProfile {
    anxietyScore: number;
    avoidanceScore: number;
    primaryStyle: 'secure' | 'anxious' | 'avoidant' | 'fearful' | 'unknown';
    gardenArchetype: 'moonflower' | 'fortress' | 'oak' | 'wildflower' | 'unknown';
}

export interface OnboardingAnswers {
    soil: 'rich' | 'muddy' | 'dry' | null;
    roots: 'vine' | 'stone' | 'oak' | null; // Anxiety
    branches: 'vine' | 'stone' | 'oak' | null; // Avoidance
    weather: 'thistle' | 'shell' | 'reed' | null; // Conflict
}

interface GardenState {
    weather: GardenWeather;
    season: GardenSeason;
    timeOfDay: GardenTime;
    profile: UserProfile;
    onboardingAnswers: OnboardingAnswers;
    plantHealth: number; // 0-100
    lastWatered: Date | null;
    lastReportDate: Date | null; // For Bi-weekly reports
    setWeather: (w: GardenWeather) => void;
    setSeason: (s: GardenSeason) => void;
    setTimeOfDay: (t: GardenTime) => void;
    waterPlant: () => void; // New action
    updateProfile: (p: Partial<UserProfile>) => void;
    setAnswer: (key: keyof OnboardingAnswers, value: any) => void;
    setLastReportDate: (d: Date) => void;
}

const defaultProfile: UserProfile = {
    anxietyScore: 0,
    avoidanceScore: 0,
    primaryStyle: 'unknown',
    gardenArchetype: 'unknown'
};

const GardenContext = createContext<GardenState | undefined>(undefined);

export const GardenProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [weather, setWeather] = useState<GardenWeather>('sunny');
    const [season, setSeason] = useState<GardenSeason>('planting');
    const [timeOfDay, setTimeOfDay] = useState<GardenTime>('day');
    const [profile, setProfile] = useState<UserProfile>(defaultProfile);

    // Onboarding State
    const [onboardingAnswers, setOnboardingAnswers] = useState<OnboardingAnswers>({
        soil: null,
        roots: null,
        branches: null,
        weather: null
    });

    // Plant State
    const [plantHealth, setPlantHealth] = useState(50);
    const [lastWatered, setLastWatered] = useState<Date | null>(null);
    const [lastReportDate, setLastReportDateState] = useState<Date | null>(null);

    const updateProfile = React.useCallback((updates: Partial<UserProfile>) => {
        setProfile(prev => ({ ...prev, ...updates }));
    }, []);

    const setAnswer = React.useCallback((key: keyof OnboardingAnswers, value: any) => {
        setOnboardingAnswers(prev => ({ ...prev, [key]: value }));
    }, []);

    const setLastReportDate = React.useCallback((d: Date) => {
        setLastReportDateState(d);
    }, []);

    const waterPlant = React.useCallback(() => {
        setPlantHealth(prev => Math.min(prev + 20, 100));
        setLastWatered(new Date());
        setWeather('sunny'); // Watering clears clouds
    }, []);

    const gardenValue = React.useMemo(() => ({
        weather,
        season,
        timeOfDay,
        profile,
        onboardingAnswers,
        plantHealth,
        lastWatered,
        lastReportDate,
        setWeather,
        setSeason,
        setTimeOfDay,
        updateProfile,
        setAnswer,
        setLastReportDate,
        waterPlant
    }), [weather, season, timeOfDay, profile, onboardingAnswers, plantHealth, lastWatered, lastReportDate, setWeather, setSeason, setTimeOfDay, updateProfile, setAnswer, setLastReportDate, waterPlant]);

    return (
        <GardenContext.Provider value={gardenValue}>
            {children}
        </GardenContext.Provider>
    );
};

export const useGarden = () => {
    const context = useContext(GardenContext);
    if (context === undefined) {
        throw new Error('useGarden must be used within a GardenProvider');
    }
    return context;
};
