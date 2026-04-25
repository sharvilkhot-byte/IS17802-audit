// Rescue Mode exercises personalised by attachment style.
// Grounded in: Polyvagal Theory, Somatic Experiencing, DBT, ACT, IFS, EMDR-informed care.
//
// Exercise sets are reordered (not replaced) based on activation type so the
// most effective technique leads for the user's actual state:
//   urge     → lead with containment / regulation
//   spiral   → lead with pattern-interruption / externalising
//   shutdown → lead with body-activation / sensory reconnection
//
// Each style still gets its own 3 exercises — ordering is the personalisation lever.

export const RESCUE_EXERCISES = {
  anxious: [
    {
      id: 'anxious_witness',
      title: 'Witness the Thought',
      type: 'text',
      hasTimer: false,
      instruction:
        "Notice the thought spinning — don't fight it. Name it like a cloud passing by: \"There's the fear again.\" You are not the thought. Your nervous system is scared right now, and that's allowed. Watch it move through.",
    },
    {
      id: 'anxious_box_breath',
      title: 'Box Breath',
      type: 'breath',
      hasTimer: false,
      instruction:
        'Breathe in for 4 counts, hold for 4, out for 4, hold for 4. Do this 4 times. The equal hold-phases quiet the urgency. You\'re signaling to your body that there is no emergency right now.',
    },
    {
      id: 'anxious_hand_on_heart',
      title: 'Hand on Heart',
      type: 'timer',
      hasTimer: true,
      duration_seconds: 300,
      instruction:
        'Place both hands on your chest. Feel your own warmth. Speak to yourself as you would a scared friend: "I\'m here. I\'m not going anywhere." Your body is the one constant — return to it.',
    },
  ],

  dismissive_avoidant: [
    {
      id: 'da_cold_water',
      title: 'Cold Water Reset',
      type: 'text',
      hasTimer: false,
      instruction:
        'Run cold water over your wrists for 20 seconds, or hold something ice cold. The shock wakes your parasympathetic nerve. You\'ll feel more present almost immediately. That numbness has somewhere to go now.',
    },
    {
      id: 'da_body_scan',
      title: 'Body Scan',
      type: 'timer',
      hasTimer: true,
      duration_seconds: 240,
      instruction:
        "Start at your feet and slowly move your attention upward — toes, calves, knees, belly, chest. No judgment, just noticing. Tension, warmth, heaviness. By the time you reach your head, you'll be back inside your body.",
    },
    {
      id: 'da_curiosity_write',
      title: 'What Am I Not Feeling?',
      type: 'writing',
      hasTimer: false,
      instruction:
        "Write: \"What am I not letting myself feel right now?\" or \"What's underneath the blankness?\" Don't push for answers — just write whatever comes. You're not forcing anything. You're just leaving a door open.",
    },
  ],

  fearful_avoidant: [
    {
      id: 'fa_butterfly_tap',
      title: 'Butterfly Tap',
      type: 'timer',
      hasTimer: true,
      duration_seconds: 120,
      instruction:
        'Cross your arms over your chest and tap your shoulders alternately — left, right, left, right — for 2 minutes. Keep a slow, steady rhythm. This bilateral pattern helps your brain settle the contradiction it\'s holding.',
    },
    {
      id: 'fa_two_columns',
      title: 'Name Both Sides',
      type: 'writing',
      hasTimer: false,
      instruction:
        'Write two columns: "I want to..." and "I\'m afraid of..." Fill both. Just naming the contradiction stops the internal war. You don\'t have to choose right now. Both sides are real and both are allowed.',
    },
    {
      id: 'fa_one_true_thing',
      title: 'One True Thing',
      type: 'text',
      hasTimer: false,
      instruction:
        "Look around and find one thing that is solid and real — a surface, an object, your own breath. Say it out loud or in your head: \"This is here. I am here.\" When everything feels uncertain, one true thing is enough.",
    },
  ],

  secure_leaning: [
    {
      id: 'sl_54321',
      title: '5-4-3-2-1 Grounding',
      type: 'text',
      hasTimer: false,
      instruction:
        'Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste. Take your time with each. This pulls you out of the story in your head and into the present moment — where you\'re actually safe.',
    },
    {
      id: 'sl_shake',
      title: 'Shake It Out',
      type: 'timer',
      hasTimer: true,
      duration_seconds: 120,
      instruction:
        "Shake your hands, roll your shoulders, bounce your knees — whatever feels natural. Keep it going for 2 minutes. You're not running from anything. You're helping your body complete the stress cycle it started.",
    },
    {
      id: 'sl_values',
      title: 'Values Check',
      type: 'writing',
      hasTimer: false,
      instruction:
        'Write: "What matters most to me right now?" Then: "Is what I\'m doing getting me closer to that, or further away?" Stress narrows our vision. This opens it back up and gives your next move a direction.',
    },
  ],
}

/**
 * Returns the 3 exercises for the user's attachment style, reordered so the
 * most effective technique for their current activation state leads.
 *
 * @param {string|null} style      - profile.primary_style key
 * @param {string|null} activation - 'urge' | 'spiral' | 'shutdown'
 * @returns {Array} 3 exercises in the optimal order for this state
 */
export function getExercisesForState(style, activation) {
  const pool = RESCUE_EXERCISES[style]
  if (!pool) return DEFAULT_RESCUE_EXERCISES

  // Lead-exercise id per style × activation:
  //   urge     → need containment / regulation first
  //   spiral   → need pattern-interruption / externalising first
  //   shutdown → need body-activation / sensory reconnection first
  const leadId = {
    anxious: {
      urge:     'anxious_box_breath',    // breathwork → somatic containment
      spiral:   'anxious_witness',       // cognitive externalising
      shutdown: 'anxious_hand_on_heart', // warmth / body reconnection
    },
    dismissive_avoidant: {
      urge:     'da_body_scan',          // slow internal attention → grounds urgency
      spiral:   'da_curiosity_write',    // externalise the loop onto page
      shutdown: 'da_cold_water',         // sharp sensory activation breaks freeze
    },
    fearful_avoidant: {
      urge:     'fa_butterfly_tap',      // bilateral rhythm → bilateral regulation
      spiral:   'fa_two_columns',        // names the contradiction, stops the war
      shutdown: 'fa_one_true_thing',     // single concrete anchor to reality
    },
    secure_leaning: {
      urge:     'sl_shake',              // discharge the activation physically
      spiral:   'sl_54321',             // sensory pull into the present moment
      shutdown: 'sl_shake',             // movement breaks the freeze state
    },
  }

  const styleLeads = leadId[style]
  if (!styleLeads || !activation || !styleLeads[activation]) return pool

  const targetId = styleLeads[activation]
  const lead = pool.find(ex => ex.id === targetId)
  if (!lead) return pool

  // Put the lead exercise first, keep original order for the rest
  return [lead, ...pool.filter(ex => ex.id !== targetId)]
}

// Fallback for users with no identified style yet
export const DEFAULT_RESCUE_EXERCISES = [
  {
    id: 'default_breath',
    title: 'Slow Your Breath',
    type: 'breath',
    hasTimer: false,
    instruction:
      'Breathe in for 4 counts, hold for 2, out for 6. The longer exhale activates your calming system. Repeat until you feel a shift — even a small one counts.',
  },
  {
    id: 'default_grounding',
    title: '5-4-3-2-1 Grounding',
    type: 'text',
    hasTimer: false,
    instruction:
      'Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. Each sense pulls you further into the present moment — the one place the spiral can\'t follow.',
  },
  {
    id: 'default_write',
    title: 'Empty It Out',
    type: 'writing',
    hasTimer: false,
    instruction:
      "Write whatever is in your head right now. Don't edit it. Just move it from inside to outside. You don't have to solve anything — just get it out of your body and onto the page.",
  },
]
