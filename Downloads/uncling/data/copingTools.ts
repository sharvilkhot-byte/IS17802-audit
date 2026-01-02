
import { AttachmentStyle } from '../types';

export interface CopingTool {
  key: string;
  type: 'guided-steps' | 'fact-vs-feeling';
  title: string;
  description: string;
  instructions: string[];
}

export const copingToolsLibrary: Record<string, CopingTool[]> = {
  [AttachmentStyle.Anxious]: [
    {
      key: '5-4-3-2-1',
      type: 'guided-steps',
      title: 'The 5-4-3-2-1 Grounding Technique',
      description: 'A classic tool to pull your mind out of an anxious spiral and back into the present moment by engaging your senses.',
      instructions: [
        'Look for 5 things you can see around you.',
        'Find 4 things you can feel or touch.',
        'Listen for 3 things you can hear.',
        'Name 2 things you can smell right now.',
        'Identify 1 thing you can taste.'
      ]
    },
    {
      key: 'fact-vs-feeling',
      type: 'fact-vs-feeling',
      title: 'The \'Fact vs. Feeling\' Checklist',
      description: 'Anxious thoughts often feel like facts. This tool helps you separate your worries from objective reality.',
      instructions: [
        'In the left column, list only objective, verifiable evidence (e.g., "They haven\'t texted back in 3 hours"). In the right column, list every worry or catastrophic thought that comes to mind ("They\'re mad at me," "They\'re leaving me").'
      ]
    },
    {
      key: 'muscle-relaxation',
      type: 'guided-steps',
      title: 'Progressive Muscle Relaxation',
      description: 'Anxiety often causes physical tension. This exercise systematically releases that tension to help you feel calmer.',
      instructions: [
        'Find a quiet, comfortable place to sit or lie down.',
        'Take a deep breath. Clench the muscles in your toes and feet for 5 seconds, then exhale and release.',
        'Now, tense the muscles in your calves for 5 seconds, then release.',
        'Continue up your body: thighs, then buttocks.',
        'Tense your stomach and chest for 5 seconds, then release.',
        'Clench your hands into fists for 5 seconds, then release.',
        'Tense your arms, neck, and shoulders, then release.',
        'Finally, tense the muscles in your face for 5 seconds, then release.',
        'Notice the feeling of relaxation throughout your body.'
      ]
    }
  ],
  [AttachmentStyle.Avoidant]: [
    {
      key: 'body-scan',
      type: 'guided-steps',
      title: 'The Body Scan',
      description: 'This tool helps you get out of your head and into your body, where emotions are often held.',
      instructions: [
        'Find a quiet spot, sit comfortably, and close your eyes if you wish.',
        'Bring your awareness to your feet. Notice any sensations without judgment.',
        'Slowly move your focus up your body: ankles, calves, knees, thighs.',
        'Continue to your torso, back, and stomach.',
        'Bring your awareness to your hands, arms, and shoulders.',
        'Finally, notice sensations in your neck, jaw, and face.',
        'Just observe any feelings or tensions you find. Don\'t try to change them, just notice.'
      ]
    },
    {
      key: 'feelings-wheel',
      type: 'guided-steps',
      title: 'The \'Feelings Wheel\' Exercise',
      description: 'It can be difficult to name your emotions. This tool provides a vocabulary to help you understand what you\'re feeling.',
      instructions: [
        'Acknowledge that you are feeling something, even if you can\'t name it yet.',
        'Imagine a "Feelings Wheel" diagram. You can search for one online if you like.',
        'Start from the center with broad categories like \'sad,\' \'mad,\' or \'scared.\'',
        'Try to find a more specific word that fits what you\'re experiencing. The goal isn\'t to be perfect, just to practice naming it.'
      ]
    },
    {
      key: 'brain-dump',
      type: 'fact-vs-feeling', // Re-using this type for a single text input area
      title: 'The 5-Minute Brain Dump',
      description: 'This gives you a way to release thoughts and feelings without the pressure of sharing them with another person.',
      instructions: [
        'Set a timer for 5 minutes (optional). Write down every single thought and feeling that comes to mind, without editing, censoring, or judging yourself. When you\'re done, you can close this. The act of getting it out is the most important part.'
      ]
    }
  ],
  [AttachmentStyle.Fearful]: [
    {
      key: 'anchoring-statement',
      type: 'guided-steps',
      title: 'The \'Anchoring Statement\'',
      description: 'When you feel the competing urges to cling and flee, this statement can help ground you in a sense of internal safety.',
      instructions: [
        'First, notice the \'push-pull\' feeling. Acknowledge it by saying to yourself, \'I feel overwhelmed right now, and that\'s okay.\'',
        'Next, add a statement of self-compassion: \'It\'s hard to feel two things at once, but I can handle this.\'',
        'Now, anchor yourself to a simple truth: \'I am safe in this moment. I am in control of my actions.\'',
        'Repeat these statements as many times as you need to.'
      ]
    },
    {
      key: 'pause-checklist',
      type: 'guided-steps',
      title: 'The \'Push-Pull Pause\' Checklist',
      description: 'This structured checklist helps you create a conscious delay between feeling an urge and acting on it.',
      instructions: [
        'When you feel the urge to either excessively text or emotionally withdraw, stop.',
        'First, take three deep, slow breaths. Inhale... and exhale.',
        'Second, try to name the specific feeling driving this urge. Is it fear? Anger? Sadness?',
        'Third, think of one small, gentle action you can take instead of pushing or pulling. (e.g., walk around the room, get a glass of water).',
        'You have created a pause. You are in control.'
      ]
    },
    {
      key: 'safe-space',
      type: 'guided-steps',
      title: 'The \'Safe Space\' Visualization',
      description: 'This tool helps you create a mental sanctuary you can retreat to when you feel emotionally flooded or unsafe.',
      instructions: [
        'Find a quiet place and sit comfortably. Close your eyes.',
        'Visualize a place where you feel completely safe and secure. It could be real or imaginary.',
        'Engage your senses. What do you see in this space?',
        'What do you hear? Are there calming sounds?',
        'What do you smell? How does the air feel against your skin?',
        'Focus on the feeling of safety. Notice the sense of calm and control. Stay here for as long as you need.'
      ]
    }
  ],
  [AttachmentStyle.Secure]: [],
  [AttachmentStyle.Unknown]: [],
};
