/**
 * 路由层：定义「什么路径 + 什么方法」交给「哪个控制器函数」。
 * 路由只做映射，不写逻辑。
 */

import { Router } from 'express';
import { healthCheck } from '../controllers/health.controller.js';

// Router 是 Express 提供的「迷你 app」，可以单独定义一组路由再挂载到主 app 上。
export const healthRouter = Router();

// 这里的 '/' 是相对路径。挂载时会加上前缀（见 routes/index.ts），
// 最终对外是 GET /api/health。
healthRouter.get('/', healthCheck);
