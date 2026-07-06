/**
 * 路由总入口：把各个资源的子路由聚合起来，统一挂在 /api 前缀下。
 * 以后新增资源（如 users），只需在这里 use 一行。
 */

import { Router } from 'express';
import { healthRouter } from './health.routes.js';

export const apiRouter = Router();

// GET /api/health → healthRouter
apiRouter.use('/health', healthRouter);

// 未来：apiRouter.use('/users', userRouter);
