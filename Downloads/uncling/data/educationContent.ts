import { AttachmentStyle } from '../types';

interface ResultContent {
  headline: string;
  description: string;
}

interface SlideContent {
  headline: string;
  content: string | { title: string; text: string }[];
}

export const onboardingResultContent: Record<string, ResultContent> = {
  [AttachmentStyle.Anxious]: {
    headline: 'Your Results Point to an Anxious Attachment Style.',
    description: 'This often means you deeply value connection and intimacy, but may experience anxiety about the stability of your relationships. You might find yourself worrying about your loved ones\' availability and seeking reassurance to feel secure.',
  },
  [AttachmentStyle.Avoidant]: {
    headline: 'Your Results Point to an Avoidant Attachment Style.',
    description: 'This often means you are highly independent and self-reliant, but may feel uncomfortable with deep emotional intimacy. You might prefer to handle challenges on your own and value your personal space and freedom in relationships.',
  },
  [AttachmentStyle.Fearful]: {
    headline: 'Your Results Point to a Fearful Attachment Style.',
    description: 'This often means you desire close relationships but also fear being hurt, leading to an internal push-pull. You might find yourself wanting intimacy one moment and needing to withdraw the next, which can feel confusing for both you and others.',
  },
  [AttachmentStyle.Secure]: {
    headline: 'Your Results Point to a Secure Attachment Style.',
    description: 'This often means you feel comfortable with intimacy and are confident in your relationships. You are able to trust others and be trusted, communicate your needs effectively, and handle conflict constructively.',
  }
};


const sharedSlides = {
    slide1: {
        headline: 'The Goal: "Earning" a Secure Attachment',
        content: 'Neuroscience shows that our brains can change. Regardless of your starting point, through self-awareness and new experiences, you can develop the patterns of a secure attachment style. This journey is about learning to give yourself the safety and validation you may have been seeking from others.'
    },
    slide2: {
        headline: 'The Benefits of a Secure Attachment',
        content: [
            { title: 'Feel Calmer', text: 'Better emotional regulation and less anxiety in relationships.' },
            { title: 'Build Healthier Bonds', text: 'More trust, better communication, and deeper intimacy.' },
            { title: 'Boost Your Self-Esteem', text: 'A stronger sense of self-worth that doesn\'t depend on external validation.' },
            { title: 'Become More Resilient', text: 'The ability to handle conflicts and life\'s ups and downs with more grace.' },
        ]
    }
};

const styleSpecificSlides: Record<string, SlideContent> = {
    [AttachmentStyle.Anxious]: {
        headline: 'Understanding Your Anxious Pattern',
        content: [
            { title: 'Core Fear', text: 'The fear of abandonment or disconnection.' },
            { title: 'Common Behaviors', text: 'When this fear is triggered, you might find yourself doing things to pull your partner closer, like seeking constant contact, overthinking their actions, or suppressing your own needs to please them.' },
            { title: 'The Path Forward', text: 'Your journey will focus on learning to self-soothe your anxiety, building trust in yourself, and communicating your needs clearly and calmly.' }
        ]
    },
    [AttachmentStyle.Avoidant]: {
        headline: 'Understanding Your Avoidant Pattern',
        content: [
            { title: 'Core Fear', text: 'The fear of losing your independence or being engulfed by intimacy.' },
            { title: 'Common Behaviors', text: 'When this fear is triggered, you might find yourself creating distance, suppressing your emotions, or focusing on tasks and logic rather than feelings.' },
            { title: 'The Path Forward', text: 'Your journey will focus on learning to recognize and safely connect with your emotions, identifying your own needs, and practicing vulnerability in small, manageable steps.' }
        ]
    },
    [AttachmentStyle.Fearful]: {
        headline: 'Understanding Your Fearful Pattern',
        content: [
            { title: 'Core Fear', text: 'A deep conflict between the fear of being too close and the fear of being too distant.' },
            { title: 'Common Behaviors', text: 'This can create a push-pull dynamic where you crave connection but then feel overwhelmed and retreat, often leading to emotional volatility.' },
            { title: 'The Path Forward', text: 'Your journey will focus on building a sense of internal safety, learning to tolerate discomfort without reacting, and developing consistency in your relationships.' }
        ]
    },
    [AttachmentStyle.Secure]: {
        headline: 'Nurturing Your Secure Pattern',
        content: [
            { title: 'Core Strength', text: 'Your foundation is a healthy balance of intimacy and independence.' },
            { title: 'Opportunities for Growth', text: 'Even with a secure base, life brings challenges. This space can help you deepen your self-awareness, navigate conflicts with even greater skill, and consciously maintain your emotional well-being.' },
            { title: 'The Path Forward', text: 'Your journey will focus on reinforcing your strengths, exploring the nuances of your emotional world, and continuing to cultivate healthy, resilient relationships.' }
        ]
    }
};

export const educationContent: Record<string, SlideContent[]> = {
    [AttachmentStyle.Anxious]: [sharedSlides.slide1, sharedSlides.slide2, styleSpecificSlides.Anxious],
    [AttachmentStyle.Avoidant]: [sharedSlides.slide1, sharedSlides.slide2, styleSpecificSlides.Avoidant],
    [AttachmentStyle.Fearful]: [sharedSlides.slide1, sharedSlides.slide2, styleSpecificSlides.Fearful],
    [AttachmentStyle.Secure]: [sharedSlides.slide1, sharedSlides.slide2, styleSpecificSlides.Secure],
};
