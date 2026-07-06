/**
 * 404 兜底中间件：当所有路由都没匹配上时，走到这里。
 * 必须挂在「所有路由之后」——中间件是按注册顺序执行的，前面都没命中才轮到它。
 */

import type { Request, Response } from 'express';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    message: `路径不存在: ${req.method} ${req.originalUrl}`,
  });
}
