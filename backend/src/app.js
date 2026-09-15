import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import path from 'path';
import { fileURLToPath } from 'url';

import { apiLimiter } from './middleware/rateLimiter.js';
import errorHandler from './middleware/errorHandler.js';
import notFound from './middleware/notFound.js';
import { uploadsDir } from './middleware/upload.js';
import { stripeWebhook, cashfreeWebhook } from './controllers/paymentController.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import { reviewRoutes } from './routes/reviewRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Behind a reverse proxy (Render, Heroku, Nginx) in production so that
// secure cookies & rate limiting see the real client IP/protocol.
app.set('trust proxy', 1);

// ---------- Security & core middleware ----------
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(compression());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Stripe & Razorpay webhooks need the RAW body for signature verification,
// so they must be registered before the JSON body parser below.
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), stripeWebhook);
app.post('/api/payments/cashfree-webhook', express.raw({ type: 'application/json' }), cashfreeWebhook);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());
app.use('/api', apiLimiter);

// Serve locally-stored images (used only when Cloudinary is not configured)
app.use('/uploads', express.static(uploadsDir));

// ---------- Health check ----------
app.get('/api/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'API is healthy', data: { uptime: process.uptime() } });
});

// ---------- API routes ----------
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);

// ---------- 404 + centralized error handler ----------
app.use(notFound);
app.use(errorHandler);

export default app;
