const Redis = require('ioredis');

let redis;
let redisAvailable = false;

// In-memory fallback used when Redis is unavailable.
// Keeps TTL-aware entries so cache semantics stay consistent within a process session.
const memStore = new Map(); // key → { value, expiresAt (ms) | null }

function memGet(key) {
  const entry = memStore.get(key);
  if (!entry) return null;
  if (entry.expiresAt && Date.now() > entry.expiresAt) {
    memStore.delete(key);
    return null;
  }
  return entry.value;
}

function memSet(key, value, ttlSeconds) {
  memStore.set(key, {
    value,
    expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null
  });
}

function memDel(key) {
  memStore.delete(key);
}

// Prune expired keys every 5 minutes to prevent unbounded memory growth
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of memStore) {
    if (v.expiresAt && now > v.expiresAt) memStore.delete(k);
  }
}, 5 * 60 * 1000).unref();

async function initRedis() {
  redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true,
    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 200, 1000);
    }
  });

  redis.on('error', (err) => {
    if (err.code !== 'ECONNREFUSED') {
      console.error('Redis error:', err.message);
    }
  });

  try {
    await redis.connect();
    await redis.ping();
    redisAvailable = true;
  } catch (error) {
    console.warn('Redis unavailable — using in-memory cache fallback (sessions persist in-process only)');
  }

  return redis;
}

function getRedis() {
  return redis;
}

// Cache wrappers: use Redis when available, fall back to in-memory Map
const cache = {
  async get(key) {
    if (!redisAvailable) return memGet(key);
    try {
      return await redis.get(key);
    } catch { return memGet(key); }
  },
  async set(key, value, ttlSeconds) {
    if (!redisAvailable) { memSet(key, value, ttlSeconds); return true; }
    try {
      if (ttlSeconds) {
        await redis.setex(key, ttlSeconds, value);
      } else {
        await redis.set(key, value);
      }
      return true;
    } catch { memSet(key, value, ttlSeconds); return true; }
  },
  async del(key) {
    if (!redisAvailable) { memDel(key); return true; }
    try {
      await redis.del(key);
      return true;
    } catch { memDel(key); return true; }
  },
  // Atomic set-if-not-exists with TTL. Returns true if key was set (lock acquired).
  // Falls back to in-memory NX semantics when Redis is unavailable.
  async setnx(key, value, ttlSeconds) {
    if (!redisAvailable) {
      if (memGet(key) !== null) return false; // key exists
      memSet(key, value, ttlSeconds);
      return true;
    }
    try {
      const result = await redis.set(key, value, 'EX', ttlSeconds, 'NX');
      return result === 'OK';
    } catch {
      // Redis error mid-flight: fall back to in-memory
      if (memGet(key) !== null) return false;
      memSet(key, value, ttlSeconds);
      return true;
    }
  }
};

module.exports = { initRedis, getRedis, cache };
