/**
 * SESSION MANAGER
 * Manages live Emora conversations in Redis.
 * Each session holds the active message window (last 12 messages).
 * Older history lives as AI-extracted summaries in PostgreSQL.
 */

const { cache } = require('../cache');

const SESSION_TTL = 60 * 60 * 3; // 3 hours
const MAX_MESSAGES = 12;

async function getOrCreateSession(userId) {
  const key = `session:${userId}`;
  const raw = await cache.get(key);

  if (raw) {
    return JSON.parse(raw);
  }

  return {
    messages: [],
    phase: 'receive', // receive | reflect | challenge
    rescue_bridged: false,
    crisis_flagged: false,
    started_at: Date.now(),
    message_count: 0
  };
}

async function saveSession(userId, session) {
  const key = `session:${userId}`;
  await cache.set(key, JSON.stringify(session), SESSION_TTL);
}

async function addMessage(userId, role, content) {
  const session = await getOrCreateSession(userId);

  session.messages.push({
    role,
    content,
    ts: Date.now()
  });

  session.message_count = (session.message_count || 0) + 1;

  // Keep rolling window of last MAX_MESSAGES
  if (session.messages.length > MAX_MESSAGES) {
    session.messages = session.messages.slice(-MAX_MESSAGES);
  }

  // Auto-advance conversation phase
  if (role === 'assistant') {
    if (session.message_count >= 4 && session.phase === 'receive') {
      session.phase = 'reflect';
    }
  }

  await saveSession(userId, session);
  return session;
}

async function clearSession(userId) {
  const key = `session:${userId}`;
  const raw = await cache.get(key);
  const session = raw ? JSON.parse(raw) : null;
  await cache.del(key);
  return session;
}

/**
 * Builds the message array for the Claude API call.
 * Injects profile snapshot as a context update at the start.
 */
function buildMessagesForClaude(session, profileSnapshot) {
  return [
    // Profile snapshot injected as initial context exchange
    {
      role: 'user',
      content: `<context_update>\n${profileSnapshot}\n</context_update>\n\nAcknowledge this context.`
    },
    {
      role: 'assistant',
      content: "I have their current context. Ready."
    },
    // Actual conversation
    ...session.messages
  ];
}

module.exports = {
  getOrCreateSession,
  saveSession,
  addMessage,
  clearSession,
  buildMessagesForClaude
};
