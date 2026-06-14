import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env';

// Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/users.routes';
import activityRoutes from './routes/activities.routes';
import aiRoutes from './routes/ai.routes';
import socialRoutes from './routes/social.routes';
import chatRoutes from './routes/chat.routes';
import paymentRoutes from './routes/payments.routes';

// Middleware
import { errorHandler } from './middleware/errorHandler';

const app = express();

// ─── Core middleware ──────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

// Raw body for Stripe webhooks (must come before express.json)
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ──────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/activities', aiRoutes);       // AI routes nested under activities
app.use('/api/friendships', socialRoutes);
app.use('/api/activities', chatRoutes);     // Chat routes nested under activities
app.use('/api/payments', paymentRoutes);

// ─── Error handling ───────────────────────────────────────────
app.use(errorHandler);

export default app;
