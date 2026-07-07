/**
 * 404 兜底中间件：当所有路由都没匹配上时，走到这里。
 * 必须挂在「所有路由之后」——中间件按注册顺序执行，前面都没命中才轮到它。
 *
 * Step 7 起，它不再自己拼响应，而是抛一个 NotFoundError，交给全局错误处理中间件，
 * 这样「找不到路径」和「找不到资源」返回的错误信封格式完全一致。
 */

import type { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../lib/errors.js';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new NotFoundError(`路径不存在: ${req.method} ${req.originalUrl}`));
}
