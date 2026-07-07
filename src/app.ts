/**
 * app.ts：组装 Express 应用（挂载中间件 + 路由），但【不监听端口】。
 *
 * 为什么不在这里 listen？
 *   - 测试时（Step 11）可以直接把这个 app 交给 supertest 发请求，无需占用端口。
 *   - 「组装」与「启动」分离，职责清晰，app 可复用。
 *
 * ⚠️ 中间件/路由的注册【顺序】很重要，请求会按注册顺序依次穿过。
 */

import express, { type Express } from 'express';
import { apiRouter } from './routes/index.js';
import { requestLogger } from './middlewares/request-logger.js';
import { notFoundHandler } from './middlewares/not-found.js';
import { errorHandler } from './middlewares/error-handler.js';

export function createApp(): Express {
  const app = express();

  // ① 全局中间件（对所有请求生效）
  app.use(express.json()); // 解析 JSON 请求体 → req.body。这是 Step 1 原生写法要手动处理的痛点之一。
  app.use(requestLogger); // 打印每个请求的日志

  // ② 业务路由，统一挂在 /api 前缀下
  app.use('/api', apiRouter);

  // ③ 404 兜底：必须放在所有路由「之后」（它会抛 NotFoundError 交给下面的错误处理器）
  app.use(notFoundHandler);

  // ④ 全局错误处理：必须放在【最后】。它有特殊的 4 个参数签名 (err, req, res, next)，
  //    Express 靠参数个数识别它，所有 throw / reject / next(err) 最终都汇聚到这里。
  app.use(errorHandler);

  return app;
}
