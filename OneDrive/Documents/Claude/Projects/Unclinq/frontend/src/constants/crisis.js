/**
 * CRISIS RESOURCES
 * Single source of truth used across Home, Emora, and any future screens.
 * Keep in sync with backend/src/constants/crisis.js
 */

export const CRISIS_RESOURCES = [
  {
    name: 'iCall',
    region: 'India',
    detail: '9152987821',
    href: 'tel:9152987821',
    type: 'phone',
  },
  {
    name: 'Vandrevala Foundation',
    region: 'India',
    detail: '1860-2662-345 · 24/7',
    href: 'tel:18602662345',
    type: 'phone',
  },
  {
    name: 'Crisis Text Line',
    region: 'US / Canada',
    detail: 'Text HOME to 741741',
    href: 'sms:741741?body=HOME',
    type: 'text',
  },
  {
    name: 'Befrienders Worldwide',
    region: 'International',
    detail: 'befrienders.org',
    href: 'https://www.befrienders.org',
    type: 'web',
  },
]
