import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { User, AttachmentStyle, RelationshipStatus } from '../types';
import { Session } from '@supabase/supabase-js';

interface OnboardingData {
    style: AttachmentStyle;
    relationshipStatus?: RelationshipStatus;
    anxietyScore: number;
    avoidanceScore: number;
    traitScores: { [key: string]: number };
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    authError: string | null;
    updateOnboardingData: (data: OnboardingData) => Promise<void>;
    updatePreferredName: (name: string) => Promise<void>;
    updateUserProfile: (updates: Partial<User>) => Promise<void>;
    updateDailyStreak: (streak: number, date: string) => void;
    clearOnboardingData: () => Promise<boolean>;
    clearAuthError: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);

    const clearAuthError = () => {
        setAuthError(null);
    };

    useEffect(() => {
        const fetchUserAndProfile = async (session: Session | null) => {
            clearAuthError();
            if (session?.user) {
                const { data: userProfile, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (error && error.code === 'PGRST116') { // Profile does not exist, create it
                    if (!session.user.email) {
                        console.error("Cannot create profile, user email is missing.");
                        setAuthError("An error occurred during sign up: user email is missing.");
                        setUser(null);
                        return;
                    }

                    const { data: newUserProfile, error: insertError } = await supabase
                        .from('users')
                        .insert({
                            id: session.user.id,
                            email: session.user.email,
                            created_at: new Date().toISOString(),
                            daily_streak_count: 0
                        })
                        .select('*')
                        .single();

                    if (insertError) {
                        console.error("Database error creating user profile:", insertError.message || insertError);
                        setAuthError(`Database error creating your user profile: ${insertError.message}`);
                        setUser(null);
                    } else {
                        setUser(newUserProfile as User);
                    }
                } else if (error) {
                    console.error("Error fetching user profile:", error.message || error);
                    setAuthError(`Could not fetch your user profile: ${error.message}`);
                    setUser(null);
                } else {
                    setUser(userProfile as User);
                }
            } else {
                setUser(null);
            }
        };

        setLoading(true);

        supabase.auth.getSession().then(({ data: { session } }) => {
            fetchUserAndProfile(session).finally(() => {
                setLoading(false);
            });
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            // Create profile on sign up
            if (_event === 'SIGNED_IN') {
                fetchUserAndProfile(session);
            } else if (_event === 'SIGNED_OUT') {
                setUser(null);
            }
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    const updateOnboardingData = async (data: OnboardingData) => {
        if (user) {
            const { style, anxietyScore, avoidanceScore } = data;
            const { data: updatedUser, error } = await supabase
                .from('users')
                .update({
                    attachment_style: style,
                    anxiety_score: anxietyScore,
                    avoidance_score: avoidanceScore,
                })
                .eq('id', user.id)
                .select('*')
                .single();

            if (!error && updatedUser) {
                setUser(updatedUser as User);
            } else if (error) {
                console.error("Error updating onboarding data:", error);
            }
        }
    };

    const updatePreferredName = async (name: string) => {
        if (user) {
            const { data: updatedUser, error } = await supabase
                .from('users')
                .update({ preferred_name: name })
                .eq('id', user.id)
                .select('*')
                .single();

            if (!error && updatedUser) {
                setUser(updatedUser as User);
            } else if (error) {
                console.error("Error updating preferred name:", error);
            }
        }
    };

    const updateUserProfile = async (updates: Partial<User>) => {
        if (user) {
            // Optimistic update
            setUser({ ...user, ...updates });

            const { data: updatedUser, error } = await supabase
                .from('users')
                .update(updates)
                .eq('id', user.id)
                .select('*')
                .single();

            if (error) {
                console.error("Error updating profile:", error);
                // Revert or handle error - (simple logging for now as we want specific UX flow)
            } else if (updatedUser) {
                setUser(updatedUser as User);
            }
        }
    };

    const updateDailyStreak = (streak: number, date: string) => {
        if (user) {
            setUser({
                ...user,
                daily_streak_count: streak,
                last_check_in_date: date,
            });
        }
    };

    const clearOnboardingData = async (): Promise<boolean> => {
        if (!user) return false;

        const { data: updatedUser, error } = await supabase
            .from('users')
            .update({
                attachment_style: null,
                anxiety_score: null,
                avoidance_score: null,
            })
            .eq('id', user.id)
            .select('*')
            .single();

        if (error) {
            console.error("Error clearing onboarding data:", error);
            return false;
        } else {
            setUser(updatedUser as User);
            return true;
        }
    };

    const value = {
        user,
        loading,
        authError,
        updateOnboardingData,
        updatePreferredName,
        updateUserProfile,
        updateDailyStreak,
        clearOnboardingData,
        clearAuthError
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
