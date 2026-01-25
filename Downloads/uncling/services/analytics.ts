import { supabase } from './supabase';
import { InternalState } from '../types';

interface Stats {
  totalCheckIns: number;
  patterns: {
    Secure: number;
    Anxious: number;
    Avoidant: number;
  };
  truthBankBalance: number;
  streakDays: number;
  rescueCount: number;
  chatSessionCount: number;
}

export const get15DayStats = async (userId: string): Promise<Stats> => {
  // 1. Fetch Check-ins (Last 15 days)
  // Parallelize requests for performance
  const [
    { data: checkIns },
    { count: evidenceCount },
    { count: rescueCount },
    { count: chatCount }
  ] = await Promise.all([
    // 1. Fetch Check-ins (Last 15 days)
    supabase
      .from('daily_check_ins')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()),

    // 2. Fetch Evidence Logs (Total)
    supabase
      .from('evidence_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId),

    // 3. Fetch Rescue Sessions (Last 15 days)
    supabase
      .from('rescue_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()),

    // 4. Fetch Chat Sessions (Total)
    supabase
      .from('chat_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
  ]);

  // 3. Process Patterns
  const patterns = {
    Secure: 0,
    Anxious: 0,
    Avoidant: 0
  };

  checkIns?.forEach((c: { state: InternalState }) => {
    const s = c.state as keyof typeof patterns;
    if (patterns[s] !== undefined) {
      patterns[s]++;
    }
  });

  // 4. Calculate Streak (MVP: Simple unique days count for last 15 days)
  const uniqueDays = new Set(checkIns?.map((c: any) => c.created_at.split('T')[0])).size;

  return {
    totalCheckIns: checkIns?.length || 0,
    patterns,
    truthBankBalance: evidenceCount || 0,
    streakDays: uniqueDays,
    rescueCount: rescueCount || 0,
    chatSessionCount: chatCount || 0
  };
};

// Legacy/Placeholder functions to prevent App.tsx breakage
export const identifyUser = (user: any) => {
  // console.log("Identify", user.id);
};

export const resetUser = () => {
  // console.log("Reset user");
};
