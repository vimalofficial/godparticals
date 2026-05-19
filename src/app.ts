import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import userOnboardRoutes  from './modules/user/onboard/routes';
import adminOnboardRoutes from './modules/admin/onboard/routes';

import adminProductRoutes from './modules/admin/products/routes';
import userProductRoutes  from './modules/user/products/routes';
import paymentRoutes from './modules/user/payments/routes';
import cartRoutes     from './modules/user/cart/routes';
import wishlistRoutes from './modules/user/wishlist/routes';




const app: Application = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/v1/user/onboard',  userOnboardRoutes);
app.use('/api/v1/admin/onboard', adminOnboardRoutes);

app.use('/api/v1/admin/products', adminProductRoutes);
app.use('/api/v1/user/products',  userProductRoutes);

app.use('/api/v1/user/cart',     cartRoutes);
app.use('/api/v1/user/wishlist', wishlistRoutes);


app.use('/api/v1/user/payment', paymentRoutes);




// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

// Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);

  res.status(500).json({
    status: 'error',
    message: err.message || 'Internal server error',
  });
});

export default app;
