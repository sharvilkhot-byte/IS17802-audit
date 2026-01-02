
// Basic keywords for crisis detection
const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'want to die',
  'hurt myself', 'self-harm', 'better off dead'
];

export const checkForCrisisKeywords = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return CRISIS_KEYWORDS.some(keyword => lowerText.includes(keyword));
};

export const isHighIntensity = (text: string): boolean => {
  // Simple length + keyword heuristic for MVP
  // In real app, this would use sentiment analysis
  const HIGH_INTENSITY_KEYWORDS = ['panic', 'overwhelmed', 'can\'t breathe', 'too much', 'exploding', 'shaking'];
  const lowerText = text.toLowerCase();
  return text.length > 50 && HIGH_INTENSITY_KEYWORDS.some(k => lowerText.includes(k));
};
