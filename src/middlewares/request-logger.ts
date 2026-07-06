/**
 * 请求日志中间件：记录每个请求的方法、路径、状态码、耗时。
 *
 * 中间件签名固定为 (req, res, next)：
 *   - 处理完自己的事后，必须调用 next() 把控制权交给下一个中间件，
 *     否则请求会「卡住」永远没有响应。
 */

import type { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  // res 的 'finish' 事件：响应发送完毕时触发。此时才能拿到最终状态码和总耗时。
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${ms}ms`);
  });

  next(); // 放行，交给下一个中间件/路由
}
