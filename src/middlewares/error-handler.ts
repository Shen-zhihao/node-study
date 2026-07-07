/**
 * 全局错误处理中间件——所有错误的「统一出口」。
 *
 * 它有一个特殊签名：4 个参数 (err, req, res, next)。Express 正是靠「参数个数为 4」
 * 来识别它是错误处理中间件，所以它必须挂在所有路由/中间件【之后】（见 app.ts）。
 *
 * 错误怎么流到这里？
 *   - 业务代码 throw / Promise reject（Express 5 会自动捕获 async 里的 reject 并转发到这里）
 *   - 校验中间件 next(new ValidationError(...))
 *   - Service 里 Prisma 抛出的数据库错误
 *
 * 这里做的事：把各种来源的错误，统一翻译成我们约定的错误信封 + 恰当的 HTTP 状态码。
 */

import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors.js';
import { Prisma } from '../generated/prisma/client.js';
import type { ErrorBody } from '../lib/api-response.js';
import { isProd } from '../config/env.js';

// 注意：即使不用 next，错误处理中间件也【必须】保留第 4 个参数，否则 Express 不认它。
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = '服务器内部错误';
  let details: unknown;

  if (err instanceof AppError) {
    // 我们自己抛的可预期错误：直接用它携带的状态码和信息。
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Prisma 的已知错误：把最常见的两个错误码翻译成合适的 HTTP 状态。
    if (err.code === 'P2002') {
      // 唯一约束冲突（如 email 重复）
      statusCode = 409;
      code = 'CONFLICT';
      // meta.target 有时是字段名数组，有时（如某些驱动）拿不到，做兜底。
      const target = (err.meta?.target as string[] | undefined)?.join(', ');
      message = target ? `${target} 已存在` : '资源已存在（违反唯一约束）';
    } else if (err.code === 'P2025') {
      // 操作依赖的记录不存在（如更新/删除一个不存在的 id）
      statusCode = 404;
      code = 'NOT_FOUND';
      message = '目标记录不存在';
    }
  }

  // 5xx 属于「意料之外」，需要打日志方便排查；4xx 是客户端问题，不必刷屏。
  if (statusCode >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl}`, err);
  }

  const body: ErrorBody = {
    success: false,
    error: {
      code,
      message,
      // 生产环境不暴露 details（可能含内部信息）；开发环境返回，方便调试。
      ...(details !== undefined && !isProd ? { details } : {}),
    },
  };

  res.status(statusCode).json(body);
}
