import { Router, type RequestHandler } from 'express';
import carRoutes from './car.routes';
import feedbackRoutes from './feedback.routes'
import authRoutes from './auth.routes';
import adminRoutes from './admin.routes';
import notificationRoutes from './notification.rotes';
import orderRoutes from './order.routes';

export const apiRouter = Router();

apiRouter.use('/cars', carRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use("/mail", feedbackRoutes);
apiRouter.use("/admin", adminRoutes);
apiRouter.use("/notifications", notificationRoutes);
apiRouter.use('/orders', orderRoutes);


const health: RequestHandler = (_req, res) => { res.json({ ok: true }); };
apiRouter.get('/health', health);
