require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { initDatabase } = require('./src/database');
const { initRedis } = require('./src/cache');

// Routes
const authRoutes = require('./src/routes/auth');
const onboardingRoutes = require('./src/routes/onboarding');
const emoraRoutes = require('./src/routes/emora');
const rescueModeRoutes = require('./src/routes/rescue-mode');
const actionLabRoutes = require('./src/routes/action-lab');
const insightTabsRoutes = require('./src/routes/insight-tabs');
const patternReportRoutes = require('./src/routes/pattern-report');
const week1Routes = require('./src/routes/week1');
const notificationRoutes = require('./src/routes/notifications');

// Jobs
require('./src/jobs/pattern-report-scheduler');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Trust proxy (required for correct IP detection behind Railway/Render) ──
app.set('trust proxy', 1);

// ─── Security Middleware ───────────────────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));

const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, health checks)
    if (!origin) return callback(null, true);
    // In development, allow any localhost port (Vite may pick a different port if 5173 is taken)
    if (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin)) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Global rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' }
});
app.use('/api', limiter);

// Tighter limit for AI routes (cost protection)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: { error: 'AI request limit reached. Please wait a moment.' }
});
app.use('/api/emora', aiLimiter);
app.use('/api/action-lab/next', aiLimiter);

// Issue #2: Tight auth rate limit — prevents brute-force and email enumeration at scale
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: 'Too many auth attempts. Please wait a minute.' },
  skipSuccessfulRequests: true // only count failed/suspicious requests toward the limit
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/send-otp', authLimiter);
app.use('/api/auth/verify-otp', authLimiter);

// ─── Health Check ─────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'unclinq-api',
    timestamp: new Date().toISOString(),
    ai: {
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY
    }
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/emora', emoraRoutes);
app.use('/api/rescue', rescueModeRoutes);
app.use('/api/action-lab', actionLabRoutes);
app.use('/api/insight-tabs', insightTabsRoutes);
app.use('/api/pattern-report', patternReportRoutes);
app.use('/api/week1', week1Routes);
app.use('/api/notifications', notificationRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Something went wrong. Please try again.'
      : err.message
  });
});

// ─── Boot ─────────────────────────────────────────────────────────────────
async function boot() {
  try {
    // Fail fast in production if JWT_SECRET is missing
    if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
      console.error('FATAL: JWT_SECRET environment variable is required in production.');
      process.exit(1);
    }

    await initDatabase();
    console.log('✓ Database connected');

    await initRedis();
    console.log('✓ Redis connected');

    app.listen(PORT, () => {
      console.log(`\n🧠 Unclinq API running on port ${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   Anthropic: ${process.env.ANTHROPIC_API_KEY ? '✓' : '✗ (add ANTHROPIC_API_KEY)'}`);
      console.log(`   Gemini: ${process.env.GEMINI_API_KEY ? '✓' : '✗ (add GEMINI_API_KEY)'}`);
    });
  } catch (error) {
    console.error('Failed to boot:', error);
    process.exit(1);
  }
}

boot();
