
import { OnboardingQuestion, QuestionAxis } from './types';

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
    // Anxiety Axis (Questions 1-6)
    { id: 1, question: "I worry that my loved ones will not be there for me when I need them.", axis: QuestionAxis.Anxiety },
    { id: 2, question: "I get nervous when my partner or close friend is distant or unresponsive.", axis: QuestionAxis.Anxiety },
    { id: 3, question: "It’s important for me to feel a very high degree of closeness with my partner.", axis: QuestionAxis.Anxiety },
    { id: 4, question: "I feel a strong need for reassurance that I am loved and valued.", axis: QuestionAxis.Anxiety },
    { id: 5, question: "I tend to overthink and analyze every word and action in my relationships.", axis: QuestionAxis.Anxiety },
    { id: 6, question: "When there is a problem, I feel a strong urge to fix it immediately, even if it feels like I'm doing all the work.", axis: QuestionAxis.Anxiety },
    
    // Avoidance Axis (Questions 7-12)
    { id: 7, question: "I prefer to rely on myself rather than asking others for help.", axis: QuestionAxis.Avoidance },
    { id: 8, question: "I find it difficult to share my deepest feelings and fears with others.", axis: QuestionAxis.Avoidance },
    { id: 9, question: "I feel uncomfortable when a relationship becomes too intimate or emotionally intense.", axis: QuestionAxis.Avoidance },
    { id: 10, question: "I feel a strong need to maintain my independence, even in a close relationship.", axis: QuestionAxis.Avoidance },
    { id: 11, question: "I tend to pull away from people when they try to get too close.", axis: QuestionAxis.Avoidance },
    { id: 12, question: "I find it hard to express my emotions, even when I feel them intensely.", axis: QuestionAxis.Avoidance },
    
    // Potential Secondary Traits (Questions 13-15)
    { id: 13, question: "When faced with conflict, my first instinct is to withdraw or avoid the conversation.", axis: QuestionAxis.Trait },
    { id: 14, question: "I often prioritize others' needs over my own to maintain harmony in a relationship.", axis: QuestionAxis.Trait },
    { id: 15, question: "My emotions can feel overwhelming and hard to control at times.", axis: QuestionAxis.Trait }
];
