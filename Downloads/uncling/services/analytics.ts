import posthog from 'posthog-js';
import { User } from '../types';

// In a real app, these would come from environment variables.
// Replace with your actual PostHog Project API Key and instance address.
const POSTHOG_KEY = 'phc_1aMrOOjkKcn0W3l1MZIDoqULerpvY4iijIp46XsqEwr';
const POSTHOG_HOST = 'https://app.posthog.com';

const isAnalyticsEnabled = !!(POSTHOG_KEY && POSTHOG_HOST);

if (isAnalyticsEnabled && typeof window !== 'undefined') {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    // Enable autocapture to automatically track page views and clicks.
    autocapture: true, 
    // Disable session recording for privacy reasons, as it can capture sensitive info.
    session_recording: {
        disabled: true
    }
  });
}

/**
 * Identifies the current user in PostHog.
 * @param user The authenticated user object from Supabase.
 */
export const identifyUser = (user: User) => {
  if (!isAnalyticsEnabled) return;
  
  // We only send non-PII data. The user ID from Supabase is a great unique identifier.
  // We also send the attachment style as a user property to segment users.
  posthog.identify(user.id, {
    attachment_style: user.attachment_style,
    preferred_name_set: !!user.preferred_name
  });
};

/**
 * Clears the identified user on logout.
 */
export const resetUser = () => {
  if (!isAnalyticsEnabled) return;
  posthog.reset();
};

/**
 * Tracks a custom event in PostHog.
 * @param eventName The name of the event to track.
 * @param properties Optional properties to send with the event.
 */
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (!isAnalyticsEnabled) return;
  posthog.capture(eventName, properties);
};
